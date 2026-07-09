import React, { useState, useEffect } from "react"
import { useWorkspaceStore, type Tool, type Annotation } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trash2, 
  Copy, 
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  X,
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from "lucide-react"

export function MobilePropertiesPanel() {
  const { 
    activeTool, 
    annotations,
    selectedAnnotationId,
    updateAnnotation,
    deleteAnnotation,
    duplicateAnnotation,
    bringForward,
    sendBackward,
    lockAnnotation,
    toolDefaults,
    updateToolDefault,
    setActiveTool,
    setSelectedAnnotationId,
    showAdvancedProperties,
    setShowAdvancedProperties
  } = useWorkspaceStore()

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)
  
  const shouldRender = showAdvancedProperties
  
  const activeType = selectedAnnotation ? selectedAnnotation.type : activeTool
  const props = (selectedAnnotation || toolDefaults[activeTool] || {}) as Partial<Annotation>

  const handleChange = (key: keyof Annotation, value: any) => {
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { [key]: value })
    } else {
      updateToolDefault(activeTool, { [key]: value })
    }
  }

  // Feature flags based on active tool type
  const hasStroke = ['rectangle', 'oval', 'arrow', 'line', 'cloud', 'freedraw', 'signature'].includes(activeType)
  const hasFill = ['rectangle', 'oval', 'cloud'].includes(activeType)
  const hasFont = ['text'].includes(activeType)
  const hasColor = ['text', 'sticky_note'].includes(activeType)
  const hasOpacity = !['pointer', 'hand', 'eraser'].includes(activeType)

  const PRESET_COLORS = [
    "#000000", "#3B82F6", "#EF4444", "#22C55E", 
    "#A855F7", "#F97316", "#EC4899", "#6B7280"
  ]

  const PRESET_HIGHLIGHT_COLORS = [
    "rgba(250, 204, 21, 0.4)", "rgba(74, 222, 128, 0.4)", "rgba(96, 165, 250, 0.4)", 
    "rgba(244, 114, 182, 0.4)", "rgba(192, 132, 252, 0.4)", "rgba(156, 163, 175, 0.4)"
  ]

  return (
    <>
      {/* The Advanced Properties Sheet */}
      <AnimatePresence>
        {shouldRender && (
          <>
            {/* Click-away backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setShowAdvancedProperties(false)}
            />
            
            <motion.div
              key="mobile-properties-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[65] md:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-t-[24px] shadow-[0_-8px_32px_rgba(0,0,0,0.15)] border-t border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[45dvh]"
              onClick={(e) => e.stopPropagation()} // Prevent closing when tapping inside the panel
            >

          <div className="px-4 pb-2 pt-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedProperties(false)}
                className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 capitalize flex items-center gap-2">
                {activeType.replace('_', ' ')}
              </h3>
            </div>
            {/* Quick Actions (Delete / Duplicate) handled by MobileQuickActions now, but we can keep minimal actions here or hide them. Hiding them since QuickActions has them. */}
          </div>

          {/* Scrollable Properties Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5 custom-scrollbar">
            <div className="flex flex-col gap-6">

              {/* Text Tool Options */}
              {hasFont && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Font Family</label>
                    <select
                      value={props.fontFamily || "Inter"}
                      onChange={(e) => handleChange("fontFamily", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-[14px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3B82F6]"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => handleChange("isBold", !props.isBold)}
                      className={cn("flex-1 py-1.5 rounded-full flex items-center justify-center transition-all", props.isBold ? "bg-[#3B82F6] shadow-sm text-white" : "text-[#6B7280]")}
                    >
                      <Bold className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={() => handleChange("isItalic", !props.isItalic)}
                      className={cn("flex-1 py-1.5 rounded-full flex items-center justify-center transition-all", props.isItalic ? "bg-[#3B82F6] shadow-sm text-white" : "text-[#6B7280]")}
                    >
                      <Italic className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={() => handleChange("isUnderline", !props.isUnderline)}
                      className={cn("flex-1 py-1.5 rounded-full flex items-center justify-center transition-all", props.isUnderline ? "bg-[#3B82F6] shadow-sm text-white" : "text-[#6B7280]")}
                    >
                      <Underline className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Font Size</label>
                      <span className="text-[14px] font-bold text-slate-800 dark:text-white">{props.fontSize || 16}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="8" max="72" 
                      value={props.fontSize || 16} 
                      onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
                      className="w-full thick-slider"
                    />
                  </div>
                </div>
              )}

              {/* Stroke / Border Width */}
              {hasStroke && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Thickness</label>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-white">{props.strokeWidth || 2}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="24" 
                    value={props.strokeWidth || 2} 
                    onChange={(e) => handleChange("strokeWidth", parseInt(e.target.value))}
                    className="w-full thick-slider"
                  />
                </div>
              )}

              {/* Stroke Color */}
              {hasStroke && activeType !== 'highlight' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Stroke Color</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    <button
                      onClick={() => handleChange("stroke", "transparent")}
                      className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 flex items-center justify-center relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.stroke === "transparent" ? "border-[#3B82F6] scale-110" : "border-slate-200 dark:border-slate-700")}
                    >
                      <div className="w-full h-full bg-white dark:bg-slate-800" />
                      <div className="absolute w-12 h-[2px] bg-red-500 rotate-45" />
                    </button>
                    {PRESET_COLORS.map(color => (
                      <button
                        key={`stroke-${color}`}
                        onClick={() => handleChange("stroke", color)}
                        className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 transition-transform shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.stroke === color ? "border-[#3B82F6] scale-110" : "border-transparent hover:scale-105")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Highlight Colors */}
              {activeType === 'highlight' && (
                 <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Highlight Color</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    {PRESET_HIGHLIGHT_COLORS.map(color => (
                      <button
                        key={`highlight-${color}`}
                        onClick={() => handleChange("stroke", color)}
                        className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 transition-transform shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.stroke === color ? "border-[#3B82F6] scale-110" : "border-transparent hover:scale-105")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Text/Note Color */}
              {hasColor && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Color</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={`color-${color}`}
                        onClick={() => handleChange("color", color)}
                        className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 transition-transform shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.color === color ? "border-[#3B82F6] scale-110" : "border-transparent hover:scale-105")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fill Color */}
              {hasFill && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Fill Color</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    <button
                      onClick={() => handleChange("fill", "transparent")}
                      className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 flex items-center justify-center relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.fill === "transparent" ? "border-[#3B82F6] scale-110" : "border-slate-200 dark:border-slate-700")}
                    >
                      <div className="w-full h-full bg-white dark:bg-slate-800" />
                      <div className="absolute w-12 h-[2px] bg-red-500 rotate-45" />
                    </button>
                    {PRESET_COLORS.map(color => (
                      <button
                        key={`fill-${color}`}
                        onClick={() => handleChange("fill", color)}
                        className={cn("w-[32px] h-[32px] rounded-full shrink-0 border-2 transition-transform shadow-[0_2px_4px_rgba(0,0,0,0.1)]", props.fill === color ? "border-[#3B82F6] scale-110" : "border-transparent hover:scale-105")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Opacity */}
              {hasOpacity && (
                <div className="flex flex-col gap-2 pb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Opacity</label>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-white">{Math.round((props.opacity || 1) * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="1" step="0.1"
                    value={props.opacity || 1} 
                    onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
                    className="w-full thick-slider"
                  />
                </div>
              )}

              {/* Eraser Specific */}
              {activeType === "eraser" && (
                <div className="flex flex-col gap-4 pb-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                    <button 
                      onClick={() => useWorkspaceStore.getState().setEraserSettings({ mode: 'click' })}
                      className={cn("flex-1 py-1.5 rounded-full text-[13px] font-medium transition-colors", useWorkspaceStore.getState().eraserSettings.mode === 'click' ? "bg-[#3B82F6] shadow-sm text-white" : "text-[#6B7280]")}
                    >
                      Click Delete
                    </button>
                    <button 
                      onClick={() => useWorkspaceStore.getState().setEraserSettings({ mode: 'drag' })}
                      className={cn("flex-1 py-1.5 rounded-full text-[13px] font-medium transition-colors", useWorkspaceStore.getState().eraserSettings.mode === 'drag' ? "bg-[#3B82F6] shadow-sm text-white" : "text-[#6B7280]")}
                    >
                      Brush Erase
                    </button>
                  </div>
                  
                  {useWorkspaceStore.getState().eraserSettings.mode === 'drag' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Brush Size</label>
                        <span className="text-[14px] font-bold text-slate-800 dark:text-white">{useWorkspaceStore.getState().eraserSettings.size}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" max="100" step="2"
                        value={useWorkspaceStore.getState().eraserSettings.size} 
                        onChange={(e) => useWorkspaceStore.getState().setEraserSettings({ size: parseInt(e.target.value) })}
                        className="w-full thick-slider"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Arrangement (only when an annotation is selected) */}
              {selectedAnnotation && (
                <div className="grid grid-cols-2 gap-3 pb-4">
                  <button 
                    onClick={() => bringForward(selectedAnnotation.id)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform text-slate-600 dark:text-slate-300"
                  >
                    <BringToFront className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Bring Forward</span>
                  </button>
                  <button 
                    onClick={() => sendBackward(selectedAnnotation.id)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform text-slate-600 dark:text-slate-300"
                  >
                    <SendToBack className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Send Backward</span>
                  </button>
                </div>
              )}

            </div>
          </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
