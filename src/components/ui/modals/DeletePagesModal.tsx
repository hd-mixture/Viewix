import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Loader2, FileImage, MousePointerClick, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useToastStore } from '@/store/useToastStore'
import { deletePdfPages } from '@/lib/pdfActions'
import * as pdfjsLib from 'pdfjs-dist'

interface DeletePagesModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPages?: number[]
  currentPage: number
}

type DeleteScope = 'current-page' | 'custom-select'

export function DeletePagesModal({ isOpen, onClose, selectedPages = [], currentPage }: DeletePagesModalProps) {
  const { pdfFile, numPages, setPdfFile, setPdfDocument, pushFullStateToHistory, deletePageAnnotations, setCurrentPage } = useWorkspaceStore()
  const { toast: addToast } = useToastStore()

  const [scope, setScope] = useState<DeleteScope>('current-page')
  const [customSelected, setCustomSelected] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false)
      setScope('current-page')
      // Pre-fill custom selected with the sidebar's selected pages (if multiple)
      if (selectedPages.length > 1) {
        setCustomSelected([...selectedPages])
        setScope('custom-select')
      } else {
        setCustomSelected([])
      }
    }
  }, [isOpen])

  // Toggle a page in custom selection
  const togglePage = (page: number) => {
    setCustomSelected(prev =>
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    )
  }

  // Select all / deselect all
  const allPages = useMemo(() => Array.from({ length: numPages || 0 }, (_, i) => i + 1), [numPages])
  const allSelected = allPages.length > 0 && allPages.every(p => customSelected.includes(p))
  const toggleAll = () => {
    if (allSelected) {
      setCustomSelected([])
    } else {
      setCustomSelected([...allPages])
    }
  }

  // Compute pages to delete
  const pagesToDelete = useMemo(() => {
    if (!numPages) return []
    if (scope === 'current-page') return [currentPage]
    return [...customSelected].filter(p => p >= 1 && p <= numPages).sort((a, b) => a - b)
  }, [scope, currentPage, customSelected, numPages])

  // Validation
  const willDeleteAll = pagesToDelete.length >= (numPages || 1)
  const isValid = pagesToDelete.length > 0 && !willDeleteAll

  const handleDelete = async () => {
    if (!pdfFile || !isValid) return
    setIsDeleting(true)

    try {
      // 1. Physically delete pages from PDF
      const newFile = await deletePdfPages(pdfFile, pagesToDelete)
      
      // 2. Re-align Annotations
      deletePageAnnotations(pagesToDelete)

      // 3. Reload document
      const arrayBuffer = await newFile.arrayBuffer()
      const newPdfDoc = await pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      }).promise
      
      // 4. Determine new current page
      let newCurrentPage = currentPage
      if (pagesToDelete.includes(currentPage)) {
        newCurrentPage = 1
      } else {
        const pagesDeletedBefore = pagesToDelete.filter(p => p < currentPage).length
        newCurrentPage -= pagesDeletedBefore
      }

      // 5. Save to History & update state
      pushFullStateToHistory()
      setPdfFile(newFile)
      setPdfDocument(newPdfDoc)
      setCurrentPage(newCurrentPage)

      addToast({ title: 'Pages Deleted', description: `Deleted ${pagesToDelete.length} page(s) successfully.`, type: 'success' })
      onClose()
    } catch (err: any) {
      console.error(err)
      alert("Error deleting pages: " + (err?.message || 'Unknown error'))
      addToast({ title: 'Deletion Failed', description: 'Failed to delete pages.', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div key="delete-pages-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-[560px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-red-50/50 dark:bg-red-900/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Delete Pages</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{numPages} pages in document</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Scope Selection */}
              <div className="space-y-2.5 mb-5">
                <ModeOption 
                  icon={FileImage} 
                  title="Current Page" 
                  desc={`Only delete page ${currentPage}`} 
                  active={scope === 'current-page'} 
                  onClick={() => setScope('current-page')} 
                />
                <ModeOption 
                  icon={MousePointerClick} 
                  title="Select Pages" 
                  desc="Pick exactly which pages to delete from the grid below" 
                  active={scope === 'custom-select'} 
                  onClick={() => setScope('custom-select')} 
                />
              </div>

              {/* Page Picker Grid */}
              <AnimatePresence>
                {scope === 'custom-select' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      {/* Grid Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/40">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {customSelected.length > 0 ? `${customSelected.length} page${customSelected.length > 1 ? 's' : ''} selected` : 'Click pages to select'}
                        </span>
                        <button
                          onClick={toggleAll}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      {/* Page chips grid */}
                      <div className="p-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {allPages.map(page => {
                          const isSelected = customSelected.includes(page)
                          const isCurrent = page === currentPage
                          return (
                            <motion.button
                              key={page}
                              onClick={() => togglePage(page)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "relative w-10 h-10 rounded-lg text-xs font-bold transition-all border-2 flex items-center justify-center",
                                isSelected
                                  ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/30"
                                  : isCurrent
                                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-400 text-blue-600 dark:text-blue-400"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500"
                              )}
                            >
                              {page}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                                </motion.div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selection summary tags */}
                    {customSelected.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Will delete:</span>
                        {customSelected.sort((a, b) => a - b).map(p => (
                          <span key={p} className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                            Page {p}
                            <button onClick={() => togglePage(p)} className="hover:text-red-900 dark:hover:text-red-100 transition-colors">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning */}
              <AnimatePresence>
                {willDeleteAll && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      You cannot delete every page. At least one page must remain in the document.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {isValid ? `${pagesToDelete.length} page${pagesToDelete.length > 1 ? 's' : ''} will be deleted` : 'No pages selected'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting || !isValid}
                  className={cn("flex items-center gap-2 text-white px-7 py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 bg-red-600 hover:bg-red-700 shadow-red-600/20", (isDeleting || !isValid) && "opacity-50 cursor-not-allowed")}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete {pagesToDelete.length > 0 ? `${pagesToDelete.length} Page${pagesToDelete.length > 1 ? 's' : ''}` : 'Pages'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function ModeOption({ icon: Icon, title, desc, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left",
        active 
          ? "border-red-500 bg-red-50 dark:bg-red-500/10 shadow-sm" 
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] hover:border-red-300 dark:hover:border-red-500/50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg shrink-0",
        active ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-semibold mb-0.5", active ? "text-red-900 dark:text-red-100" : "text-slate-800 dark:text-slate-200")}>{title}</div>
        <div className={cn("text-xs leading-tight", active ? "text-red-700 dark:text-red-300/70" : "text-slate-500 dark:text-slate-400")}>{desc}</div>
      </div>
      <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 transition-all", active ? "border-red-500 bg-red-500" : "border-slate-300 dark:border-slate-600")}>
        {active && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
      </div>
    </button>
  )
}
