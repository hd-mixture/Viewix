import { motion, AnimatePresence } from "framer-motion"
import { Check, Crown, X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ProPreviewModalProps {
  isOpen: boolean
  onClose: () => void
}

const freeFeatures = [
  "PDF Viewer",
  "Annotation Tools",
  "Export",
  "Search",
  "Page Management"
]

const proFeatures = [
  "Unlimited Cloud Sync",
  "OCR for Image PDFs",
  "AI Document Summaries",
  "Team Collaboration",
  "Version History",
  "Password Protected Sharing",
  "Unlimited Workspaces"
]

export function ProPreviewModal({ isOpen, onClose }: ProPreviewModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-[700px] bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Viewix Pro <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">Roadmap</span>
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-lg mx-auto">
                Viewix Pro is an optional premium tier intended for future expansion. Here is a sneak peek at what we are building for professional users and enterprise teams.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                {/* Free Column */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Free</h3>
                  <ul className="space-y-3">
                    {freeFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Column */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Crown className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                      Pro
                    </h3>
                    <ul className="space-y-3">
                      {proFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-amber-900 dark:text-amber-200 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center px-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  "Viewix is fully functional without Pro. Premium features are planned for professional users and enterprise teams."
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-center">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full max-w-[200px] h-11 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm shadow-md transition-colors"
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
