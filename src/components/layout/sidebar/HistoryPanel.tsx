import { Clock, MousePointer2, PlusCircle, Trash2, Edit3 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

export function HistoryPanel() {
  const { pastAnnotations } = useWorkspaceStore()

  return (
    <aside className="scroll-trigger w-[200px] h-full flex flex-col bg-white/60 dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto overflow-hidden transition-colors duration-500">
      
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/5 shrink-0 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 transition-colors duration-500">History</h3>
          <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-500">{pastAnnotations.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col relative">
        {pastAnnotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">No History</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Start editing the document to see history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 dark:bg-white/10 z-0" />
            
            <div className="flex gap-3 relative z-10">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,0.6)] dark:shadow-[0_0_0_4px_rgba(30,41,59,0.6)]">
                <MousePointer2 className="h-2.5 w-2.5" />
              </div>
              <div className="pt-0.5">
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Current State</p>
                <p className="text-[9px] text-slate-400">Just now</p>
              </div>
            </div>

            {pastAnnotations.map((_, index) => {
              // Note: since this is just a generic history stack without specific action metadata, 
              // we're displaying generic past states. In a fully robust app, actions would have types.
              return (
                <div key={index} className="flex gap-3 relative z-10">
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,0.6)] dark:shadow-[0_0_0_4px_rgba(30,41,59,0.6)]">
                    <Edit3 className="h-2.5 w-2.5" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Document Edited</p>
                    <p className="text-[9px] text-slate-400">Previous State</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
