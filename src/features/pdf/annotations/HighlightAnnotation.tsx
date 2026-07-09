import { useEffect, useRef } from "react"
import { Group, Rect } from "react-konva"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface HighlightAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function HighlightAnnotation({ annotation, isSelected }: HighlightAnnotationProps) {
  const { activeTool, setSelectedAnnotationId, deleteAnnotation } = useWorkspaceStore()
  
  const handleSelect = () => {
    if (activeTool === "pointer") {
      setSelectedAnnotationId(annotation.id)
    }
  }

  const isEraser = activeTool === "eraser"
  const eraserProps = isEraser ? {
    onMouseEnter: (e: any) => {
      e.target.getStage().container().style.cursor = 'not-allowed'
      e.target.stroke('red')
      e.target.strokeWidth(2)
      e.target.getLayer().batchDraw()
    },
    onMouseLeave: (e: any) => {
      e.target.getStage().container().style.cursor = 'crosshair'
      e.target.stroke(undefined)
      e.target.strokeWidth(0)
      e.target.getLayer().batchDraw()
    },
    onClick: () => deleteAnnotation(annotation.id),
    onTap: () => deleteAnnotation(annotation.id),
  } : {}

  const color = annotation.color || "rgba(255, 226, 64, 0.5)"
  
  // Highlighting typically consists of multiple rects if text spans multiple lines
  // If we just have old points (freedraw style), we render a line fallback? 
  // No, we will update the data model to support rects array for true text highlights.
  const rects = annotation.rects || []

  return (
    <Group 
      x={annotation.x} 
      y={annotation.y} 
      onClick={handleSelect}
      onTap={handleSelect}
      {...eraserProps}
    >
      {rects.map((r, i) => (
        <Rect
          key={i}
          x={r.x}
          y={r.y}
          width={r.width}
          height={r.height}
          fill={color}
          opacity={annotation.opacity || 0.5}
          globalCompositeOperation={annotation.blendMode || "multiply"}
          stroke={isSelected && activeTool === "pointer" ? "#3b82f6" : undefined}
          strokeWidth={isSelected && activeTool === "pointer" ? 2 : 0}
        />
      ))}
    </Group>
  )
}
