import { useRef, useEffect, useState } from "react"
import { Search, Plus, MoreHorizontal, Layers, ArrowRight, Settings, FileText, Image as ImageIcon, FilePlus, Copy, RefreshCw, ChevronDown, ChevronUp, Image as SizeIcon, ListOrdered, Info, Download, Trash2, RotateCw, History, Clock, ArrowLeft, X, DownloadCloud, Check, File, GripVertical, Scissors } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import * as pdfjsLib from "pdfjs-dist"
import { motion, AnimatePresence } from "framer-motion"
import { OpenRecentModal, BlankPagePopoverContent, PageDetailsPopoverContent } from "@/components/ui/modals/QuickActionModals"
import { SplitDocumentModal } from "@/components/ui/modals/SplitDocumentModal"
import { ExportSectionModal } from "@/components/ui/modals/ExportSectionModal"
import { RotatePagesModal } from "@/components/ui/modals/RotatePagesModal"
import { DeletePagesModal } from "@/components/ui/modals/DeletePagesModal"
import { mergePdfs, imagesToPdf, appendBlankPage, duplicatePdfPage, duplicatePdfPages, reorderPdfPages, deletePdfPages, rotatePdfPages } from "@/lib/pdfActions"
import type { BlankPageConfig } from "@/lib/pdfActions"
import { useToastStore } from "@/store/useToastStore"
import { getPdfFromDB } from "@/lib/db"
import { PDFDocument } from 'pdf-lib'
import { PagesTour, getActiveTourSteps } from "@/components/ui/tour/PagesTour"
import { usePagesTour } from "@/hooks/usePagesTour"

export function PagesPanel() {
  const { 
    pdfDocument, pdfFile, numPages, setPdfDocument, setPdfFile, setZoom, currentPage, setCurrentPage, 
    setActiveTool, pushDocumentToHistory, pushFullStateToHistory, duplicatePageAnnotations,
    selectedPages, setSelectedPages, lastSelectedPage, setLastSelectedPage, zoom
  } = useWorkspaceStore()
  const { toast } = useToastStore()
  const { startTour, tourPermanentlyDone, isActive: isTourActive, currentStep: tourStep } = usePagesTour()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlusOpen, setIsPlusOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isRecentOpen, setIsRecentOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [plusMenuState, setPlusMenuState] = useState<"main" | "recent" | "blankPage">("main")
  const [recentFiles, setRecentFiles] = useState<any[]>([])

  const [thumbnailSize, setThumbnailSize] = useState<'small' | 'medium' | 'large'>('large')
  const [sortOrder, setSortOrder] = useState<'pageNumber' | 'newest' | 'oldest'>('pageNumber')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [moreMenuState, setMoreMenuState] = useState<'main' | 'details'>('main')
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const savedSize = localStorage.getItem('viewix_thumbnail_size') as any;
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) setThumbnailSize(savedSize);
    
    const savedSort = localStorage.getItem('viewix_sort_order') as any;
    if (savedSort && ['pageNumber', 'newest', 'oldest'].includes(savedSort)) setSortOrder(savedSort);
    
    const savedCollapse = localStorage.getItem('viewix_pages_collapsed');
    if (savedCollapse !== null) setIsCollapsed(savedCollapse === 'true');
  }, []);

  // Sync single selection with scroll position
  useEffect(() => {
    if (currentPage !== null && selectedPages.length <= 1 && selectedPages[0] !== currentPage) {
      setSelectedPages([currentPage]);
    }
  }, [currentPage, selectedPages.length]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('viewix_thumbnail_size', thumbnailSize);
    localStorage.setItem('viewix_sort_order', sortOrder);
    localStorage.setItem('viewix_pages_collapsed', String(isCollapsed));
  }, [thumbnailSize, sortOrder, isCollapsed]);

  const formatTime = (ms: number) => {
    const diff = Math.floor((Date.now() - ms) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} mins ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }
  
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, page: number} | null>(null)

  // Tour Step 5 (index 4) — "Page Actions": auto-open the overlay on the first thumbnail
  // so the user can see what appears when they right-click a page
  const filteredPagesRef = useRef<number[]>([])
  useEffect(() => {
    if (!isTourActive) { setContextMenu(null); return }
    const activeSteps = getActiveTourSteps(numPages)
    const currentStepId = activeSteps[tourStep]?.id
    if (currentStepId === 'page-actions') {
      // Open the overlay on the first visible page
      const firstPage = filteredPagesRef.current[0]
      if (firstPage !== undefined) {
        setContextMenu({ x: 0, y: 0, page: firstPage })
      }
    } else {
      setContextMenu(null)
    }
  }, [isTourActive, tourStep, numPages])

  useEffect(() => {
    if (!isTourActive) return
    const activeSteps = getActiveTourSteps(numPages)
    const currentStepId = activeSteps[tourStep]?.id
    if (currentStepId === 'advanced-tools') {
      setIsMoreOpen(true)
      setMoreMenuState('main')
    } else {
      setIsMoreOpen(false)
    }
  }, [isTourActive, tourStep, numPages])

  const mergeInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [hoveredDropIndex, setHoveredDropIndex] = useState<number | null>(null)
  const [showSmartSuggest, setShowSmartSuggest] = useState(false)

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (isPlusOpen && plusMenuRef.current && !plusMenuRef.current.contains(target) && (!plusBtnRef.current || !plusBtnRef.current.contains(target))) {
        setIsPlusOpen(false)
        setTimeout(() => setPlusMenuState("main"), 200)
      }
      if (isMoreOpen && moreMenuRef.current && !moreMenuRef.current.contains(target) && (!moreBtnRef.current || !moreBtnRef.current.contains(target))) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener("mousedown", handleGlobalClick)
    return () => document.removeEventListener("mousedown", handleGlobalClick)
  }, [isPlusOpen, isMoreOpen])

  const handleMerge = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !pdfFile) return
    setIsPlusOpen(false)
    setIsProcessing(true)
    toast({ title: "Merging PDF", description: "Merging documents...", type: "info" })
    try {
      const mergedFile = await mergePdfs(pdfFile, files[0])
      await loadNewPdf(mergedFile)
      toast({ title: "Success", description: "PDFs merged successfully.", type: "success" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to merge PDF.", type: "error" })
    }
    setIsProcessing(false)
    if (mergeInputRef.current) mergeInputRef.current.value = ""
  }

  const handleImagesToPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setIsPlusOpen(false)
    setIsProcessing(true)
    toast({ title: "Converting Images", description: `Converting ${files.length} images to PDF...`, type: "info" })
    try {
      const convertedFile = await imagesToPdf(files)
      await loadNewPdf(convertedFile)
      toast({ title: "Success", description: "Images converted to PDF successfully.", type: "success" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to convert images.", type: "error" })
    }
    setIsProcessing(false)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleCreateBlankPage = async (config: BlankPageConfig) => {
    if (!pdfFile || !pdfDocument) return
    setIsProcessing(true)
    toast({ title: "Creating Page", description: "Generating blank page...", type: "info" })
    try {
      pushDocumentToHistory()
      const newFile = await appendBlankPage(pdfFile, config)
      await loadNewPdf(newFile)
      
      // Auto-navigate and enable tools
      const newPageNumber = numPages + 1
      setCurrentPage(newPageNumber)
      setActiveTool("freedraw")
      
      // Scroll PDF viewer if possible
      setTimeout(() => {
        const element = document.getElementById(`page-${newPageNumber}`)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 500)
      
      toast({ title: "Success", description: "Blank page created successfully.", type: "success" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to create blank page.", type: "error" })
    }
    setIsProcessing(false)
  }

  const handleDuplicatePage = async (targetPage: number) => {
    if (!pdfFile || !pdfDocument) return
    
    const pagesToDuplicate = selectedPages.includes(targetPage) && selectedPages.length > 0 
      ? selectedPages 
      : [targetPage];
      
    setIsProcessing(true)
    toast({ title: "Duplicating", description: `Duplicating ${pagesToDuplicate.length} page(s)...`, type: "info" })
    try {
      pushFullStateToHistory()
      
      // If single page, duplicate annotations too
      if (pagesToDuplicate.length === 1) {
        duplicatePageAnnotations(pagesToDuplicate[0])
      }
      
      const newFile = await duplicatePdfPages(pdfFile, pagesToDuplicate)
      await loadNewPdf(newFile)
      
      // Scroll to the first duplicated page
      const firstDuplicated = Math.min(...pagesToDuplicate) + 1;
      setCurrentPage(firstDuplicated)
      
      setTimeout(() => {
        const element = document.getElementById(`page-${firstDuplicated}`)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 500)
      
      toast({ title: "Success", description: "Page(s) duplicated successfully.", type: "success" })
      
      if (pagesToDuplicate.length === 1) {
        setShowSmartSuggest(true)
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to duplicate page(s).", type: "error" })
    }
    setIsProcessing(false)
  }

  const handleDeletePages = () => {
    setIsDeleteModalOpen(true)
    setContextMenu(null)
  }

  const handleRotatePages = async (targetPage: number) => {
    if (!pdfFile || !pdfDocument) return;
    
    const pagesToRotate = selectedPages.includes(targetPage) && selectedPages.length > 0 
      ? selectedPages 
      : [targetPage];
      
    setIsProcessing(true);
    toast({ title: "Rotating", description: "Rotating pages...", type: "info" });
    try {
      pushFullStateToHistory();
      const newFile = await rotatePdfPages(pdfFile, pagesToRotate, 90);
      await loadNewPdf(newFile);
      toast({ title: "Success", description: "Pages rotated successfully.", type: "success" });
    } catch(e) {
      console.error("Rotate error:", e);
      toast({ title: "Error", description: "Failed to rotate pages.", type: "error" });
    }
    setIsProcessing(false);
    setContextMenu(null);
  }

  const handleExtractPdf = async (targetPage: number) => {
    if (!pdfDocument || !pdfFile) return;
    
    const pagesToExtract = selectedPages.includes(targetPage) && selectedPages.length > 0 
      ? [...selectedPages].sort((a, b) => a - b) 
      : [targetPage];
      
    try {
      const originalPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      
      const newPdfDoc = await PDFDocument.create();
      const indices = pagesToExtract.map(p => p - 1); 
      
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, indices);
      copiedPages.forEach(page => newPdfDoc.addPage(page));
      
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `extracted_pages_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Export Successful", description: `Exported ${pagesToExtract.length} page(s) to PDF.`, type: "success" });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast({ title: "Export Failed", description: "Could not export as PDF.", type: "error" });
    }
  }

  const handleExtractPng = async (targetPage: number) => {
    if (!pdfFile) return;
    
    const pagesToExtract = selectedPages.includes(targetPage) && selectedPages.length > 0 
      ? [...selectedPages].sort((a, b) => a - b) 
      : [targetPage];
      
    try {
      toast({ title: "Exporting", description: `Exporting ${pagesToExtract.length} page(s) as PNG...`, type: "info" });
      const url = URL.createObjectURL(pdfFile);
      const doc = await pdfjsLib.getDocument({ url }).promise;
      
      for (const p of pagesToExtract) {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 2.0 }); // High res for export
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `page_${p}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: `Exported ${pagesToExtract.length} page(s) to PNG.`, type: "success" });
    } catch (error) {
      console.error("PNG Export error:", error);
      toast({ title: "Export Failed", description: "Could not export as PNG.", type: "error" });
    }
  }

  const loadNewPdf = async (file: File) => {
    const url = URL.createObjectURL(file)
    const doc = await pdfjsLib.getDocument({ url }).promise
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setPdfDocument(doc)
    setPdfFile(file)
  }

  const handleOpenRecent = async (fileName: string) => {
    try {
      const file = await getPdfFromDB(fileName)
      if (file) {
        await loadNewPdf(file)
        toast({ title: "Document Opened", description: `Loaded ${fileName}`, type: "success" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load document", type: "error" })
    }
    setIsProcessing(false)
  }

  const handleReorder = async (pagesToMove: number[], dropIndex: number) => {
    if (!pdfFile || !pdfDocument) return;
    const remaining = pagesArray.filter(p => !pagesToMove.includes(p));
    const sortedToMove = [...pagesToMove].sort((a, b) => a - b);
    
    // Calculate the new order
    // Note: If some of the items being moved were BEFORE the dropIndex,
    // the dropIndex in the remaining array represents the insertion point.
    // However, if we drag a bundle down, the visual drop index is based on the currently rendered items.
    // Let's accurately map it.
    
    // We are dropping at `dropIndex` in the visual list.
    // Let's construct a target array with placeholders.
    const visualOrder = pagesArray.filter(p => true); // Copy
    const itemsBeforeDrop = visualOrder.slice(0, dropIndex).filter(p => !pagesToMove.includes(p));
    const itemsAfterDrop = visualOrder.slice(dropIndex).filter(p => !pagesToMove.includes(p));
    
    const newOrder = [...itemsBeforeDrop, ...sortedToMove, ...itemsAfterDrop];
    
    if (newOrder.join(',') === pagesArray.join(',')) return;
    
    setIsProcessing(true);
    toast({ title: "Reordering", description: "Updating document...", type: "info" });
    try {
      pushFullStateToHistory();
      useWorkspaceStore.getState().reorderPageAnnotations(newOrder);
      const newFile = await reorderPdfPages(pdfFile, newOrder);
      await loadNewPdf(newFile);
      toast({ title: "Success", description: "Pages reordered.", type: "success" });
    } catch(e) {
      toast({ title: "Error", description: "Failed to reorder.", type: "error" });
    }
    setIsProcessing(false);
  }

  const handleDragStart = (page: number) => {
    if (!selectedPages.includes(page)) {
      setSelectedPages([page]);
    }
    setDraggedPage(page);
  };

  const handleDrag = (e: any, info: any) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const y = info.point.y;
    
    // Auto scroll
    const rect = container.getBoundingClientRect();
    if (y < rect.top + 50) {
      container.scrollTop -= 10;
    } else if (y > rect.bottom - 50) {
      container.scrollTop += 10;
    }
    
    // Compute drop index based on visual elements
    const children = Array.from(container.querySelectorAll('.thumbnail-wrapper'));
    let dropIndex = filteredPages.length;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      if (y < childRect.top + childRect.height / 2) {
        dropIndex = i;
        break;
      }
    }
    setHoveredDropIndex(dropIndex);
  };

  const handleDragEnd = async () => {
    if (hoveredDropIndex === null || !draggedPage) {
      setDraggedPage(null);
      setHoveredDropIndex(null);
      return;
    }
    
    const selected = selectedPages.includes(draggedPage) ? selectedPages : [draggedPage];
    await handleReorder(selected, hoveredDropIndex);
    
    setDraggedPage(null);
    setHoveredDropIndex(null);
  };

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1)
  const sortedPages = [...pagesArray].sort((a, b) => {
    if (sortOrder === 'pageNumber' || sortOrder === 'oldest') {
      return a - b;
    } else {
      return b - a;
    }
  });
  const filteredPages = sortedPages.filter(p => p.toString().includes(searchQuery))
  filteredPagesRef.current = filteredPages // keep ref in sync for tour

  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    e.preventDefault();
    if (e.shiftKey && lastSelectedPage !== null) {
      const start = Math.min(lastSelectedPage, pageNumber);
      const end = Math.max(lastSelectedPage, pageNumber);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedPages(Array.from(new Set([...selectedPages, ...range])));
    } else if (e.ctrlKey || e.metaKey) {
      if (selectedPages.includes(pageNumber)) {
        setSelectedPages(selectedPages.filter(p => p !== pageNumber));
      } else {
        setSelectedPages([...selectedPages, pageNumber]);
      }
      setLastSelectedPage(pageNumber);
    } else {
      setSelectedPages([pageNumber]);
      setLastSelectedPage(pageNumber);
      setCurrentPage(pageNumber);
      const element = document.getElementById(`page-${pageNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Close context menu on any click outside (but not while tour is showing it on page-actions step)
  useEffect(() => {
    const closeContext = () => {
      // Don't close while the tour is actively showing the overlay on page-actions step
      const { isActive, currentStep } = usePagesTour.getState()
      const { numPages: currentNumPages } = useWorkspaceStore.getState()
      const activeSteps = getActiveTourSteps(currentNumPages)
      if (isActive && activeSteps[currentStep]?.id === 'page-actions') return
      setContextMenu(null)
    }
    window.addEventListener('click', closeContext)
    return () => window.removeEventListener('click', closeContext)
  }, [])

  // Keyboard navigation for More Menu
  useEffect(() => {
    if (!isMoreOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
        return;
      }
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const menu = moreMenuRef.current;
        if (!menu) return;
        
        const focusableElements = menu.querySelectorAll('button:not([disabled])');
        const elementsArray = Array.from(focusableElements) as HTMLElement[];
        if (elementsArray.length === 0) return;
        
        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = elementsArray.indexOf(activeElement);
        
        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndex < 0 || currentIndex === elementsArray.length - 1 ? 0 : currentIndex + 1;
          elementsArray[nextIndex].focus();
        } else {
          const prevIndex = currentIndex <= 0 ? elementsArray.length - 1 : currentIndex - 1;
          elementsArray[prevIndex].focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Auto focus first item on open
    const timer = setTimeout(() => {
      if (moreMenuRef.current) {
        const firstBtn = moreMenuRef.current.querySelector('button:not([disabled])') as HTMLElement;
        if (firstBtn) firstBtn.focus();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    }
  }, [isMoreOpen]);

  return (
    <aside id="tour-pages-panel" className={cn(
      "scroll-trigger h-full flex flex-col bg-white/60 dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto transition-all duration-300 ease-in-out relative shrink-0",
      "w-[200px]"
    )}>
      
      <input type="file" className="hidden" accept=".pdf" ref={mergeInputRef} onChange={handleMerge} />
      <input type="file" className="hidden" accept="image/*" multiple ref={imageInputRef} onChange={handleImagesToPdf} />

      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/5 shrink-0 transition-colors duration-500 bg-white/40 dark:bg-slate-900/40 z-[60] relative">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 transition-colors duration-500">Pages</h3>
          <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-500">{numPages}</span>
        </div>
        <div className="flex items-center gap-1 relative">
          <button 
            ref={plusBtnRef}
            onClick={() => setIsPlusOpen(!isPlusOpen)}
            className={cn("h-7 w-7 rounded flex items-center justify-center transition-colors", isPlusOpen ? "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10")}
          >
            <Plus className="h-4 w-4" />
          </button>
          
          <button 
            ref={moreBtnRef}
            id="tour-more-menu-btn"
            onClick={() => {
              if (!isMoreOpen) setMoreMenuState('main');
              setIsMoreOpen(!isMoreOpen);
            }}
            className={cn(
              "h-7 w-7 rounded flex items-center justify-center transition-all", 
              isMoreOpen ? "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Plus Popover */}
          <AnimatePresence>
            {isPlusOpen && (
              <>
                <motion.div
                  ref={plusMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn("absolute top-9 left-0 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1 overflow-hidden transition-all duration-300", 
                    plusMenuState === "blankPage" ? "w-[280px]" : "w-56"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {plusMenuState === "main" ? (
                      <motion.div key="main" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="flex flex-col gap-1 w-full">
                        <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Content</span>
                        </div>
                        <PopoverItem icon={FilePlus} label="Import Another PDF" onClick={() => mergeInputRef.current?.click()} />
                        <PopoverItem icon={ImageIcon} label="Convert Images to PDF" onClick={() => imageInputRef.current?.click()} />
                        <PopoverItem icon={History} label="Open Recent" onClick={() => { 
                          const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
                          setRecentFiles(stored)
                          setPlusMenuState("recent")
                        }} />
                        <PopoverItem icon={FileText} label="Blank Page" onClick={() => { setPlusMenuState("blankPage"); }} />
                        <PopoverItem icon={Copy} label="Duplicate Current Page" onClick={() => { setIsPlusOpen(false); setPlusMenuState("main"); handleDuplicatePage(currentPage); }} />
                      </motion.div>
                    ) : plusMenuState === "recent" ? (
                      <motion.div key="recent" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="flex flex-col gap-1 w-full max-h-[300px]">
                        <div className="px-2 py-1 flex items-center gap-2 mb-1 border-b border-slate-100 dark:border-white/5">
                          <button onClick={(e) => { e.stopPropagation(); setPlusMenuState("main") }} className="p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                             <ArrowLeft className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Files</span>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
                          {recentFiles.length === 0 ? (
                            <div className="text-center py-4 text-slate-500 text-[10px]">No recent files</div>
                          ) : (
                            recentFiles.map((file, i) => (
                               <button 
                                 key={i}
                                 onClick={(e) => { e.stopPropagation(); setIsPlusOpen(false); setTimeout(() => setPlusMenuState("main"), 200); handleOpenRecent(file.name); }}
                                 className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg flex flex-col transition-colors group"
                               >
                                 <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{file.name}</span>
                                 <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{formatTime(file.timestamp)}</span>
                               </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    ) : plusMenuState === "blankPage" ? (
                      <motion.div key="blankPage" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="flex flex-col gap-1 w-full">
                        <BlankPagePopoverContent onClose={() => setPlusMenuState("main")} onCreate={(config) => { handleCreateBlankPage(config); setIsPlusOpen(false); setTimeout(() => setPlusMenuState("main"), 200); }} />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* More Popover */}
          <AnimatePresence>
            {isMoreOpen && (
              <>
                <motion.div
                  id="tour-more-menu-popup"
                  ref={moreMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-9 left-8 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1 overflow-hidden"
                >
                  {moreMenuState === 'main' ? (
                    <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 max-h-[400px] w-full">
                      <PopoverItem icon={RefreshCw} label="Refresh Pages" onClick={() => { setIsMoreOpen(false); toast({ title: "Refreshed", description: "Thumbnail cache cleared.", type: "success" }) }} />
                      <PopoverItem icon={ChevronUp} label="Collapse All" onClick={() => { setIsCollapsed(true); setIsMoreOpen(false); toast({ title: "All pages collapsed.", type: "success" }); }} disabled={isCollapsed} />
                      <PopoverItem icon={ChevronDown} label="Expand All" onClick={() => { setIsCollapsed(false); setIsMoreOpen(false); }} disabled={!isCollapsed} />
                      
                      <div className="px-2 mt-2 mb-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thumbnail Size</span>
                      </div>
                      <PopoverItem icon={SizeIcon} label="Small" active={thumbnailSize === 'small'} onClick={() => { setThumbnailSize('small'); setIsMoreOpen(false); }} />
                      <PopoverItem icon={SizeIcon} label="Medium" active={thumbnailSize === 'medium'} onClick={() => { setThumbnailSize('medium'); setIsMoreOpen(false); }} />
                      <PopoverItem icon={SizeIcon} label="Large" active={thumbnailSize === 'large'} onClick={() => { setThumbnailSize('large'); setIsMoreOpen(false); }} />
  
                      <div className="px-2 mt-2 mb-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort Pages</span>
                      </div>
                      <PopoverItem icon={ListOrdered} label="Page Number" active={sortOrder === 'pageNumber'} onClick={() => { setSortOrder('pageNumber'); setIsMoreOpen(false); }} />
                      <PopoverItem icon={Clock} label="Newest" active={sortOrder === 'newest'} onClick={() => { setSortOrder('newest'); setIsMoreOpen(false); }} />
                      <PopoverItem icon={Clock} label="Oldest" active={sortOrder === 'oldest'} onClick={() => { setSortOrder('oldest'); setIsMoreOpen(false); }} />
  
                      <div className="px-2 mt-2 mb-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Information</span>
                      </div>
                      <PopoverItem icon={Info} label="Page Details" onClick={() => setMoreMenuState('details')} />
                      
                      <div id="tour-advanced-tools-group" className="flex flex-col gap-1">
                        <div className="px-2 mt-2 mb-1 border-b border-slate-100 dark:border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">Future Features</span>
                        </div>
                        <PopoverItem icon={Scissors} label="Split Document" onClick={() => { setIsSplitModalOpen(true); setIsMoreOpen(false); }} />
                        <PopoverItem icon={Download} label="Export Pages" onClick={() => { setIsExportModalOpen(true); setIsMoreOpen(false); }} />
                        <PopoverItem icon={RotateCw} label="Rotate Pages" onClick={() => { setIsRotateModalOpen(true); setIsMoreOpen(false); }} />
                        <PopoverItem icon={Trash2} label="Delete Pages" danger onClick={() => { setIsDeleteModalOpen(true); setIsMoreOpen(false); }} />
                      </div>
                    </div>
                  ) : (
                    <PageDetailsPopoverContent 
                      onBack={() => setMoreMenuState('main')} 
                      pageNumber={currentPage || 1} 
                      pdfDocument={pdfDocument} 
                      currentZoom={zoom || 1} 
                    />
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 shrink-0 z-0" id="tour-search-pages">
        <div className="flex items-center gap-2 rounded-lg bg-white/80 dark:bg-black/20 px-2.5 py-1.5 border border-slate-200 dark:border-white/5 focus-within:border-blue-300 dark:focus-within:border-white/20 transition-colors">
          <Search className="h-3 w-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search pages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200 transition-colors duration-500"
          />
        </div>
      </div>

      {/* Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar relative" id="thumbnails-container">
        {!pdfDocument || isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-50">
            <Settings className="h-8 w-8 mb-4 animate-spin-slow" />
            <p className="text-xs text-center">{isProcessing ? "Processing Document..." : "Loading document..."}</p>
          </div>
        ) : (
          <div className={cn(
            "pt-2 relative grid",
            (thumbnailSize === 'small' && !isCollapsed) ? "grid-cols-2 gap-3" : "grid-cols-1 gap-4",
            isCollapsed && "gap-2"
          )}>
            {filteredPages.length > 0 ? filteredPages.map((pageNumber, index) => (
              <div
                key={pageNumber}
                className="thumbnail-wrapper relative"
                id={index === 0 ? 'tour-first-thumbnail' : index === 1 ? 'tour-second-thumbnail' : undefined}
              >
                {/* Drop Indicator (Above) */}
                {hoveredDropIndex === index && draggedPage !== null && (
                  <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-40 transition-all"></div>
                )}
                {/* Drop Indicator (Below Last Item) */}
                {hoveredDropIndex === filteredPages.length && index === filteredPages.length - 1 && draggedPage !== null && (
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-40 transition-all"></div>
                )}
                
                <Thumbnail 
                  pageNumber={pageNumber} 
                  thumbnailSize={thumbnailSize}
                  isCollapsed={isCollapsed}
                  isCurrent={currentPage === pageNumber}
                  isSelected={selectedPages.includes(pageNumber)}
                  isDragging={draggedPage === pageNumber}
                  dragSelectionCount={selectedPages.includes(pageNumber) ? selectedPages.length : 1}
                  setCurrentPage={setCurrentPage}
                  pdfDocument={pdfDocument}
                  onClick={(e: React.MouseEvent) => handlePageClick(e, pageNumber)}
                  onDragStart={() => handleDragStart(pageNumber)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle the overlay menu
                    if (contextMenu?.page === pageNumber) {
                      setContextMenu(null);
                    } else {
                      setContextMenu({ x: 0, y: 0, page: pageNumber });
                    }
                    
                    if (!selectedPages.includes(pageNumber)) {
                       setSelectedPages([pageNumber]);
                       setLastSelectedPage(pageNumber);
                    }
                  }}
                  onDoubleClick={() => setZoom(1.5)}
                  isMenuOpen={contextMenu?.page === pageNumber}
                  onCloseMenu={() => setContextMenu(null)}
                  onDuplicate={() => { handleDuplicatePage(pageNumber); setContextMenu(null); }}
                  onRotate={() => { handleRotatePages(pageNumber); setContextMenu(null); }}
                  onExtractPdf={() => { handleExtractPdf(pageNumber); setContextMenu(null); }}
                  onExtractPng={() => { handleExtractPng(pageNumber); setContextMenu(null); }}
                  onDelete={() => { handleDeletePages(); setContextMenu(null); }}
                />
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-xs">No pages found matching "{searchQuery}"</div>
            )}
            
            {/* Bottom Pro Feature Card — hidden permanently after "Don't show again" */}
            <AnimatePresence>
              {!tourPermanentlyDone && (
                <motion.div
                  key="organize-pages-card"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className={cn(thumbnailSize === 'small' && !isCollapsed && "col-span-2")}
                >
                  <div 
                    onClick={() => startTour()}
                    className="mt-6 bg-gradient-to-br from-white to-[#F4F8FF] dark:from-[#1e293b] dark:to-[#0f172a] border border-[#DCE8FF] dark:border-blue-900/30 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgba(37,99,235,0.06)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.1)] hover:border-blue-200 dark:border-blue-800 backdrop-blur-md"
                    id="tour-organize-card"
                  >
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-70"></div>
                    
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-white dark:bg-slate-800 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-sm dark:shadow-md relative z-10">
                      <Layers className="h-4 w-4" />
                    </div>
                    
                    <div className="flex flex-col z-10 flex-1 min-w-0 justify-center">
                      <h4 className="text-[12px] font-bold text-[#111827] dark:text-slate-100 mb-0.5 leading-tight truncate">Organize Pages</h4>
                      <p className="text-[9.5px] leading-snug text-[#6B7280] dark:text-slate-400 mb-1.5 line-clamp-2">
                        Reorder, merge, or remove pages visually.
                      </p>
                      
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] dark:text-blue-400 transition-colors">
                        <span>Try it now</span> 
                        <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedPages.length > 1 && !isCollapsed && (
          <motion.div 
            id="tour-bulk-action-bar"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-white/10 p-2 z-[60] flex flex-col gap-1.5 overflow-hidden"
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-white tracking-wide uppercase">
                {selectedPages.length} Pages Selected
              </span>
              <button 
                onClick={() => {
                  setSelectedPages([currentPage || 1])
                  setLastSelectedPage(currentPage || 1)
                }}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 p-1 rounded-md"
                title="Clear Selection"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-1">
              <OverlayButton size="bulk" icon={Copy} label="Duplicate" onClick={() => handleDuplicatePage(selectedPages[0])} />
              <OverlayButton size="bulk" icon={RotateCw} label="Rotate" onClick={() => handleRotatePages(selectedPages[0])} />
              <OverlayButton size="bulk" icon={DownloadCloud} label="Export" onClick={() => handleExtractPdf(selectedPages[0])} />
              <OverlayButton size="bulk" icon={Trash2} label="Delete" danger onClick={handleDeletePages} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Suggestion Card */}
      <AnimatePresence>
        {showSmartSuggest && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-blue-100 dark:border-blue-900/30 p-3 z-50 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                <span>✨</span> <span>Page duplicated!</span>
              </div>
              <button onClick={() => setShowSmartSuggest(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
              You now have similar pages. Would you like to organize your pages in a grid?
            </p>
            <div className="flex gap-2 mt-1">
              <button onClick={() => { setShowSmartSuggest(false); useWorkspaceStore.getState().setIsOrganizeMode(true); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                Organize Pages
              </button>
              <button onClick={() => setShowSmartSuggest(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OpenRecentModal isOpen={isRecentOpen} onClose={() => setIsRecentOpen(false)} onSelect={handleOpenRecent} />
      <ExportSectionModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} selectedPages={selectedPages} currentPage={currentPage!} />
      <SplitDocumentModal isOpen={isSplitModalOpen} onClose={() => setIsSplitModalOpen(false)} selectedPages={selectedPages} />
      <RotatePagesModal isOpen={isRotateModalOpen} onClose={() => setIsRotateModalOpen(false)} selectedPages={selectedPages} currentPage={currentPage} />
      <DeletePagesModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} selectedPages={selectedPages} currentPage={currentPage} />
      <PagesTour />
    </aside>
  )
}

function PopoverItem({ icon: Icon, label, comingSoon, danger, active, disabled, onClick }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering parent clicks
    if (!comingSoon && !disabled && onClick) onClick(e);
  }
  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-between w-full px-2 py-1.5 rounded-lg transition-colors text-left group",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white dark:hover:bg-slate-700/50",
        danger && !disabled && "hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300",
        active && "bg-blue-50/50 dark:bg-blue-900/20"
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={cn("h-3.5 w-3.5 transition-colors", danger ? "text-red-400" : active ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500 dark:text-slate-500")} />
        <span className={cn("text-xs font-medium", danger ? "" : active ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white")}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {comingSoon && (
          <span className="text-[8px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Soon</span>
        )}
        {active && (
          <Check className="h-3.5 w-3.5 text-blue-500" />
        )}
      </div>
    </button>
  )
}

function OverlayButton({ icon: Icon, label, danger, onClick, size = 'large' }: any) {
  const isLarge = size === 'large'
  const isBulk = size === 'bulk'
  
  return (
    <button 
      onClick={(e) => { if (onClick) onClick(e) }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg transition-all duration-200 active:scale-95 border relative group/btn",
        isLarge ? "gap-1 rounded-xl py-2.5 px-1" : isBulk ? "py-2 rounded-xl" : "gap-0.5 p-0.5",
        danger 
          ? "bg-red-500/10 dark:bg-red-500/10 hover:bg-red-500/20 dark:hover:bg-red-500/20 border-red-200/40 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200" 
          : "bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/15 border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon className={cn(isLarge ? "h-4 w-4" : "h-4 w-4")} />
      
      {isLarge && (
        <span className="font-bold uppercase leading-none text-center w-full truncate text-[9px] tracking-wider">
          {label}
        </span>
      )}
      
      {/* Tooltip for bulk size */}
      {isBulk && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[70] scale-95 group-hover/btn:scale-100 duration-200 flex items-center justify-center">
          {label}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45 rounded-sm" />
        </div>
      )}
    </button>
  )
}

function Thumbnail({ pageNumber, thumbnailSize, isCollapsed, onContextMenu, onClick, onDoubleClick, isCurrent, isSelected, isDragging, dragSelectionCount, onDragStart, onDrag, onDragEnd, pdfDocument, isMenuOpen, onCloseMenu, onDuplicate, onRotate, onExtractPdf, onExtractPng, onDelete }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [exportMode, setExportMode] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) {
      const timer = setTimeout(() => setExportMode(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null
    
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return
      
      try {
        const page = await pdfDocument.getPage(pageNumber)
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return
        
        const viewport = page.getViewport({ scale: 0.3 })
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        renderTask = page.render({ canvasContext: context, viewport })
        await renderTask.promise
      } catch (e) {
        if (e instanceof pdfjsLib.RenderingCancelledException) return
        console.error("Error rendering thumbnail", e)
      }
    }
    
    renderPage()
    
    return () => {
      if (renderTask) renderTask.cancel()
    }
  }, [pdfDocument, pageNumber])

  useEffect(() => {
    if (isCurrent) {
      const el = document.getElementById(`thumbnail-${pageNumber}`)
      const container = document.getElementById('thumbnails-container')
      if (el && container) {
        const elRect = el.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        if (elRect.top < containerRect.top + 40 || elRect.bottom > containerRect.bottom - 40) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [isCurrent, pageNumber])

  return (
    <motion.div 
      id={`thumbnail-${pageNumber}`}
      drag="y"
      dragSnapToOrigin
      dragElastic={0.1}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      style={{ zIndex: isDragging ? 50 : 1 }}
      className={cn(
        "w-full relative transition-all duration-300 group cursor-pointer",
        isCollapsed 
          ? [
              "p-2.5 rounded-xl",
              isSelected ? "bg-blue-600 text-white shadow-md" : 
              isCurrent ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30" : 
              "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
            ]
          : [
              "p-1 rounded-xl",
              (isCurrent || isSelected) ? "opacity-100" : "opacity-60 hover:opacity-100 dark:opacity-70 dark:hover:opacity-100"
            ],
        isDragging && "shadow-2xl opacity-90 scale-105 cursor-grabbing"
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
    >

      {isDragging && dragSelectionCount > 1 && (
         <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-xl z-30 ring-2 ring-white dark:ring-[#1e293b]">
           {dragSelectionCount}
         </div>
      )}

      {/* Collapsed List Item UI */}
      <div className={cn("flex w-full items-center justify-between", !isCollapsed && "hidden")}>
        <div className="flex items-center gap-3 relative z-10 pointer-events-none">
           <File className={cn("w-4 h-4", isSelected ? "text-white/80" : isCurrent ? "text-blue-500" : "text-slate-400")} />
           <span className="text-xs font-semibold">Page {pageNumber}</span>
        </div>
        <GripVertical className={cn("w-4 h-4 relative z-10 pointer-events-none", isSelected ? "text-white/50" : isCurrent ? "text-blue-500/50" : "text-slate-500")} />
      </div>

      {/* Expanded Thumbnail Card UI */}
      <div className={cn("flex flex-col items-center gap-2 w-full", isCollapsed && "hidden")}>
        <motion.div 
          animate={{ height: (thumbnailSize === 'small' ? 90 : thumbnailSize === 'medium' ? 130 : "auto"), minHeight: (thumbnailSize === 'small' ? 90 : thumbnailSize === 'medium' ? 130 : 200) }}
          className={cn(
          "bg-white dark:bg-slate-800/80 rounded-lg overflow-hidden transition-all duration-300 w-full flex items-center justify-center p-2 relative shadow-md dark:shadow-lg",
          isSelected ? "ring-[3px] ring-blue-500 ring-offset-2 ring-offset-blue-50 dark:ring-offset-[#1e293b]" : 
          isCurrent ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#1e293b]" : 
          "ring-1 ring-slate-200 dark:ring-white/10 hover:ring-blue-400 dark:hover:ring-blue-400 hover:ring-2"
        )}>
          <div className={cn("absolute inset-0 bg-black/5 dark:bg-slate-900/10 transition-opacity duration-300", isMenuOpen && "opacity-0")}></div>
          <canvas 
            ref={canvasRef} 
            className={cn(
              "max-w-full max-h-full object-contain drop-shadow-sm z-10 pointer-events-none transition-opacity duration-300",
              isMenuOpen ? "opacity-0" : "opacity-100"
            )} 
          />

          {/* Overlay Menu — responsive to thumbnailSize */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={cn(
                  "absolute inset-0 z-40 flex flex-col rounded-lg overflow-hidden",
                  "bg-slate-100/92 dark:bg-slate-900/95",
                  "backdrop-blur-xl backdrop-saturate-150",
                )}
              >
                <AnimatePresence mode="wait">
                  {!exportMode ? (
                    <motion.div
                      key="main-menu"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex flex-col h-full",
                        thumbnailSize === 'large' ? 'p-1.5' : 'p-1'
                      )}
                    >
                      {/* Header — close button for all sizes */}
                      <div className={cn(
                        "flex justify-between items-center",
                        thumbnailSize === 'small' ? 'mb-0.5 px-0.5' : thumbnailSize === 'medium' ? 'mb-0.5 px-0.5' : 'mb-0.5 px-1 pt-0.5'
                      )}>
                        <span className={cn(
                          "font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]",
                          thumbnailSize === 'small' ? 'text-[6px]' : thumbnailSize === 'medium' ? 'text-[7px]' : 'text-[8px]'
                        )}>Page {pageNumber}</span>
                        <button onClick={(e) => { e.stopPropagation(); onCloseMenu(); }} className="w-4 h-4 rounded flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      
                      {/* Actions: 2×2 grid for all sizes */}
                      <div className={cn(
                        "grid grid-cols-2 flex-1",
                        thumbnailSize === 'small' ? 'gap-0.5' : thumbnailSize === 'medium' ? 'gap-0.5' : 'gap-1'
                      )}>
                        <OverlayButton size={thumbnailSize} icon={Copy} label="Duplicate" onClick={(e: any) => { e.stopPropagation(); onDuplicate(); }} />
                        <OverlayButton size={thumbnailSize} icon={DownloadCloud} label="Export" onClick={(e: any) => { e.stopPropagation(); setExportMode(true); }} />
                        <OverlayButton size={thumbnailSize} icon={RotateCw} label="Rotate" onClick={(e: any) => { e.stopPropagation(); onRotate(); }} />
                        <OverlayButton size={thumbnailSize} icon={Trash2} label="Delete" danger onClick={(e: any) => { e.stopPropagation(); onDelete(); }} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="export-menu"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex flex-col h-full",
                        thumbnailSize === 'large' ? 'p-1.5' : 'p-1'
                      )}
                    >
                      {/* Back header */}
                      <div className={cn(
                        "flex items-center",
                        thumbnailSize === 'small' ? 'mb-0.5 px-0.5' : 'mb-0.5 px-0.5 pt-0.5'
                      )}>
                        <button onClick={(e) => { e.stopPropagation(); setExportMode(false); }} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-md px-1 py-0.5 hover:bg-slate-200/60 dark:hover:bg-white/10">
                          <ArrowLeft className={cn(thumbnailSize === 'large' ? "h-3 w-3" : "h-2.5 w-2.5")} />
                          <span className={cn("font-bold uppercase tracking-wider", thumbnailSize === 'large' ? 'text-[9px]' : 'text-[7px]')}>Back</span>
                        </button>
                      </div>
                      
                      {/* Export options */}
                      <div className={cn("grid grid-cols-2 flex-1", thumbnailSize === 'large' ? 'gap-1' : 'gap-0.5')}>
                        <OverlayButton size={thumbnailSize} icon={FileText} label="PDF" onClick={(e: any) => { e.stopPropagation(); onExtractPdf(); }} />
                        <OverlayButton size={thumbnailSize} icon={ImageIcon} label="PNG" onClick={(e: any) => { e.stopPropagation(); onExtractPng(); }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <span className={cn("text-[10px] font-semibold tracking-wider transition-colors duration-500 pointer-events-none", isSelected || isCurrent ? "text-slate-800 dark:text-slate-200" : "text-slate-500")}>
          {pageNumber}
        </span>
      </div>
    </motion.div>
  )
}
