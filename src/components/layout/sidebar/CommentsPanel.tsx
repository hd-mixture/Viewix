import { MessageSquare, Type, Highlighter, Square } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

export function CommentsPanel() {
  const { annotations, setSelectedAnnotationId, selectedAnnotationId } = useWorkspaceStore()

  return (
    <aside className="scroll-trigger w-[200px] h-full flex flex-col bg-white/60 dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto overflow-hidden transition-colors duration-500">
      
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/5 shrink-0 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 transition-colors duration-500">Comments</h3>
          <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-500">{annotations.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
        {annotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">No Annotations</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Add text, shapes, or highlights to the document.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {annotations.map((ann) => {
              const Icon = ann.type === 'text' ? Type : ann.type === 'highlight' ? Highlighter : Square;
              const isSelected = selectedAnnotationId === ann.id;
              
              return (
                <div 
                  key={ann.id}
                  onClick={() => setSelectedAnnotationId(ann.id)}
                  className={`p-3 rounded-xl border flex gap-3 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 shadow-sm' : 'bg-white/50 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10'}`}
                >
                  <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[11px] font-semibold capitalize ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {ann.type}
                      </span>
                      <span className="text-[9px] text-slate-400">Pg {ann.pageNumber}</span>
                    </div>
                    {ann.text && (
                      <p className={`text-[10px] truncate ${isSelected ? 'text-blue-600/80 dark:text-blue-300/80' : 'text-slate-500'}`}>
                        {ann.text}
                      </p>
                    )}
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
