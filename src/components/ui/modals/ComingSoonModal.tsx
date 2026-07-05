import { motion, AnimatePresence } from "framer-motion"
import { Settings, User, X, ChevronRight, Star } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  type: "settings" | "profile"
}

const contentMap = {
  settings: {
    icon: Settings,
    title: "Settings",
    subtitle: "The Settings workspace is currently under development.",
    features: [
      "Workspace Preferences",
      "Theme & Appearance",
      "Performance Options",
      "Auto Save",
      "Keyboard Shortcuts",
      "Experimental Features"
    ]
  },
  profile: {
    icon: User,
    title: "Profile",
    subtitle: "Your personal workspace is coming soon.",
    features: [
      "User Profile",
      "Account Settings",
      "Cloud Sync",
      "Recent Activity",
      "Preferences",
      "Connected Devices"
    ]
  }
}

export function ComingSoonModal({ isOpen, onClose, type }: ComingSoonModalProps) {
  const content = contentMap[type]
  const Icon = content.icon

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
            className="relative w-full max-w-[520px] bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200/50 dark:border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Coming Soon
                </span>
              </div>
              <button 
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mb-5 shadow-inner">
                <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {content.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[80%]">
                {content.subtitle}
              </p>

              <div className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/5 text-left">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">
                  Planned Features
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {content.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 opacity-70" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-8 pb-8 pt-2 flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled
                className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 font-medium text-sm border border-slate-200 dark:border-white/5 cursor-not-allowed transition-colors"
              >
                Notify Me
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 border border-blue-500 transition-colors"
              >
                Got it
              </motion.button>
            </div>

            {/* Bottom Version */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Viewix v1.0.0</span>
              <span className="text-[11px] text-slate-400">More account features will be available in a future update.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
