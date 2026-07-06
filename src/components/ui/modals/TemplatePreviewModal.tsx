import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle2 } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Template } from "@/store/useWorkspaceStore"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: Template | null
  onUse: (template: Template) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export function TemplatePreviewModal({ 
  isOpen, 
  onClose, 
  template,
  onUse,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}: TemplatePreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext])

  if (!template) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-[#0f172a] rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/50 dark:border-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            {hasPrev && (
              <button 
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:scale-105 backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50 hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && (
              <button 
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:scale-105 backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50 hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Left Image Side */}
            <div className="flex-1 bg-slate-100 dark:bg-[#090e1a] relative flex items-center justify-center p-8 overflow-hidden">
              <motion.div 
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full max-w-full max-h-full flex items-center justify-center"
              >
                <ImageWithFallback 
                  src={template.thumbnail} 
                  alt={template.title}
                  fallbackTitle={template.title}
                  category={template.category}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                />
              </motion.div>
            </div>

            {/* Right Info Side */}
            <div className="w-full md:w-[380px] bg-white dark:bg-[#0f172a] p-8 flex flex-col border-l border-slate-200/50 dark:border-white/5">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-4 border border-slate-200/50 dark:border-slate-700/50">
                  <FileText className="w-3.5 h-3.5" />
                  {template.category}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                  {template.title}
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                  {template.description}
                </p>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fully Editable
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> High Quality Vector
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Print Ready
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <Button 
                  onClick={() => onUse(template)}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-shadow"
                >
                  Use Template
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
