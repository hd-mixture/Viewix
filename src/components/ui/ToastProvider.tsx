import { AnimatePresence, motion } from "framer-motion"
import { useToastStore } from "@/store/useToastStore"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export function ToastProvider() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success"
          const isError = toast.type === "error"
          
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-xl border w-80 
                ${isSuccess ? 'bg-green-50/90 border-green-200 dark:bg-green-950/80 dark:border-green-800' : ''}
                ${isError ? 'bg-red-50/90 border-red-200 dark:bg-red-950/80 dark:border-red-800' : ''}
                ${!isSuccess && !isError ? 'bg-white/90 border-slate-200 dark:bg-slate-900/90 dark:border-slate-800' : ''}
              `}
            >
              <div className={`mt-0.5 shrink-0
                ${isSuccess ? 'text-green-600 dark:text-green-400' : ''}
                ${isError ? 'text-red-600 dark:text-red-400' : ''}
                ${!isSuccess && !isError ? 'text-blue-600 dark:text-blue-400' : ''}
              `}>
                {isSuccess && <CheckCircle2 className="h-5 w-5" />}
                {isError && <AlertCircle className="h-5 w-5" />}
                {!isSuccess && !isError && <Info className="h-5 w-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold 
                  ${isSuccess ? 'text-green-900 dark:text-green-100' : ''}
                  ${isError ? 'text-red-900 dark:text-red-100' : ''}
                  ${!isSuccess && !isError ? 'text-slate-900 dark:text-slate-100' : ''}
                `}>
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className={`text-[12px] mt-1 leading-snug
                    ${isSuccess ? 'text-green-700 dark:text-green-300' : ''}
                    ${isError ? 'text-red-700 dark:text-red-300' : ''}
                    ${!isSuccess && !isError ? 'text-slate-600 dark:text-slate-400' : ''}
                  `}>
                    {toast.description}
                  </p>
                )}
              </div>

              <button 
                onClick={() => dismiss(toast.id)}
                className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
