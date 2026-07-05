import { useState, useEffect } from "react"
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
  MoreHorizontal,
  ZoomOut,
  ZoomIn,
  Minimize,
  ChevronLeft
} from "lucide-react"
import { useWorkspaceStore, type Tool } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"
import { motion, AnimatePresence } from "framer-motion"

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
  const { activeTool, setActiveTool, undo, redo, deleteAnnotation, selectedAnnotationId, setSelectedAnnotationId, setSignatureModalOpen, isFullscreen, toggleFullscreen, zoom, setZoom } = useWorkspaceStore()
  const [showMore, setShowMore] = useState(false)

  const handleToolSelect = (toolId: Tool | "more") => {
    if (toolId === "more") {
      setShowMore(!showMore)
    } else {
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

  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    if (!isFullscreen) return

    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }

    window.addEventListener("mousemove", handleMouseMove)
    // Initial timeout
    timeout = setTimeout(() => setShowControls(false), 2500)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeout)
    }
  }, [isFullscreen])

  if (isFullscreen) {
    return (
      <div 
        className={cn("absolute left-1/2 bottom-8 z-50 flex flex-col items-center gap-3 transition-opacity duration-500", showControls ? "opacity-100" : "opacity-0 pointer-events-none")} 
        style={{ transform: 'translateX(-50%)' }}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#1e293b]/40 rounded-full p-2 flex items-center gap-2 backdrop-blur-md transition-colors duration-500 border border-white/10"
        >
          <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-white">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(5, zoom + 0.1))} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={toggleFullscreen} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors" title="Exit Fullscreen">
            <Minimize className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="absolute left-1/2 bottom-4 z-50 flex flex-col items-center gap-3" style={{ transform: 'translateX(-50%)' }}>
      <motion.div 
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/70 dark:bg-[#1e293b]/70 rounded-[24px] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-white/10 flex items-center gap-1 backdrop-blur-xl transition-colors duration-500 overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {tools.map((tool, index) => {
            const isPrimary = index < 6
            const isSecondary = index >= 6 && index < 12
            
            if (isPrimary && showMore) return null
            if (isSecondary && !showMore) return null
            
            const Icon = tool.icon
            // Adjust label and icon for the "more" button dynamically
            const isMoreBtn = tool.id === "more"
            const btnLabel = isMoreBtn ? (showMore ? "Back" : "More") : tool.label
            const BtnIcon = isMoreBtn ? (showMore ? ChevronLeft : Icon) : Icon
            
            const isActive = activeTool === tool.id
            const isFirstInRow = index === 0 || index === 6
            
            return (
              <motion.button
                layout
                initial={{ opacity: 0, x: showMore ? 20 : -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: showMore ? -20 : 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-[52px] rounded-[14px] transition-colors border border-transparent shrink-0",
                  isFirstInRow ? "w-[52px]" : "w-[46px]",
                  isActive ? (isFirstInRow ? "bg-blue-600 shadow-md shadow-blue-500/30 border-blue-400/50" : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 shadow-inner") : "hover:bg-slate-100 dark:hover:bg-white/5",
                  isMoreBtn && showMore && "bg-slate-100 dark:bg-white/10" // Give "Back" button a subtle active state
                )}
              >
                <BtnIcon className={cn("h-4 w-4 transition-colors", isActive ? (isFirstInRow ? "text-white" : "text-slate-800 dark:text-slate-200") : tool.color || "text-slate-500 dark:text-slate-400")} />
                <span className={cn("text-[9px] font-medium transition-colors", isActive ? (isFirstInRow ? "text-blue-100" : "text-slate-800 dark:text-slate-200") : "text-slate-500 dark:text-slate-400")}>{btnLabel}</span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
