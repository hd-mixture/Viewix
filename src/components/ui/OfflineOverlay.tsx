import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudOff, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Button } from "@/components/ui/button"

export function OfflineOverlay() {
  const { isOfflineOverlayVisible, setIsOfflineOverlayVisible, setIsOffline, recentTemplates, pdfFile } = useWorkspaceStore()
  const [isChecking, setIsChecking] = useState(false)

  const hasLocalDocuments = recentTemplates.length > 0 || pdfFile !== null

  const handleTryAgain = () => {
    setIsChecking(true)
    setTimeout(() => {
      setIsChecking(false)
      if (navigator.onLine) {
        setIsOffline(false)
        setIsOfflineOverlayVisible(false)
      }
    }, 800) // fake delay for better UX
  }

  const handleContinueOffline = () => {
    setIsOfflineOverlayVisible(false)
  }

  return (
    <AnimatePresence>
      {isOfflineOverlayVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/90 dark:bg-[#0B1120]/90 backdrop-blur-md p-6"
        >
          <div className="max-w-md w-full flex flex-col items-center text-center">
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-80 h-80 -mb-16"
            >
              {/* Fallback to CloudOff if image fails, but mostly image */}
              <img 
                src="/offline_illustration.png" 
                alt="Offline Illustration" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>

            <h1 className="text-4xl md:text-[44px] font-extrabold tracking-tight text-[#1a202c] dark:text-white mb-5 flex items-center justify-center gap-2.5">
              <span>You're</span>
              <span className="text-[#3b59ff] dark:text-[#5c73ff]">Offline</span>
            </h1>

            <div className="flex items-center justify-center gap-3 mb-6 w-full max-w-[200px] mx-auto opacity-70">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#3b59ff] dark:bg-[#5c73ff]" />
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-[15px] font-medium">
              Oops! It looks like you've lost your internet connection.<br />
              Some features may be unavailable.
            </p>

            <div className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-5 mb-8 text-left flex gap-4 items-start shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <CloudOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  Local Storage Active
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your documents stored locally are still available. Changes will sync automatically once you're back online.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={handleTryAgain}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-12 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                {isChecking ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2" />
                )}
                Try Again
              </Button>
              
              {hasLocalDocuments && (
                <Button 
                  onClick={handleContinueOffline}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  Continue Offline
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
              Automatically reconnecting...
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
