import { useEffect, useRef } from "react"
import { Line, Arrow, Transformer } from "react-konva"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface LineAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function LineAnnotation({ annotation, isSelected }: LineAnnotationProps) {
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
  const strokeWidth = annotation.strokeWidth || 2
  const points = annotation.points || [0, 0, 0, 0]

  // Map dash styles
  let dash: number[] = []
  if (annotation.dashStyle === "dashed") dash = [strokeWidth * 3, strokeWidth * 3]
  if (annotation.dashStyle === "dotted") dash = [strokeWidth, strokeWidth * 2]

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

    const newPoints = points.map((p, i) => (i % 2 === 0 ? p * scaleX : p * scaleY))

    updateAnnotation(annotation.id, {
      x: node.x(),
      y: node.y(),
      points: newPoints,
    })
  }

  const commonProps = {
    ref: shapeRef,
    x: annotation.x,
    y: annotation.y,
    points,
    stroke: strokeColor,
    strokeWidth,
    dash,
    opacity: annotation.opacity,
    draggable: activeTool === "pointer",
    onClick: handleSelect,
    onTap: handleSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    lineCap: "round" as any,
    lineJoin: "round" as any,
  }

  const isArrow = annotation.type === "arrow" || annotation.arrowHead === "arrow"

  return (
    <>
      {isArrow ? (
        <Arrow 
          {...commonProps} 
          pointerLength={strokeWidth * 3}
          pointerWidth={strokeWidth * 3}
          fill={strokeColor} 
        />
      ) : (
        <Line {...commonProps} />
      )}

      {isSelected && activeTool === "pointer" && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={['top-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox
            return newBox
          }}
        />
      )}
    </>
  )
}
