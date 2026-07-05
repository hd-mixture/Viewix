import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, CheckCircle2, Info } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

export function ToastNotification() {
  const { toastMessage, hideToast } = useWorkspaceStore()

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast()
      }, toastMessage.duration || 4500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, hideToast])

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-6 z-[999] max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 flex gap-4 items-start"
        >
          <div className={`p-2 rounded-lg shrink-0 ${toastMessage.title.includes('Success') || toastMessage.title.includes('deleted') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : toastMessage.title.includes('Warning') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
            {toastMessage.title.includes('Success') || toastMessage.title.includes('deleted') ? (
               <CheckCircle2 className="w-5 h-5" />
            ) : toastMessage.title.includes('Warning') ? (
               <AlertTriangle className="w-5 h-5" />
            ) : (
               <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {toastMessage.title}
            </h3>
            {toastMessage.message && (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                {toastMessage.message}
              </p>
            )}
            {toastMessage.action && (
              <button
                onClick={() => {
                  toastMessage.action!.onClick()
                  hideToast()
                }}
                className="mt-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
              >
                {toastMessage.action.label}
              </button>
            )}
          </div>
          <button 
            onClick={hideToast}
            className="p-1 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
