import { 
  MousePointer2, 
  Hand, 
  Type, 
  Square, 
  Circle, 
  MoveUpRight, 
  Cloud, 
  Highlighter, 
  PenTool,
  Minus,
  Eraser,
  StickyNote,
  MoreHorizontal
} from "lucide-react"
import { useWorkspaceStore, type Tool } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"
import { motion } from "framer-motion"

const tools: { id: Tool | "more"; icon: any; label: string; shortcut: string; color?: string }[] = [
  { id: "pointer", icon: MousePointer2, label: "Select", shortcut: "v", color: "text-blue-600 dark:text-blue-400" },
  { id: "hand", icon: Hand, label: "Hand", shortcut: "space" },
  { id: "text", icon: Type, label: "Text", shortcut: "t" },
  { id: "highlight", icon: Highlighter, label: "Highlight", shortcut: "h", color: "text-yellow-600 dark:text-yellow-400" },
  { id: "rectangle", icon: Square, label: "Rectangle", shortcut: "r", color: "text-pink-600 dark:text-pink-400" },
  { id: "oval", icon: Circle, label: "Circle", shortcut: "o", color: "text-red-600 dark:text-red-400" },
  { id: "arrow", icon: MoveUpRight, label: "Arrow", shortcut: "a", color: "text-green-600 dark:text-green-400" },
  { id: "line", icon: Minus, label: "Line", shortcut: "l" },
  { id: "cloud", icon: Cloud, label: "Cloud", shortcut: "c", color: "text-purple-600 dark:text-purple-400" },
  { id: "sticky_note", icon: StickyNote, label: "Note", shortcut: "n", color: "text-amber-500 dark:text-amber-400" },
  { id: "signature", icon: PenTool, label: "Sign", shortcut: "s" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "e" },
  { id: "more", icon: MoreHorizontal, label: "More", shortcut: "" },
]

export function Toolbar() {
  const { activeTool, setActiveTool, undo, redo, deleteAnnotation, selectedAnnotationId, setSelectedAnnotationId, setSignatureModalOpen } = useWorkspaceStore()

  const handleToolSelect = (toolId: Tool | "more") => {
    if (toolId !== "more") {
      if (toolId === "signature" && activeTool === "signature") {
        setSignatureModalOpen(true)
      }
      setActiveTool(toolId as Tool)
      setSelectedAnnotationId(null) // Clear selection when switching tools to show tool properties
    }
  }

  tools.forEach((tool) => {
    if (tool.shortcut) {
      // @ts-ignore
      useHotkeys(tool.shortcut, (e) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        handleToolSelect(tool.id)
      }, [setActiveTool, setSelectedAnnotationId])
    }
  })
  useHotkeys("esc", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    handleToolSelect("pointer")
  }, [setActiveTool, setSelectedAnnotationId])
  useHotkeys("delete, backspace", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (selectedAnnotationId) {
      deleteAnnotation(selectedAnnotationId)
    }
  }, { preventDefault: true }, [selectedAnnotationId, deleteAnnotation])
  useHotkeys("mod+z", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    undo()
  }, { preventDefault: true }, [undo])
  useHotkeys("mod+shift+z", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    redo()
  }, { preventDefault: true }, [redo])

  return (
    <div className="absolute left-1/2 bottom-4 z-50 flex flex-col items-center gap-3" style={{ transform: 'translateX(-50%)' }}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/70 dark:bg-[#1e293b]/70 rounded-[24px] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-white/10 flex items-center gap-1 backdrop-blur-xl transition-colors duration-500"
      >
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          
          if (tool.id === "pointer") {
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-[52px] w-[52px] rounded-[14px] transition-all",
                  isActive ? "bg-blue-600 shadow-md shadow-blue-500/30 border border-blue-400/50" : "hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : tool.color || "text-slate-500 dark:text-slate-400")} />
                <span className={cn("text-[9px] font-medium transition-colors", isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400")}>{tool.label}</span>
              </button>
            )
          }

          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 h-[52px] w-[46px] rounded-[14px] transition-all border border-transparent",
                isActive ? "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 shadow-inner" : "hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-slate-800 dark:text-slate-200" : tool.color || "text-slate-500 dark:text-slate-400")} />
              <span className={cn("text-[9px] font-medium transition-colors", isActive ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400")}>{tool.label}</span>
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
