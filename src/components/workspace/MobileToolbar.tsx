import { useWorkspaceStore, type Tool } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
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
  StickyNote
} from "lucide-react"

const tools: { id: Tool | "more"; icon: any; label: string; color?: string }[] = [
  { id: "pointer", icon: MousePointer2, label: "Select", color: "text-blue-600 dark:text-blue-400" },
  { id: "hand", icon: Hand, label: "Hand" },
  { id: "text", icon: Type, label: "Text" },
  { id: "highlight", icon: Highlighter, label: "Highlight", color: "text-yellow-600 dark:text-yellow-400" },
  { id: "rectangle", icon: Square, label: "Rectangle", color: "text-pink-600 dark:text-pink-400" },
  { id: "oval", icon: Circle, label: "Circle", color: "text-red-600 dark:text-red-400" },
  { id: "arrow", icon: MoveUpRight, label: "Arrow", color: "text-green-600 dark:text-green-400" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "cloud", icon: Cloud, label: "Cloud", color: "text-purple-600 dark:text-purple-400" },
  { id: "sticky_note", icon: StickyNote, label: "Note", color: "text-amber-500 dark:text-amber-400" },
  { id: "signature", icon: PenTool, label: "Sign" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
]

export function MobileToolbar() {
  const { activeTool, setActiveTool, setSignatureModalOpen, setSelectedAnnotationId, isFullscreen, annotations, selectedAnnotationId, showAdvancedProperties } = useWorkspaceStore()
  
  if (isFullscreen) return null

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)
  const shouldHide = !!selectedAnnotation || showAdvancedProperties || activeTool === "eraser"

  const handleToolSelect = (toolId: string) => {
    if (toolId === "signature" && activeTool === "signature") {
      setSignatureModalOpen(true)
    }
    setActiveTool(toolId as Tool)
    setSelectedAnnotationId(null)
  }

  return (
    <div className="absolute left-0 right-0 bottom-10 px-4 z-[60] pointer-events-none md:hidden flex justify-center">
      <AnimatePresence>
        {!shouldHide && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-white/10 pointer-events-auto py-3 max-w-full"
          >
        <div className="flex items-center px-3 overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 w-full">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id
            const Icon = tool.icon

            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 min-w-[64px] py-2.5 rounded-[20px] transition-all duration-300 snap-center shrink-0",
                  isActive 
                    ? "bg-[#3B82F6] shadow-md shadow-blue-500/25" 
                    : "bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon 
                  className={cn(
                    "h-[22px] w-[22px] transition-colors duration-300 z-10 relative", 
                    isActive ? "text-white" : "text-[#6B7280]"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={cn(
                    "text-[11px] font-medium transition-colors duration-300 z-10 relative",
                    isActive ? "text-white" : "text-[#6B7280]"
                  )}
                >
                  {tool.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-tool-mobile"
                    className="absolute inset-0 bg-[#3B82F6] rounded-[20px] z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
