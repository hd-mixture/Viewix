import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Copy, Trash2, RotateCw, ArrowLeftToLine, ArrowRightToLine, ArrowLeft } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import * as pdfjsLib from "pdfjs-dist"
import { cn } from "@/lib/utils"
import { useToastStore } from "@/store/useToastStore"
import { reorderPdfPages, deletePdfPages, duplicatePdfPage } from "@/lib/pdfActions"

export function OrganizeWorkspace() {
  const { 
    pdfDocument, pdfFile, numPages, setIsOrganizeMode, selectedPages, setSelectedPages, 
    lastSelectedPage, setLastSelectedPage, pushFullStateToHistory, deletePageAnnotations, reorderPageAnnotations, loadNewPdf
  } = useWorkspaceStore()
  const { toast } = useToastStore()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1)
  
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [hoveredDropIndex, setHoveredDropIndex] = useState<number | null>(null)

  // Needs custom wrapper around setPdfDocument to also update file if not in store
  const reloadPdf = async (file: File) => {
    const url = URL.createObjectURL(file)
    const doc = await pdfjsLib.getDocument({ url }).promise
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    useWorkspaceStore.getState().setPdfDocument(doc)
    useWorkspaceStore.getState().setPdfFile(file)
  }

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
    }
  }

  const handleDuplicate = async () => {
    if (!pdfFile || !pdfDocument || selectedPages.length === 0) return;
    setIsProcessing(true);
    toast({ title: "Duplicating", description: "Duplicating pages...", type: "info" });
    try {
      pushFullStateToHistory();
      // Only duplicating the first selected page for simplicity here
      const targetPage = selectedPages[0];
      useWorkspaceStore.getState().duplicatePageAnnotations(targetPage);
      const newFile = await duplicatePdfPage(pdfFile, targetPage);
      await reloadPdf(newFile);
      toast({ title: "Success", description: "Page duplicated.", type: "success" });
    } catch(e) {
      toast({ title: "Error", description: "Failed to duplicate.", type: "error" });
    }
    setIsProcessing(false);
  }

  const handleDelete = async () => {
    if (!pdfFile || !pdfDocument || selectedPages.length === 0) return;
    setIsProcessing(true);
    toast({ title: "Deleting", description: "Deleting pages...", type: "info" });
    try {
      pushFullStateToHistory();
      deletePageAnnotations(selectedPages);
      const newFile = await deletePdfPages(pdfFile, selectedPages);
      await reloadPdf(newFile);
      setSelectedPages([]);
      toast({ title: "Success", description: "Pages deleted.", type: "success" });
    } catch(e) {
      toast({ title: "Error", description: "Failed to delete.", type: "error" });
    }
    setIsProcessing(false);
  }
  
  const handleMoveToBeginning = async () => {
     if (!pdfFile || selectedPages.length === 0) return;
     const remaining = pagesArray.filter(p => !selectedPages.includes(p));
     const sortedToMove = [...selectedPages].sort((a,b) => a-b);
     const newOrder = [...sortedToMove, ...remaining];
     await executeReorder(newOrder);
  }

  const handleMoveToEnd = async () => {
     if (!pdfFile || selectedPages.length === 0) return;
     const remaining = pagesArray.filter(p => !selectedPages.includes(p));
     const sortedToMove = [...selectedPages].sort((a,b) => a-b);
     const newOrder = [...remaining, ...sortedToMove];
     await executeReorder(newOrder);
  }

  const executeReorder = async (newOrder: number[]) => {
    if (!pdfFile || newOrder.join(',') === pagesArray.join(',')) return;
    setIsProcessing(true);
    toast({ title: "Reordering", description: "Updating document...", type: "info" });
    try {
      pushFullStateToHistory();
      reorderPageAnnotations(newOrder);
      const newFile = await reorderPdfPages(pdfFile, newOrder);
      await reloadPdf(newFile);
      setSelectedPages([]);
      toast({ title: "Success", description: "Pages reordered.", type: "success" });
    } catch(e) {
      toast({ title: "Error", description: "Failed to reorder.", type: "error" });
    }
    setIsProcessing(false);
  }

  // Simplified Grid Drag handling
  const handleDrag = (e: any, info: any) => {
    if (!containerRef.current) return;
    const children = Array.from(containerRef.current.querySelectorAll('.grid-thumbnail'));
    let dropIndex = pagesArray.length;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      if (info.point.x < childRect.right && info.point.y < childRect.bottom) {
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
    const remaining = pagesArray.filter(p => !selected.includes(p));
    const sortedToMove = [...selected].sort((a, b) => a - b);
    
    const itemsBeforeDrop = pagesArray.slice(0, hoveredDropIndex).filter(p => !selected.includes(p));
    const itemsAfterDrop = pagesArray.slice(hoveredDropIndex).filter(p => !selected.includes(p));
    
    const newOrder = [...itemsBeforeDrop, ...sortedToMove, ...itemsAfterDrop];
    await executeReorder(newOrder);
    setDraggedPage(null);
    setHoveredDropIndex(null);
  };

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-[#0f172a] z-50 flex flex-col pointer-events-auto">
      {/* Top Toolbar */}
      <div className="h-14 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOrganizeMode(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Organize Pages</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {selectedPages.length} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedPages.length > 0 && (
            <div className="flex items-center gap-1 mr-4 border-r border-slate-200 dark:border-slate-700 pr-4">
              <ActionButton icon={ArrowLeftToLine} label="To Start" onClick={handleMoveToBeginning} />
              <ActionButton icon={ArrowRightToLine} label="To End" onClick={handleMoveToEnd} />
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <ActionButton icon={RotateCw} label="Rotate" onClick={() => toast({ title: "Coming Soon", description: "Rotation is in development.", type: "info" })} />
              <ActionButton icon={Copy} label="Duplicate" onClick={handleDuplicate} />
              <ActionButton icon={Trash2} label="Delete" danger onClick={handleDelete} />
            </div>
          )}
          
          <button onClick={() => setIsOrganizeMode(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <Check className="h-4 w-4" /> Done
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isProcessing ? (
          <div className="h-full flex items-center justify-center text-blue-500 flex-col gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm font-semibold">Updating Document...</p>
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 max-w-[1600px] mx-auto pb-32">
            {pagesArray.map((pageNumber, index) => (
              <div key={pageNumber} className="relative grid-thumbnail">
                {hoveredDropIndex === index && draggedPage !== null && (
                  <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-40"></div>
                )}
                {hoveredDropIndex === pagesArray.length && index === pagesArray.length - 1 && draggedPage !== null && (
                  <div className="absolute -right-3 top-0 bottom-0 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-40"></div>
                )}
                <OrganizeThumbnail 
                  pageNumber={pageNumber} 
                  isSelected={selectedPages.includes(pageNumber)}
                  isDragging={draggedPage === pageNumber}
                  dragSelectionCount={selectedPages.includes(pageNumber) ? selectedPages.length : 1}
                  pdfDocument={pdfDocument}
                  onClick={(e: any) => handlePageClick(e, pageNumber)}
                  onDragStart={() => {
                    if (!selectedPages.includes(pageNumber)) setSelectedPages([pageNumber]);
                    setDraggedPage(pageNumber);
                  }}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrganizeThumbnail({ pageNumber, isSelected, isDragging, dragSelectionCount, pdfDocument, onClick, onDragStart, onDrag, onDragEnd }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return
      try {
        const page = await pdfDocument.getPage(pageNumber)
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return
        const viewport = page.getViewport({ scale: 0.5 }) // Higher resolution for grid
        canvas.width = viewport.width
        canvas.height = viewport.height
        renderTask = page.render({ canvasContext: context, viewport })
        await renderTask.promise
      } catch (e) {}
    }
    renderPage()
    return () => { if (renderTask) renderTask.cancel() }
  }, [pdfDocument, pageNumber])

  return (
    <motion.div 
      drag
      dragSnapToOrigin
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      style={{ zIndex: isDragging ? 50 : 1 }}
      className={cn(
        "flex flex-col items-center gap-3 cursor-pointer group w-full transition-opacity duration-300 p-2 rounded-2xl relative select-none hover:bg-slate-100 dark:hover:bg-white/5",
        isDragging && "shadow-2xl opacity-90 scale-105 cursor-grabbing"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "bg-white rounded-xl overflow-hidden transition-all duration-300 w-full flex items-center justify-center aspect-[1/1.4] p-2 relative shadow-sm dark:shadow-lg",
        "ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-blue-400 group-hover:ring-2"
      )}>
        {isDragging && dragSelectionCount > 1 && (
           <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xl z-30 ring-4 ring-white dark:ring-[#1e293b]">
             {dragSelectionCount}
           </div>
        )}
        <div className="absolute inset-0 bg-black/5"></div>
        <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-sm z-10 pointer-events-none" />
      </div>
      <span className={cn("text-xs font-semibold tracking-wider transition-colors duration-500 pointer-events-none", isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")}>
        {pageNumber}
      </span>
    </motion.div>
  )
}

function ActionButton({ icon: Icon, label, danger, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors group",
        danger ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:hover:text-red-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      )}
    >
      <Icon className="h-4 w-4 mb-1" />
      <span className="text-[9px] font-bold tracking-tight">{label}</span>
    </button>
  )
}
