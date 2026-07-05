import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, CheckCircle2, ChevronRight, File, Archive, Loader2, Layers, ListOrdered, MousePointerClick, Settings2, FileImage, Image as ImageIcon, AlertTriangle, Files } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useToastStore } from '@/store/useToastStore'
import { exportPdfSection, deletePdfPages } from '@/lib/pdfActions'
import type { ExportScope, ExportSectionConfig } from '@/lib/pdfActions'
import { saveAs } from 'file-saver'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

interface ExportSectionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPages?: number[]
  currentPage: number
}

export function ExportSectionModal({ isOpen, onClose, selectedPages = [], currentPage }: ExportSectionModalProps) {
  const { pdfFile, numPages, annotations, setPdfFile, setPdfDocument, setCurrentPage, pushFullStateToHistory } = useWorkspaceStore()
  const { toast: addToast } = useToastStore()

  const [scope, setScope] = useState<ExportScope>('current-page')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf')
  const [pageRange, setPageRange] = useState<string>('1-5')
  const [customPages, setCustomPages] = useState<string>('1, 3, 5')
  
  const [includeAnnotations, setIncludeAnnotations] = useState(true)
  const [flattenAnnotations, setFlattenAnnotations] = useState(false)
  const [preserveMetadata, setPreserveMetadata] = useState(true)
  const [includeComments, setIncludeComments] = useState(false)
  const [highQuality, setHighQuality] = useState(true)
  const [removeAfterExport, setRemoveAfterExport] = useState(false)
  
  const [pngDpi, setPngDpi] = useState<'standard' | '300' | '600'>('300')
  const [pngTransparent, setPngTransparent] = useState(false)
  const [jpgQuality, setJpgQuality] = useState<'80' | '90' | '100'>('90')

  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsExporting(false)
      setProgress(0)
      setShowConfirm(false)
      if (selectedPages.length > 1) {
        setScope('selected-pages')
      } else {
        setScope('current-page')
      }
    }
  }, [isOpen, selectedPages.length])

  // Compute live preview
  const previewPages = useMemo(() => {
    if (!numPages) return []
    let indices: number[] = []

    if (scope === 'current-page') {
      indices = [currentPage]
    } else if (scope === 'all-pages') {
      indices = Array.from({ length: numPages }, (_, i) => i + 1)
    } else if (scope === 'selected-pages') {
      indices = [...selectedPages].sort((a, b) => a - b)
    } else if (scope === 'page-range') {
      const [start, end] = pageRange.split('-').map(n => parseInt(n.trim(), 10))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let p = start; p <= end; p++) {
          if (p >= 1 && p <= numPages) indices.push(p)
        }
      }
    } else if (scope === 'custom-pages') {
      const parts = customPages.split(',').map(s => s.trim()).filter(s => s)
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10))
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let p = start; p <= end; p++) {
              if (p >= 1 && p <= numPages) indices.push(p)
            }
          }
        } else {
          const p = parseInt(part, 10)
          if (!isNaN(p) && p >= 1 && p <= numPages) indices.push(p)
        }
      }
    }
    
    return [...new Set(indices)].filter(p => p >= 1 && p <= numPages).sort((a, b) => a - b)
  }, [scope, currentPage, selectedPages, pageRange, customPages, numPages])

  const handleExportSubmit = () => {
    if (removeAfterExport) {
      setShowConfirm(true)
    } else {
      executeExport()
    }
  }

  const executeExport = async () => {
    if (!pdfFile) return
    setIsExporting(true)
    setProgress(0)
    setShowConfirm(false)

    try {
      if (exportFormat === 'pdf') {
        const config: ExportSectionConfig = {
          scope,
          targetPage: currentPage,
          selectedPages,
          pageRange,
          customPages,
          includeAnnotations,
          flattenAnnotations,
          preserveMetadata,
          annotations
        }
        
        const file = await exportPdfSection(pdfFile, config, (p) => setProgress(p))
        saveAs(file, file.name)
      } else {
        // Export as Image
        const { pdfDocument } = useWorkspaceStore.getState()
        if (!pdfDocument) throw new Error("No PDF loaded")
        
        const blobs: { name: string, blob: Blob }[] = []
        
        // DPI Scaling
        let scale = 2.0 // Standard (roughly 144 DPI)
        if (exportFormat === 'png') {
          if (pngDpi === '300') scale = 4.166
          if (pngDpi === '600') scale = 8.333
        } else if (exportFormat === 'jpg') {
          scale = highQuality ? 4.166 : 2.0
        }

        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg'
        const qualityVal = exportFormat === 'jpg' ? (parseInt(jpgQuality) / 100) : undefined

        for (let i = 0; i < previewPages.length; i++) {
          const pageNum = previewPages[i]
          const page = await pdfDocument.getPage(pageNum)
          const viewport = page.getViewport({ scale })
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          
          canvas.width = viewport.width
          canvas.height = viewport.height

          // Default PDF.js is transparent unless we fill it
          if (exportFormat === 'jpg' || (exportFormat === 'png' && !pngTransparent)) {
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          
          await page.render({ canvasContext: ctx, viewport }).promise
          
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, qualityVal))
          if (blob) {
            blobs.push({ name: `page_${pageNum}.${exportFormat}`, blob })
          }
          setProgress(((i + 1) / previewPages.length) * 100)
        }
        
        const baseName = pdfFile.name.replace(/\.[^/.]+$/, "")
        if (blobs.length === 1) {
          saveAs(blobs[0].blob, `${baseName}_${blobs[0].name}`)
        } else if (blobs.length > 1) {
          const zip = new JSZip()
          blobs.forEach(b => zip.file(b.name, b.blob))
          const content = await zip.generateAsync({ type: 'blob' })
          saveAs(content, `${baseName}_${exportFormat}s.zip`)
        }
      }
      
      let successMsg = `Successfully exported ${previewPages.length} pages.`

      // Execute Remove Pages
      if (removeAfterExport) {
        const newFile = await deletePdfPages(pdfFile, previewPages)
        const arrayBuffer = await newFile.arrayBuffer()
        const newPdfDoc = await pdfjsLib.getDocument({ 
          data: new Uint8Array(arrayBuffer),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        }).promise
        
        pushFullStateToHistory("Exported and Removed Pages")
        setPdfFile(newFile)
        setPdfDocument(newPdfDoc)
        
        if (currentPage > newPdfDoc.numPages) {
          setCurrentPage(Math.max(1, newPdfDoc.numPages))
        }
        successMsg = `Pages exported and removed from the workspace.`
      }

      addToast({ title: 'Export Complete', description: successMsg, type: 'success' })
      onClose()
    } catch (err) {
      console.error(err)
      addToast({ title: 'Export Failed', description: 'Failed to export pages.', type: 'error' })
    } finally {
      setIsExporting(false)
      setProgress(100)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div key="export-pages-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            className="relative w-full max-w-[1000px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Confirmation Overlay */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl max-w-sm w-full border border-slate-200 dark:border-white/10"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white mb-2">Remove Pages?</h3>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                      This action will export the selected pages into a new document and <strong>remove them from the current workspace</strong>.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={executeExport}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/20"
                      >
                        Export & Remove
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Export Pages</h2>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-1 min-h-[500px]">
              {/* Left Side: Scope Selection */}
              <div className="w-[35%] border-r border-slate-200 dark:border-white/10 p-6 flex flex-col overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Step 1: Select Pages</h3>
                
                <div className="space-y-3 mb-6">
                  <ModeOption 
                    icon={FileImage} 
                    title="Current Page" 
                    desc={`Export only page ${currentPage}`}
                    active={scope === 'current-page'}
                    onClick={() => setScope('current-page')}
                  />
                  <ModeOption 
                    icon={Files} 
                    title="All Pages" 
                    desc={`Export entire document (${numPages} pgs)`}
                    active={scope === 'all-pages'}
                    onClick={() => setScope('all-pages')}
                  />
                  <ModeOption 
                    icon={MousePointerClick} 
                    title="Selected Pages" 
                    desc="Ctrl/Shift+Click in the sidebar to select"
                    active={scope === 'selected-pages'}
                    onClick={() => setScope('selected-pages')}
                    disabled={selectedPages.length === 0}
                  />
                  <ModeOption 
                    icon={ListOrdered} 
                    title="Page Range" 
                    desc="Export a continuous block of pages"
                    active={scope === 'page-range'}
                    onClick={() => setScope('page-range')}
                  />
                  <ModeOption 
                    icon={Layers} 
                    title="Custom Pages" 
                    desc="Export specific comma-separated pages"
                    active={scope === 'custom-pages'}
                    onClick={() => setScope('custom-pages')}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {scope === 'page-range' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Range (e.g. 1-5)</label>
                      <input 
                        type="text" 
                        placeholder="1-5"
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </motion.div>
                  )}
                  
                  {scope === 'custom-pages' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Custom (e.g. 1, 3, 5-7)</label>
                      <input 
                        type="text" 
                        placeholder="1, 3, 5-7"
                        value={customPages}
                        onChange={(e) => setCustomPages(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Middle Side: Settings */}
              <div className="w-[35%] border-r border-slate-200 dark:border-white/10 flex flex-col overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Step 2: Export Format</h3>
                  
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => setExportFormat('pdf')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border", exportFormat === 'pdf' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-600 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>PDF</button>
                    <button onClick={() => setExportFormat('png')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border", exportFormat === 'png' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-600 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>PNG</button>
                    <button onClick={() => setExportFormat('jpg')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all border", exportFormat === 'jpg' ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-600 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>JPEG</button>
                  </div>

                  <AnimatePresence mode="wait">
                    {exportFormat === 'png' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Resolution (DPI)</label>
                          <select value={pngDpi} onChange={(e: any) => setPngDpi(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <option value="standard">Standard (Screen)</option>
                            <option value="300">300 DPI (High Quality)</option>
                            <option value="600">600 DPI (Print Quality)</option>
                          </select>
                        </div>
                        <ToggleOption title="Transparent Background" desc="Only if PDF supports it" checked={pngTransparent} onChange={setPngTransparent} />
                      </motion.div>
                    )}
                    {exportFormat === 'jpg' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Quality</label>
                          <div className="flex gap-2">
                            {['80', '90', '100'].map(val => (
                              <button key={val} onClick={() => setJpgQuality(val as any)} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors", jpgQuality === val ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-500/30 dark:border-indigo-500/50 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-500 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400")}>
                                {val}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Step 3: Export Options</h3>
                  <div className="space-y-3">
                    {exportFormat === 'pdf' && (
                      <>
                        <ToggleOption title="Include Annotations" desc="Keep drawings and highlights" checked={includeAnnotations} onChange={setIncludeAnnotations} />
                        <ToggleOption title="Flatten Annotations" desc="Bake interactive fields into page" checked={flattenAnnotations} onChange={setFlattenAnnotations} />
                        <ToggleOption title="Preserve Metadata" desc="Keep title, author, and keywords" checked={preserveMetadata} onChange={setPreserveMetadata} />
                      </>
                    )}
                    {(exportFormat === 'png' || exportFormat === 'jpg') && (
                      <ToggleOption title="High Quality Rendering" desc="Enhanced anti-aliasing" checked={highQuality} onChange={setHighQuality} />
                    )}
                    <ToggleOption title="Include Comments" desc="Export text comments (Beta)" checked={includeComments} onChange={setIncludeComments} />
                    <div className="my-2 border-t border-slate-100 dark:border-white/5" />
                    <ToggleOption title="Remove After Export" desc="Deletes pages from current file" checked={removeAfterExport} onChange={setRemoveAfterExport} danger />
                  </div>
                </div>
              </div>

              {/* Right Side: Preview */}
              <div className="w-[30%] bg-slate-50 dark:bg-[#0a0f1c] flex flex-col overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Live Preview</h3>
                  </div>
                  <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                    {previewPages.length} Pgs
                  </span>
                </div>
                
                {previewPages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                    <File className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">No pages selected.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm flex-1 overflow-y-auto content-start">
                    <div className="flex flex-wrap gap-2">
                      {previewPages.map(p => (
                        <div key={p} className="w-10 h-12 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition-colors">
                          <span className="text-[9px] text-slate-400 font-normal">Pg</span>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(exportFormat === 'png' || exportFormat === 'jpg') && previewPages.length > 1 && (
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex gap-2 items-start text-indigo-700 dark:text-indigo-300">
                    <Archive className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">Multiple images will be bundled into a ZIP archive automatically.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0f172a] shrink-0 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors mr-3"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportSubmit}
                disabled={isExporting || previewPages.length === 0}
                className={cn("flex items-center gap-2 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95", removeAfterExport ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20", (isExporting || previewPages.length === 0) && "opacity-50 cursor-not-allowed")}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {removeAfterExport ? "Removing..." : "Generating..."}
                  </>
                ) : (
                  <>
                    {removeAfterExport ? "Export & Remove" : `Export ${exportFormat.toUpperCase()}`}
                    <Download className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function ModeOption({ icon: Icon, title, desc, active, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-xl transition-all border text-left",
        disabled ? "opacity-50 cursor-not-allowed border-transparent" :
        active 
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm" 
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] hover:border-indigo-300 dark:hover:border-indigo-500/50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        active ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className={cn("text-sm font-semibold mb-0.5", active ? "text-indigo-900 dark:text-indigo-100" : "text-slate-800 dark:text-slate-200")}>{title}</div>
        <div className={cn("text-xs leading-tight", active ? "text-indigo-700 dark:text-indigo-300/70" : "text-slate-500 dark:text-slate-400")}>{desc}</div>
      </div>
    </button>
  )
}

function ToggleOption({ title, desc, checked, onChange, danger }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
      <div>
        <div className={cn("text-sm font-semibold", danger && checked ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200")}>{title}</div>
        <div className={cn("text-[11px]", danger && checked ? "text-red-500/70 dark:text-red-400/70" : "text-slate-500 dark:text-slate-400")}>{desc}</div>
      </div>
      <div className={cn(
        "w-10 h-5 rounded-full transition-colors relative shadow-inner",
        checked ? (danger ? "bg-red-500" : "bg-indigo-500") : "bg-slate-300 dark:bg-slate-700"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
    </label>
  )
}
