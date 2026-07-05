import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scissors, Download, FileText, CheckCircle2, ChevronRight, File, Archive, Loader2, Layers, ListOrdered, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useToastStore } from '@/store/useToastStore'
import { splitPdf } from '@/lib/pdfActions'
import type { SplitMode, SplitConfig } from '@/lib/pdfActions'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface SplitDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPages?: number[]
}

export function SplitDocumentModal({ isOpen, onClose, selectedPages = [] }: SplitDocumentModalProps) {
  const { pdfFile, numPages, addRecentFile, setPdfFile } = useWorkspaceStore()
  const { toast: addToast } = useToastStore()

  const [mode, setMode] = useState<SplitMode>('every-page')
  const [targetPage, setTargetPage] = useState<number>(selectedPages.length === 1 ? selectedPages[0] : 1)
  const [pageRanges, setPageRanges] = useState<string>('1-2, 3-5')

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedFiles, setGeneratedFiles] = useState<File[]>([])
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(false)
      setProgress(0)
      setGeneratedFiles([])
      setShowSuccessScreen(false)
      if (selectedPages.length > 1) {
        setMode('custom-selected')
      }
    }
  }, [isOpen, selectedPages.length])

  // Compute live preview
  const previewGroups = useMemo(() => {
    if (!numPages) return []
    const groups: { title: string, pages: number[] }[] = []

    if (mode === 'every-page') {
      for (let i = 1; i <= numPages; i++) {
        groups.push({ title: `Document ${i}`, pages: [i] })
      }
    } else if (mode === 'after-page') {
      if (targetPage >= 1 && targetPage < numPages) {
        const part1 = Array.from({ length: targetPage }, (_, i) => i + 1)
        const part2 = Array.from({ length: numPages - targetPage }, (_, i) => i + targetPage + 1)
        groups.push({ title: 'Part 1', pages: part1 })
        groups.push({ title: 'Part 2', pages: part2 })
      } else {
        groups.push({ title: 'Original Document', pages: Array.from({ length: numPages }, (_, i) => i + 1) })
      }
    } else if (mode === 'custom-selected') {
      if (selectedPages.length > 0) {
        const sorted = [...selectedPages].sort((a, b) => a - b)
        groups.push({ title: 'Extracted Document', pages: sorted })
      }
    } else if (mode === 'page-range') {
      const ranges = pageRanges.split(',').map(s => s.trim()).filter(s => s)
      ranges.forEach((range, idx) => {
        const pages: number[] = []
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim(), 10))
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let p = start; p <= end; p++) {
              if (p >= 1 && p <= numPages) pages.push(p)
            }
          }
        } else {
          const p = parseInt(range, 10)
          if (!isNaN(p) && p >= 1 && p <= numPages) pages.push(p)
        }
        if (pages.length > 0) {
          groups.push({ title: `Document ${idx + 1}`, pages })
        }
      })
    }
    return groups
  }, [mode, targetPage, pageRanges, selectedPages, numPages])

  const handleGenerate = async () => {
    if (!pdfFile) return
    setIsGenerating(true)
    setProgress(0)

    try {
      const config: SplitConfig = {
        mode,
        targetPage,
        pageRanges,
        customSelectedPages: selectedPages
      }

      const files = await splitPdf(pdfFile, config, (p) => setProgress(p))
      setGeneratedFiles(files)
      setShowSuccessScreen(true)
      addToast({ title: 'Split Complete', description: `Successfully created ${files.length} documents.`, type: 'success' })
    } catch (err) {
      console.error(err)
      addToast({ title: 'Error', description: 'Failed to split document.', type: 'error' })
    } finally {
      setIsGenerating(false)
      setProgress(100)
    }
  }

  const handleDownloadZip = async () => {
    if (generatedFiles.length === 0) return
    const zip = new JSZip()
    generatedFiles.forEach(file => {
      zip.file(file.name, file)
    })
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${pdfFile?.name.replace(/\.[^/.]+$/, "")}_split.zip`)
    onClose()
  }

  const handleOpenInViewix = () => {
    if (generatedFiles.length === 0) return

    // Add all to recent files
    generatedFiles.forEach(file => {
      addRecentFile(file)
    })

    // Open the first one
    setPdfFile(generatedFiles[0])

    addToast({ title: 'Opened Document', description: `Opened ${generatedFiles[0].name}. Other parts saved to Recent Files.`, type: 'info' })
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div key="split-document-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Split Document</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex h-[500px]">

              {/* Success Screen */}
              <AnimatePresence>
                {showSuccessScreen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-white dark:bg-[#0f172a] z-10 flex flex-col items-center justify-center p-8 rounded-b-2xl"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Split Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
                      Successfully generated {generatedFiles.length} PDF documents from your original file. What would you like to do with them?
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={handleDownloadZip}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                      >
                        <Archive className="w-5 h-5" />
                        Download as ZIP
                      </button>
                      <button
                        onClick={handleOpenInViewix}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-6 py-3 rounded-xl font-medium transition-all"
                      >
                        <FileText className="w-5 h-5" />
                        Open in Viewix
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Left Side: Controls */}
              <div className="w-1/2 border-r border-slate-200 dark:border-white/10 p-6 flex flex-col h-full overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Split Mode</h3>

                <div className="space-y-3 mb-8">
                  <ModeOption
                    icon={Layers}
                    title="Every Page"
                    desc="Extract each page into a separate PDF"
                    active={mode === 'every-page'}
                    onClick={() => setMode('every-page')}
                  />
                  <ModeOption
                    icon={Scissors}
                    title="After Selected Page"
                    desc="Split into two documents at a specific page"
                    active={mode === 'after-page'}
                    onClick={() => setMode('after-page')}
                  />
                  <ModeOption
                    icon={ListOrdered}
                    title="Page Range"
                    desc="Extract specific pages or continuous ranges"
                    active={mode === 'page-range'}
                    onClick={() => setMode('page-range')}
                  />
                  <ModeOption
                    icon={MousePointerClick}
                    title="Custom Selected"
                    desc="Extract currently selected pages from sidebar"
                    active={mode === 'custom-selected'}
                    onClick={() => setMode('custom-selected')}
                    disabled={selectedPages.length === 0}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'after-page' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Split After Page</label>
                      <input
                        type="number"
                        min={1}
                        max={numPages ? numPages - 1 : 1}
                        value={targetPage}
                        onChange={(e) => setTargetPage(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </motion.div>
                  )}

                  {mode === 'page-range' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Page Ranges (e.g. 1-5, 8, 11-13)</label>
                      <input
                        type="text"
                        placeholder="1-5, 8, 11-13"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </motion.div>
                  )}

                  {mode === 'custom-selected' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <span className="font-bold">{selectedPages.length}</span> pages selected for extraction.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || previewGroups.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating ({Math.round(progress)}%)...
                      </>
                    ) : (
                      <>
                        Split PDF
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Side: Live Preview */}
              <div className="w-1/2 bg-slate-50 dark:bg-[#0a0f1c] p-6 h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Live Preview</h3>
                </div>

                {previewGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <File className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">No documents to generate.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {previewGroups.map((group, i) => (
                      <div key={i} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{group.title}</span>
                          <span className="text-xs text-slate-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-full">{group.pages.length} pages</span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                          {group.pages.map(p => (
                            <div key={p} className="w-8 h-10 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] hover:border-blue-300 dark:hover:border-blue-500/50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        active ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className={cn("text-sm font-semibold mb-0.5", active ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200")}>{title}</div>
        <div className={cn("text-xs leading-tight", active ? "text-blue-700 dark:text-blue-300/70" : "text-slate-500 dark:text-slate-400")}>{desc}</div>
      </div>
    </button>
  )
}
