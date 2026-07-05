import { useEffect, useRef, useState } from "react"
import { Text, Transformer, Group } from "react-konva"
import { Html } from "react-konva-utils"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface TextAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

export function TextAnnotation({ annotation, isSelected }: TextAnnotationProps) {
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)
  const { activeTool, setSelectedAnnotationId, updateAnnotation } = useWorkspaceStore()
  
  const [isEditing, setIsEditing] = useState(annotation.isEditing || false)
  const [text, setText] = useState(annotation.text || "")
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        const el = textareaRef.current
        if (el) {
          el.focus({ preventScroll: true })
          el.setSelectionRange(el.value.length, el.value.length)
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected, isEditing])

  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false)
      updateAnnotation(annotation.id, { text, isEditing: false })
    }
  }, [isSelected])

  const handleSelect = () => {
    if (activeTool === "pointer") {
      setSelectedAnnotationId(annotation.id)
    }
  }

  const handleDoubleClick = () => {
    if (activeTool === "pointer" || activeTool === "text") {
      setIsEditing(true)
      updateAnnotation(annotation.id, { isEditing: true })
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

    const isCorner = scaleY !== 1
    const newFontSize = Math.max(8, fontSize * scaleY)

    updateAnnotation(annotation.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      ...(isCorner ? { fontSize: newFontSize } : {})
    })
  }

  const fontFamily = annotation.fontFamily || "Inter"
  const fontSize = annotation.fontSize || 16
  const fill = annotation.color || "#000000"
  const fontStyle = `${annotation.fontStyle === "italic" ? "italic" : "normal"} ${annotation.fontWeight === "bold" ? "bold" : "normal"}`.trim()
  const textDecoration = annotation.textDecoration || "none"
  const align = annotation.textAlign || "left"

  return (
    <Group 
      x={annotation.x} 
      y={annotation.y} 
      draggable={activeTool === "pointer" && !isEditing}
      onDragEnd={handleDragEnd}
    >
      {!isEditing && (
        <Text
          ref={shapeRef}
          text={text}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontStyle={fontStyle}
          textDecoration={textDecoration}
          align={align}
          fill={fill}
          width={annotation.width || undefined}
          padding={0}
          onClick={handleSelect}
          onTap={handleSelect}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      )}

      {isEditing && (
        <Html divProps={{ style: { position: 'absolute', top: 0, left: 0 } }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              setIsEditing(false)
              // Setting width to undefined lets Konva naturally tightly wrap the text exactly to its content width!
              updateAnnotation(annotation.id, { text, isEditing: false, width: undefined })
            }}
            placeholder=""
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: annotation.fontWeight === "bold" ? "bold" : "normal",
              fontStyle: annotation.fontStyle === "italic" ? "italic" : "normal",
              textDecoration,
              textAlign: align as any,
              color: fill,
              width: annotation.width ? `${annotation.width}px` : 'auto',
              minWidth: '10px',
              minHeight: `${fontSize * 1.5}px`,
              padding: '0',
              margin: 0,
              border: '1px dashed #3b82f6',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.2
            }}
          />
        </Html>
      )}

      {isSelected && activeTool === "pointer" && !isEditing && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) return oldBox
            return newBox
          }}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#3b82f6"
          anchorStrokeWidth={2}
          anchorFill="#ffffff"
          borderStroke="#3b82f6"
          borderStrokeWidth={1.5}
        />
      )}
    </Group>
  )
}
