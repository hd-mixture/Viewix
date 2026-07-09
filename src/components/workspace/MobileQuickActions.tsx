import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { 
  Palette, 
  Trash2,
  Copy,
  MoreHorizontal,
  Type,
  Maximize,
  Droplet,
  X,
  Bold,
  Italic,
  Underline,
  ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileQuickActions() {
  const { 
    annotations, 
    selectedAnnotationId, 
    updateAnnotation, 
    deleteAnnotation, 
    duplicateAnnotation,
    setShowAdvancedProperties,
    showAdvancedProperties,
    setSelectedAnnotationId,
    activeTool,
    setActiveTool,
    eraserSettings,
    setEraserSettings
  } = useWorkspaceStore()

  const [activeMenu, setActiveMenu] = useState<"main" | "color" | "stroke" | "size">("main")

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)
  
  // Reset menu to main when selection changes
  useEffect(() => {
    setActiveMenu("main")
  }, [selectedAnnotationId])

  // Hide if no annotation selected AND not eraser OR if advanced properties are open
  if ((!selectedAnnotation && activeTool !== "eraser") || showAdvancedProperties) return null

  const PRESET_COLORS = [
    "#000000", "#3B82F6", "#EF4444", "#22C55E", 
    "#A855F7", "#F97316", "#EC4899", "#6B7280"
  ]
  const PRESET_HIGHLIGHT_COLORS = [
    "rgba(250, 204, 21, 0.4)", "rgba(74, 222, 128, 0.4)", "rgba(96, 165, 250, 0.4)", 
    "rgba(244, 114, 182, 0.4)", "rgba(192, 132, 252, 0.4)", "rgba(156, 163, 175, 0.4)"
  ]
  const colors = selectedAnnotation?.type === 'highlight' ? PRESET_HIGHLIGHT_COLORS : PRESET_COLORS

  const handleUpdate = (updates: any) => {
    if (selectedAnnotation) updateAnnotation(selectedAnnotation.id, updates)
  }

  const renderEraserMenu = () => {
    return (
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        <button onClick={() => setActiveTool("pointer")} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex flex-col items-center gap-1 min-w-[40px] shrink-0">
          <X className="w-4 h-4" />
          <span className="text-[10px] font-medium">Close</span>
        </button>
        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 shrink-0 ml-1 mr-2 shadow-inner">
          <button 
            onClick={() => setEraserSettings({ mode: 'click' })} 
            className={cn("relative px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors z-10", eraserSettings.mode === 'click' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          >
            {eraserSettings.mode === 'click' && (
              <motion.div
                layoutId="eraser-mode-bg"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-600/50 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            Click
          </button>
          <button 
            onClick={() => setEraserSettings({ mode: 'drag' })} 
            className={cn("relative px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors z-10", eraserSettings.mode === 'drag' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          >
            {eraserSettings.mode === 'drag' && (
              <motion.div
                layoutId="eraser-mode-bg"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-600/50 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            Drag
          </button>
        </div>
        
        {eraserSettings.mode === 'drag' && (
          <>
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

            <div className="flex items-center gap-3 pr-4 pl-2 shrink-0">
              <span className="text-[10px] font-medium text-slate-500 min-w-[30px] text-center">
                {eraserSettings.brushSize}px
              </span>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={eraserSettings.brushSize} 
                onChange={(e) => setEraserSettings({ brushSize: parseInt(e.target.value) })}
                className="w-[100px] accent-blue-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
          </>
        )}
      </div>
    )
  }

  const renderColorMenu = () => {
    if (!selectedAnnotation) return null
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-2 pl-1 py-1">
        <button 
          onClick={() => setActiveMenu("main")}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
        {colors.map(color => (
          <button
            key={color}
            onClick={() => handleUpdate({ color })}
            className={cn(
              "w-8 h-8 rounded-full border-2 shrink-0 transition-transform",
              selectedAnnotation.color === color ? "border-blue-500 scale-110" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )
  }

  const renderStrokeMenu = () => {
    if (!selectedAnnotation) return null
    return (
      <div className="flex items-center gap-3 pr-4 pl-2 py-1 w-[240px]">
        <button onClick={() => setActiveMenu("main")} className="p-1.5 text-slate-500 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <span className="text-[10px] font-medium text-slate-500 min-w-[30px] text-center shrink-0">
          {selectedAnnotation.strokeWidth || 3}px
        </span>
        <input 
          type="range" 
          min="1" 
          max="30" 
          value={selectedAnnotation.strokeWidth || 3} 
          onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })}
          className="flex-1 accent-blue-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
        />
      </div>
    )
  }

  const renderSizeMenu = () => {
    if (!selectedAnnotation) return null
    return (
      <div className="flex items-center gap-3 pr-4 pl-2 py-1 w-[240px]">
        <button onClick={() => setActiveMenu("main")} className="p-1.5 text-slate-500 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <span className="text-[10px] font-medium text-slate-500 min-w-[30px] text-center shrink-0">
          {selectedAnnotation.fontSize || 16}px
        </span>
        <input 
          type="range" 
          min="8" 
          max="120" 
          value={selectedAnnotation.fontSize || 16} 
          onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
          className="flex-1 accent-blue-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
        />
      </div>
    )
  }

  const renderMainMenu = () => {
    if (!selectedAnnotation) return null
    const type = selectedAnnotation.type
    return (
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button onClick={() => setSelectedAnnotationId(null)} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex flex-col items-center gap-1 min-w-[40px] shrink-0">
          <X className="w-4 h-4" />
          <span className="text-[10px] font-medium">Close</span>
        </button>
        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {['text'].includes(type) && (
          <>
            <button 
              onClick={() => handleUpdate({ fontWeight: selectedAnnotation.fontWeight === "bold" ? "normal" : "bold" })} 
              className={cn("p-2 flex flex-col items-center gap-1 min-w-[40px] shrink-0", selectedAnnotation.fontWeight === "bold" ? "text-blue-500" : "text-slate-700 dark:text-slate-200")}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleUpdate({ fontStyle: selectedAnnotation.fontStyle === "italic" ? "normal" : "italic" })} 
              className={cn("p-2 flex flex-col items-center gap-1 min-w-[40px] shrink-0", selectedAnnotation.fontStyle === "italic" ? "text-blue-500" : "text-slate-700 dark:text-slate-200")}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleUpdate({ textDecoration: selectedAnnotation.textDecoration === "underline" ? "none" : "underline" })} 
              className={cn("p-2 flex flex-col items-center gap-1 min-w-[40px] shrink-0", selectedAnnotation.textDecoration === "underline" ? "text-blue-500" : "text-slate-700 dark:text-slate-200")}
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
          </>
        )}

        {['text', 'sticky_note', 'highlight', 'rectangle', 'oval', 'arrow', 'line', 'cloud', 'freedraw'].includes(type) && (
          <button onClick={() => setActiveMenu("color")} className="p-2 text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
            <Palette className="w-4 h-4" />
            <span className="text-[10px] font-medium">Color</span>
          </button>
        )}
        
        {['rectangle', 'oval', 'arrow', 'line', 'cloud', 'freedraw'].includes(type) && (
          <button onClick={() => setActiveMenu("stroke")} className="p-2 text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
            <Droplet className="w-4 h-4" />
            <span className="text-[10px] font-medium">Stroke</span>
          </button>
        )}

        {['text'].includes(type) && (
          <button onClick={() => setActiveMenu("size")} className="p-2 text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
            <Type className="w-4 h-4" />
            <span className="text-[10px] font-medium">Size</span>
          </button>
        )}

        <button onClick={() => duplicateAnnotation(selectedAnnotation.id)} className="p-2 text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
          <Copy className="w-4 h-4" />
          <span className="text-[10px] font-medium">Copy</span>
        </button>

        <button onClick={() => deleteAnnotation(selectedAnnotation.id)} className="p-2 text-red-500 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
          <Trash2 className="w-4 h-4" />
          <span className="text-[10px] font-medium">Delete</span>
        </button>

        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        <button onClick={() => setShowAdvancedProperties(true)} className="p-2 text-blue-500 flex flex-col items-center gap-1 min-w-[50px] shrink-0">
          <MoreHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    )
  }

  return (
    <div className="absolute left-0 right-0 bottom-10 px-4 flex justify-center z-[65] pointer-events-none md:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool === "eraser" ? "eraser" : activeMenu}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-white/10 pointer-events-auto px-2 py-1.5 max-w-full"
        >
          {activeTool === "eraser" 
            ? renderEraserMenu() 
            : activeMenu === "main" ? renderMainMenu() : activeMenu === "color" ? renderColorMenu() : activeMenu === "stroke" ? renderStrokeMenu() : renderSizeMenu()
          }
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

