import { List } from "lucide-react"

export function OutlinePanel() {
  return (
    <aside className="scroll-trigger w-[200px] h-full flex flex-col bg-white/60 dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto overflow-hidden transition-colors duration-500">
      
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/5 shrink-0 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 transition-colors duration-500">Outline</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
          <List className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">No Outline</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This document does not contain an outline or table of contents.
        </p>
      </div>
    </aside>
  )
}
