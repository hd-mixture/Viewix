import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCw, Loader2, RotateCcw, FileImage, Files, MousePointerClick, ListOrdered, Layers, CornerUpRight, RefreshCcw, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useToastStore } from '@/store/useToastStore'
import { rotatePdfPages } from '@/lib/pdfActions'
import type { ExportScope } from '@/lib/pdfActions'
import * as pdfjsLib from 'pdfjs-dist'

interface RotatePagesModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPages?: number[]
  currentPage: number
}

type RotateAngle = 90 | -90 | 180

export function RotatePagesModal({ isOpen, onClose, selectedPages = [], currentPage }: RotatePagesModalProps) {
  const { pdfFile, pdfDocument, numPages, setPdfFile, setPdfDocument, pushFullStateToHistory, rotatePageAnnotations } = useWorkspaceStore()
  const { toast: addToast } = useToastStore()

  const [scope, setScope] = useState<ExportScope>('current-page')
  const [pageRange, setPageRange] = useState<string>('1-5')
  const [customPages, setCustomPages] = useState<string>('1, 3, 5')
  
  const [angle, setAngle] = useState<RotateAngle>(90)
  const [isRotating, setIsRotating] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsRotating(false)
      setAngle(90)
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

  const handleApply = async () => {
    if (!pdfFile || !pdfDocument || previewPages.length === 0) return
    setIsRotating(true)

    try {
      // 1. Gather pre-rotation dimensions for annotation realignment
      const preRotationDimensions: Record<number, { width: number, height: number }> = {}
      for (const p of previewPages) {
        const page = await pdfDocument.getPage(p)
        const viewport = page.getViewport({ scale: 1 })
        preRotationDimensions[p] = { width: viewport.width, height: viewport.height }
      }

      // 2. Rotate the actual PDF file
      const newFile = await rotatePdfPages(pdfFile, previewPages, angle)
      
      // 3. Re-align Annotations mathematically
      rotatePageAnnotations(previewPages, angle, preRotationDimensions)

      // 4. Update Document
      const arrayBuffer = await newFile.arrayBuffer()
      const newPdfDoc = await pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      }).promise
      
      // 5. Save to History
      pushFullStateToHistory("Rotated Pages")
      setPdfFile(newFile)
      setPdfDocument(newPdfDoc)

      addToast({ title: 'Success', description: `Rotated ${previewPages.length} page(s) successfully.`, type: 'success' })
      onClose()
    } catch (err: any) {
      console.error(err)
      alert("Error applying rotation: " + (err?.message || 'Unknown error'))
      addToast({ title: 'Rotation Failed', description: 'Failed to rotate pages.', type: 'error' })
    } finally {
      setIsRotating(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div key="rotate-pages-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-[900px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Rotate Pages</h2>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-1 min-h-[450px]">
              {/* Left Side: Scope Selection */}
              <div className="w-[40%] border-r border-slate-200 dark:border-white/10 p-6 flex flex-col overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Step 1: Select Pages</h3>
                
                <div className="space-y-3 mb-6">
                  <ModeOption icon={FileImage} title="Current Page" desc={`Page ${currentPage}`} active={scope === 'current-page'} onClick={() => setScope('current-page')} />
                  <ModeOption icon={Files} title="All Pages" desc={`${numPages} pgs`} active={scope === 'all-pages'} onClick={() => setScope('all-pages')} />
                  <ModeOption icon={MousePointerClick} title="Selected Pages" desc="From sidebar" active={scope === 'selected-pages'} onClick={() => setScope('selected-pages')} disabled={selectedPages.length === 0} />
                  <ModeOption icon={ListOrdered} title="Page Range" desc="e.g. 1-5" active={scope === 'page-range'} onClick={() => setScope('page-range')} />
                  <ModeOption icon={Layers} title="Custom Pages" desc="e.g. 1, 3, 5" active={scope === 'custom-pages'} onClick={() => setScope('custom-pages')} />
                </div>

                <AnimatePresence mode="wait">
                  {scope === 'page-range' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                      <input type="text" placeholder="1-5" value={pageRange} onChange={(e) => setPageRange(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                    </motion.div>
                  )}
                  {scope === 'custom-pages' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                      <input type="text" placeholder="1, 3, 5-7" value={customPages} onChange={(e) => setCustomPages(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side: Direction & Preview */}
              <div className="w-[60%] bg-slate-50 dark:bg-[#0a0f1c] flex flex-col overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Step 2: Rotation Direction</h3>
                  
                  <div className="flex gap-3">
                    <button onClick={() => setAngle(-90)} className={cn("flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all", angle === -90 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 shadow-sm" : "bg-white border-slate-200 text-slate-500 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      <RotateCcw className="w-6 h-6 mb-2" />
                      <span className="text-xs font-bold">Left (-90°)</span>
                    </button>
                    <button onClick={() => setAngle(90)} className={cn("flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all", angle === 90 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 shadow-sm" : "bg-white border-slate-200 text-slate-500 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      <RotateCw className="w-6 h-6 mb-2" />
                      <span className="text-xs font-bold">Right (90°)</span>
                    </button>
                    <button onClick={() => setAngle(180)} className={cn("flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all", angle === 180 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 shadow-sm" : "bg-white border-slate-200 text-slate-500 dark:bg-[#1e293b] dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      <RefreshCcw className="w-6 h-6 mb-2" />
                      <span className="text-xs font-bold">180°</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Live Preview</h3>
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
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm flex-1 overflow-y-auto content-start flex justify-center">
                      <div className="flex flex-wrap gap-6 justify-center max-w-[400px]">
                        {previewPages.map((p, idx) => (
                          <motion.div 
                            key={p} 
                            animate={{ rotate: angle }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-16 h-20 rounded-lg bg-slate-100 dark:bg-white/10 border-2 border-slate-300 dark:border-white/20 flex flex-col items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm relative"
                            style={{ originX: 0.5, originY: 0.5 }}
                          >
                            <span className="text-[10px] text-slate-400 font-normal absolute top-2">Pg</span>
                            {p}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex gap-2 items-start text-indigo-700 dark:text-indigo-300">
                    <CornerUpRight className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">Annotations and drawings on the selected pages will be automatically realigned to match the new rotation!</p>
                  </div>
                </div>
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
                onClick={handleApply}
                disabled={isRotating || previewPages.length === 0}
                className={cn("flex items-center gap-2 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20", (isRotating || previewPages.length === 0) && "opacity-50 cursor-not-allowed")}
              >
                {isRotating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    Apply Rotation
                    <RotateCw className="w-4 h-4" />
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
          ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-sm" 
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] hover:border-amber-300 dark:hover:border-amber-500/50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        active ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className={cn("text-sm font-semibold mb-0.5", active ? "text-amber-900 dark:text-amber-100" : "text-slate-800 dark:text-slate-200")}>{title}</div>
        <div className={cn("text-xs leading-tight", active ? "text-amber-700 dark:text-amber-300/70" : "text-slate-500 dark:text-slate-400")}>{desc}</div>
      </div>
    </button>
  )
}
