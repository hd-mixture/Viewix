import { useEffect, useRef } from "react"
import { Rect, Ellipse, Transformer } from "react-konva"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface ShapeAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function ShapeAnnotation({ annotation, isSelected }: ShapeAnnotationProps) {
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const { activeTool, setSelectedAnnotationId, updateAnnotation } = useWorkspaceStore()

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const strokeColor = isSelected ? "#3b82f6" : annotation.color

  const handleSelect = () => {
    if (activeTool === "pointer") {
      setSelectedAnnotationId(annotation.id)
    }
  }

  const handleDragEnd = (e: any) => {
    updateAnnotation(annotation.id, {
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const handleTransformEnd = (e: any) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    node.scaleX(1)
    node.scaleY(1)

    if (annotation.type === "rectangle") {
      updateAnnotation(annotation.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      })
    } else if (annotation.type === "oval") {
      updateAnnotation(annotation.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, (annotation.width || 0) * scaleX),
        height: Math.max(5, (annotation.height || 0) * scaleY),
      })
    }
  }

  return (
    <>
      {annotation.type === "rectangle" && (
        <Rect
          ref={shapeRef}
          x={annotation.x}
          y={annotation.y}
          width={annotation.width || 0}
          height={annotation.height || 0}
          stroke={strokeColor}
          strokeWidth={annotation.strokeWidth}
          opacity={annotation.opacity}
          draggable={activeTool === "pointer"}
          onClick={handleSelect}
          onTap={handleSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
      )}
      
      {annotation.type === "oval" && (
        <Ellipse
          ref={shapeRef}
          x={annotation.x + (annotation.width || 0) / 2}
          y={annotation.y + (annotation.height || 0) / 2}
          radiusX={Math.abs((annotation.width || 0) / 2)}
          radiusY={Math.abs((annotation.height || 0) / 2)}
          stroke={strokeColor}
          strokeWidth={annotation.strokeWidth}
          opacity={annotation.opacity}
          draggable={activeTool === "pointer"}
          onClick={handleSelect}
          onTap={handleSelect}
          onDragEnd={(e) => {
            updateAnnotation(annotation.id, {
              x: e.target.x() - (annotation.width || 0) / 2,
              y: e.target.y() - (annotation.height || 0) / 2,
            })
          }}
          onTransformEnd={handleTransformEnd}
        />
      )}

      {isSelected && activeTool === "pointer" && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}
