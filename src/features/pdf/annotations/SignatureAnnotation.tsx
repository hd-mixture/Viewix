import { useEffect, useRef } from "react"
import { Group, Image as KonvaImage, Transformer } from "react-konva"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface SignatureAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function SignatureAnnotation({ annotation, isSelected }: SignatureAnnotationProps) {
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const { activeTool, setSelectedAnnotationId, updateAnnotation } = useWorkspaceStore()
  
  // Create an image object from the data URL
  const imageObj = useRef(new window.Image())
  
  useEffect(() => {
    if (annotation.signatureDataUrl) {
      imageObj.current.src = annotation.signatureDataUrl
      imageObj.current.onload = () => {
        if (shapeRef.current) {
          shapeRef.current.getLayer()?.batchDraw()
        }
      }
    }
  }, [annotation.signatureDataUrl])

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])
  
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

    updateAnnotation(annotation.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, (annotation.width || 150) * scaleX),
      height: Math.max(10, (annotation.height || 60) * scaleY),
      rotation: node.rotation()
    })
  }

  const isHovered = activeTool === "pointer" && !isSelected && !annotation.locked

  return (
    <Group 
      x={annotation.x} 
      y={annotation.y}
      rotation={annotation.rotation || 0}
      draggable={activeTool === "pointer" && !annotation.locked}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
      onTap={handleSelect}
      onMouseEnter={(e) => {
        if (isHovered) {
          const container = e.target.getStage()?.container()
          if (container) container.style.cursor = 'pointer'
        }
      }}
      onMouseLeave={(e) => {
        if (isHovered) {
          const container = e.target.getStage()?.container()
          if (container) container.style.cursor = 'default'
        }
      }}
    >
      <KonvaImage
        ref={shapeRef}
        image={imageObj.current}
        width={annotation.width || 150}
        height={annotation.height || 60}
        opacity={annotation.opacity}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && activeTool === "pointer" && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#3b82f6"
          anchorFill="#ffffff"
          borderStroke="#3b82f6"
          padding={4}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 10) return oldBox
            return newBox
          }}
        />
      )}
    </Group>
  )
}
