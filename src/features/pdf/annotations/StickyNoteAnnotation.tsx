import { useEffect, useRef, useState } from "react"
import { Group, Path, Rect, Text as KonvaText } from "react-konva"
import { Html } from "react-konva-utils"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface StickyNoteAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function StickyNoteAnnotation({ annotation, isSelected }: StickyNoteAnnotationProps) {
  const { activeTool, setSelectedAnnotationId, updateAnnotation } = useWorkspaceStore()
  const [isOpen, setIsOpen] = useState(annotation.isEditing || false)
  const [text, setText] = useState(annotation.text || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isSelected && isOpen) {
      setIsOpen(false)
      updateAnnotation(annotation.id, { text, isEditing: false })
    }
  }, [isSelected])

  const handleSelect = () => {
    if (activeTool === "pointer") {
      setSelectedAnnotationId(annotation.id)
    }
  }

  const handleDoubleClick = () => {
    if (activeTool === "pointer" || activeTool === "sticky_note") {
      setIsOpen(true)
      updateAnnotation(annotation.id, { isEditing: true })
    }
  }

  const handleDragEnd = (e: any) => {
    updateAnnotation(annotation.id, {
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const color = annotation.color || "#fef08a"

  return (
    <Group 
      x={annotation.x} 
      y={annotation.y} 
      draggable={activeTool === "pointer" && !isOpen}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
      onTap={handleSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      {/* Sticky Note Body */}
      <Rect
        width={annotation.width || 32}
        height={annotation.height || 32}
        fill={color}
        cornerRadius={4}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.2}
        shadowOffsetY={2}
        stroke={isSelected ? "#3b82f6" : "rgba(0,0,0,0.1)"}
        strokeWidth={isSelected ? 2 : 1}
      />
      {/* Little fold effect (top right corner) */}
      <Path
        data={`M ${(annotation.width || 32) - 12} 0 L ${annotation.width || 32} 12 L ${(annotation.width || 32) - 12} 12 Z`}
        fill="rgba(0,0,0,0.1)"
      />
      
      {/* We can skip lines inside if it's resizable, or just center a small icon */}
      <KonvaText
        x={0}
        y={0}
        width={annotation.width || 32}
        height={annotation.height || 32}
        text="📝"
        fontSize={Math.min((annotation.width || 32), (annotation.height || 32)) * 0.4}
        align="center"
        verticalAlign="middle"
        opacity={0.5}
      />

      {isOpen && (
        <Html divProps={{ style: { position: 'absolute', top: 40, left: 0, zIndex: 100 } }}>
          <div className="w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {annotation.author || "User"}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(annotation.timestamp || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full h-32 p-3 text-sm bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 custom-scrollbar"
            />
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                onClick={() => {
                  setIsOpen(false)
                  updateAnnotation(annotation.id, { text, isEditing: false })
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Html>
      )}
    </Group>
  )
}
