import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Line, Group, Rect, Circle } from "react-konva"
import { useWorkspaceStore, type Annotation } from "@/store/useWorkspaceStore"
import { ShapeAnnotation } from "./annotations/ShapeAnnotation"
import { LineAnnotation } from "./annotations/LineAnnotation"
import { TextAnnotation } from "./annotations/TextAnnotation"
import { StickyNoteAnnotation } from "./annotations/StickyNoteAnnotation"
import { CloudAnnotation } from "./annotations/CloudAnnotation"
import { HighlightAnnotation } from "./annotations/HighlightAnnotation"
import { SignatureAnnotation } from "./annotations/SignatureAnnotation"

interface AnnotationLayerProps {
  pageNumber: number
  width: number
  height: number
  scale: number
}

export function AnnotationLayer({ pageNumber, width, height, scale }: AnnotationLayerProps) {
  const { 
    activeTool, 
    annotations, 
    addAnnotation, 
    updateAnnotation, 
    deleteAnnotation,
    selectedAnnotationId, 
    setSelectedAnnotationId,
    toolDefaults,
    showToast,
    hasShownHighlightWarning,
    setHasShownHighlightWarning
  } = useWorkspaceStore()
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // -- Tool Switch Cleanup --
  useEffect(() => {
    window.getSelection()?.removeAllRanges()
    setIsDrawing(false)
    setCurrentAnnotation(null)
  }, [activeTool])

  // -- TextLayer Detection for Highlight Warning --
  useEffect(() => {
    if (activeTool === 'highlight') {
      if (!hasShownHighlightWarning) {
        const checkTextLayer = () => {
          const textLayer = containerRef.current?.parentElement?.querySelector('.textLayer')
          // Wait a tiny bit just in case it's rendering, though it should be done
          if (textLayer) {
            const hasText = textLayer.children.length > 0
            if (!hasText) {
              showToast(
                "Text Highlight Unavailable", 
                "This PDF contains image-based content. Text highlighting requires selectable text or OCR."
              )
              setHasShownHighlightWarning(true)
            }
          }
        }
        // Small delay to ensure DOM is ready
        setTimeout(checkTextLayer, 200)
      }
    } else {
      // Reset warning flag when switching away from highlight tool
      if (hasShownHighlightWarning) {
        setHasShownHighlightWarning(false)
      }
    }
  }, [activeTool, hasShownHighlightWarning, showToast, setHasShownHighlightWarning])

  // -- Highlighting Logic --
  useEffect(() => {
    if (activeTool !== 'highlight') return

    let startPos = { x: 0, y: 0 }
    const handlePointerDown = (e: PointerEvent) => { 
      startPos = { x: e.clientX, y: e.clientY } 
    }
    
    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y)
      if (dist < 10) return // Just a click, ignore

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        return
      }

      const range = selection.getRangeAt(0)
      const rects = Array.from(range.getClientRects())
      
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const mappedRects = rects.map(r => ({
        x: (r.left - containerRect.left) / scale,
        y: (r.top - containerRect.top) / scale,
        width: r.width / scale,
        height: r.height / scale
      }))

      if (mappedRects.length > 0) {
        const first = mappedRects[0]
        if (first.y >= 0 && first.y <= height && first.x >= 0 && first.x <= width) {
          const newId = Math.random().toString(36).substr(2, 9)
          addAnnotation({
            id: newId,
            pageNumber,
            type: "highlight",
            x: 0,
            y: 0,
            rects: mappedRects,
            color: toolDefaults.highlight?.color || "rgba(255, 226, 64, 0.5)",
            opacity: toolDefaults.highlight?.opacity || 0.5,
            blendMode: toolDefaults.highlight?.blendMode || "multiply"
          })
          
          setTimeout(() => {
            window.getSelection()?.removeAllRanges()
          }, 10)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('pointerdown', handlePointerDown)
    }
    document.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      if (container) container.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [activeTool, scale, pageNumber, height, width, toolDefaults, addAnnotation])


  const { eraserSettings, deleteAnnotations } = useWorkspaceStore()
  
  // Local state for fading annotations
  const [fadingIds, setFadingIds] = useState<string[]>([])
  const [hoveredEraserId, setHoveredEraserId] = useState<string | null>(null)
  
  // Brush Erase state
  const [brushPos, setBrushPos] = useState<{x: number, y: number} | null>(null)
  const [sessionErasedIds, setSessionErasedIds] = useState<string[]>([])

  const handleErase = (ann: Annotation, isBatch: boolean = false) => {
    if (!eraserSettings.eraseLocked && ann.locked) return
    if (fadingIds.includes(ann.id)) return // already fading
    
    // Animate
    setFadingIds(prev => [...prev, ann.id])
    
    if (isBatch) {
      setSessionErasedIds(prev => [...prev, ann.id])
      // Batch actual delete is handled on pointer up
    } else {
      // Show single Toast
      useWorkspaceStore.getState().showToast(
        "Success", 
        `Deleted ${ann.type.replace('_', ' ')} annotation`, 
        5000,
        { label: "Undo", onClick: () => useWorkspaceStore.getState().undo() }
      )
      
      // Actual single delete after animation
      setTimeout(() => {
        deleteAnnotation(ann.id)
        setFadingIds(prev => prev.filter(id => id !== ann.id))
      }, 150) // 150ms fade
    }
  }

  const handlePointerDown = (e: any) => {
    if (activeTool === "highlight") return // Handled by DOM text selection
    
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    if (activeTool === "pointer") {
      const clickedOnEmpty = e.target === stage
      if (clickedOnEmpty) {
        setSelectedAnnotationId(null)
      }
      return
    }

    if (activeTool === "hand") {
      const container = containerRef.current?.closest('.custom-scrollbar') || document.querySelector('.custom-scrollbar')
      if (container) {
        setIsDrawing(true)
        handScrollRef.current = {
          x: e.evt.clientX,
          y: e.evt.clientY,
          scrollLeft: container.scrollLeft,
          scrollTop: container.scrollTop,
          container
        }
      }
      return
    }

    if (activeTool === "eraser") {
      if (eraserSettings.mode === "drag") {
        setIsDrawing(true)
        const x = pos.x / scale
        const y = pos.y / scale
        setCurrentAnnotation({
          id: Math.random().toString(36).substr(2, 9),
          pageNumber,
          type: "eraser_stroke",
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          points: [x, y, x, y],
          color: "rgba(0,0,0,1)", 
          strokeWidth: eraserSettings.brushSize,
          opacity: 1
        })
      }
      return
    }

    const x = pos.x / scale
    const y = pos.y / scale
    const newId = Math.random().toString(36).substr(2, 9)
    const defaults = toolDefaults[activeTool] || {}

    const isLineBased = ["line", "arrow", "freedraw", "highlight"].includes(activeTool)

    const baseAnnotation: Annotation = {
      id: newId,
      pageNumber,
      type: activeTool,
      x: isLineBased ? 0 : x,
      y: isLineBased ? 0 : y,
      width: 0,
      height: 0,
      points: [x, y, x, y], // Double point for lines/arrows
      color: defaults.color || "#e11d48",
      strokeWidth: defaults.strokeWidth || 3,
      opacity: defaults.opacity || 1,
      ...defaults
    }

    setIsDrawing(true)
    setCurrentAnnotation(baseAnnotation)
  }

  const handlePointerMove = (e: any) => {
    if (activeTool === "hand" && handScrollRef.current) {
      const dx = e.evt.clientX - handScrollRef.current.x
      const dy = e.evt.clientY - handScrollRef.current.y
      if (handScrollRef.current.container) {
        handScrollRef.current.container.scrollLeft = handScrollRef.current.scrollLeft - dx
        handScrollRef.current.container.scrollTop = handScrollRef.current.scrollTop - dy
      }
      return
    }

    if (activeTool === "eraser" && eraserSettings.mode === "drag") {
      const stage = e.target.getStage()
      const pos = stage.getPointerPosition()
      if (pos) {
        setBrushPos(pos)
        
        if (isDrawing && currentAnnotation) {
           const brushX = pos.x / scale
           const brushY = pos.y / scale
           setCurrentAnnotation({
             ...currentAnnotation,
             points: [...(currentAnnotation.points || []), brushX, brushY]
           })
        }
      }
      return
    }

    if (!isDrawing || !currentAnnotation) return

    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    const x = pos.x / scale
    const y = pos.y / scale

    if (activeTool === "freedraw") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), x, y]
      })
    } else if (activeTool === "line" || activeTool === "arrow") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [currentAnnotation.points![0], currentAnnotation.points![1], x, y]
      })
    } else {
      // Rectangle, Oval, Cloud, Text, Sticky Note
      // Calculate width/height from origin x/y
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y
      })
    }
  }

  const handlePointerUp = (e: any) => {
    if (activeTool === "hand") {
      setIsDrawing(false)
      handScrollRef.current = null
      return
    }
    
    if (activeTool === "eraser") {
      if (eraserSettings.mode === "drag" && isDrawing && currentAnnotation) {
        addAnnotation(currentAnnotation)
        setCurrentAnnotation(null)
      }
      setIsDrawing(false)
      return
    }

    if (!isDrawing || !currentAnnotation) return
    setIsDrawing(false)
    
    // Normalize negative widths/heights (if user dragged up/left)
    let finalAnnotation = { ...currentAnnotation }
    if (["rectangle", "oval", "cloud", "text", "sticky_note", "signature"].includes(activeTool)) {
      if (finalAnnotation.width! < 0) {
        finalAnnotation.x += finalAnnotation.width!
        finalAnnotation.width = Math.abs(finalAnnotation.width!)
      }
      if (finalAnnotation.height! < 0) {
        finalAnnotation.y += finalAnnotation.height!
        finalAnnotation.height = Math.abs(finalAnnotation.height!)
      }
    }

    if (activeTool === "signature") {
      const { setPendingSignaturePosition, setSignatureModalOpen } = useWorkspaceStore.getState()
      
      // Default to 150x60 if they just clicked (no drag)
      let sigWidth = finalAnnotation.width!
      let sigHeight = finalAnnotation.height!
      if (sigWidth < 20 || sigHeight < 20) {
        sigWidth = 150
        sigHeight = 60
      }

      setPendingSignaturePosition({ 
        x: finalAnnotation.x, 
        y: finalAnnotation.y, 
        width: sigWidth,
        height: sigHeight,
        pageNumber 
      })
      setTimeout(() => {
        setSignatureModalOpen(true)
      }, 50)
      
      setCurrentAnnotation(null)
      return
    }

    // Min size for text/note if they just clicked without dragging
    if (activeTool === "text") {
      if (finalAnnotation.width! < 20) finalAnnotation.width = 150
      if (finalAnnotation.height! < 20) finalAnnotation.height = 50
      finalAnnotation.isEditing = true
    } else if (activeTool === "sticky_note") {
      if (finalAnnotation.width! < 20) finalAnnotation.width = 32
      if (finalAnnotation.height! < 20) finalAnnotation.height = 32
      finalAnnotation.isEditing = true
    }

    addAnnotation(finalAnnotation)
    setCurrentAnnotation(null)
    setSelectedAnnotationId(finalAnnotation.id)
  }

  const pageAnnotations = annotations
    .filter(a => a.pageNumber === pageNumber)
    .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))

  const renderAnnotations = currentAnnotation ? [...pageAnnotations, currentAnnotation] : pageAnnotations

  // Determine cursor
  let cursor = 'crosshair'
  if (activeTool === 'pointer') cursor = 'default'
  if (activeTool === 'hand') cursor = isDrawing ? 'grabbing' : 'grab'
  if (activeTool === 'text') cursor = 'crosshair'
  if (activeTool === 'highlight') cursor = 'text'
  if (activeTool === 'eraser') {
    if (eraserSettings.mode === 'drag') {
      cursor = 'none'
    } else {
      cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>') 12 21, crosshair`
    }
  }
  if (activeTool === 'signature') cursor = 'crosshair'

  // If highlight tool, we want to allow mouse events to pass through the canvas to the text layer
  const pointerEvents = activeTool === 'highlight' ? 'none' : 'auto'

  return (
    <div className="absolute inset-0 z-40" ref={containerRef} style={{ pointerEvents, cursor }}>
      {/* Tooltip for Eraser (Only show in click mode, not brush mode) */}
      {activeTool === "eraser" && eraserSettings.mode === "click" && hoveredEraserId && (
        <div className="pointer-events-none absolute z-50 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-8 flex items-center gap-1.5"
             style={{ 
               left: containerRef.current?.querySelector('canvas')?.getBoundingClientRect().left || 0,
             }}>
        </div>
      )}
      
      <Stage
        width={width * scale}
        height={height * scale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setBrushPos(null)}
        style={{ cursor }}
      >
        <Layer scaleX={scale} scaleY={scale}>
          {renderAnnotations.map((ann) => {
            if (ann.hidden) return null
            
            const isSelected = ann.id === selectedAnnotationId
            const isFading = fadingIds.includes(ann.id)
            const isHovered = hoveredEraserId === ann.id
            const isLocked = ann.locked
            
            // Should we apply hover glow?
            const canErase = !isLocked || eraserSettings.eraseLocked
            const applyHoverGlow = activeTool === "eraser" && isHovered && canErase

            // Eraser logic wrapper props
            const eraserProps = activeTool === "eraser" ? {
              onMouseEnter: (e: any) => {
                e.target.getStage().container().style.cursor = 'pointer'
                if (eraserSettings.highlightFirst && canErase) {
                   setHoveredEraserId(ann.id)
                }
              },
              onMouseLeave: (e: any) => {
                // Restore custom eraser cursor
                e.target.getStage().container().style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>') 12 21, crosshair`
                setHoveredEraserId(null)
              },
              onClick: () => {
                if (eraserSettings.mode === "click") handleErase(ann)
              },
              onTap: () => {
                if (eraserSettings.mode === "click") handleErase(ann)
              },
              // For group styling:
              opacity: isFading ? 0 : 1,
              scaleX: isFading ? 0.95 : (applyHoverGlow ? 1.02 : 1),
              scaleY: isFading ? 0.95 : (applyHoverGlow ? 1.02 : 1),
              offsetX: applyHoverGlow ? ann.width! * 0.01 : 0, // slight offset to center scale
              offsetY: applyHoverGlow ? ann.height! * 0.01 : 0,
              // Shadow glow for hover
              shadowColor: applyHoverGlow ? "red" : undefined,
              shadowBlur: applyHoverGlow ? 15 : 0,
              shadowOpacity: applyHoverGlow ? 0.5 : 0,
            } : {}

            const groupProps = {
               key: ann.id,
               id: ann.id, // Ensure id is attached to Group for getIntersection to find it
               ...eraserProps
            }

            if (ann.type === "rectangle" || ann.type === "oval") {
              return <Group {...groupProps}><ShapeAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red', strokeWidth: ann.strokeWidth! + 2 } : ann} isSelected={isSelected} /></Group>
            }
            if (ann.type === "line" || ann.type === "arrow") {
              return <Group {...groupProps}><LineAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red', strokeWidth: ann.strokeWidth! + 2 } : ann} isSelected={isSelected} /></Group>
            }
            if (ann.type === "text" || ann.type === "sticky_note" || ann.type === "signature") {
              if (isDrawing && ann.id === currentAnnotation?.id) {
                let rectX = ann.x
                let rectY = ann.y
                let rectWidth = ann.width || 0
                let rectHeight = ann.height || 0

                if (rectWidth < 0) {
                  rectX += rectWidth
                  rectWidth = Math.abs(rectWidth)
                }
                if (rectHeight < 0) {
                  rectY += rectHeight
                  rectHeight = Math.abs(rectHeight)
                }

                const isSignature = ann.type === "signature"

                return (
                  <Rect
                    key={ann.id}
                    x={rectX}
                    y={rectY}
                    width={rectWidth}
                    height={rectHeight}
                    stroke={isSignature ? "#64748b" : "#3b82f6"} // slate-500 for signature
                    strokeWidth={isSignature ? 2 : 2}
                    dash={isSignature ? [5, 5] : undefined} // Dotted/dashed for signature
                    fill={isSignature ? "rgba(100, 116, 139, 0.1)" : "rgba(59, 130, 246, 0.1)"}
                  />
                )
              }
              // Normal render for text/sticky if they are NOT drawing
              if (ann.type === "text") {
                return <Group {...groupProps}><TextAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red' } : ann} isSelected={isSelected} /></Group>
              }
              if (ann.type === "sticky_note") {
                return <Group {...groupProps}><StickyNoteAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red' } : ann} isSelected={isSelected} /></Group>
              }
              // If it's a signature, let it fall through to the line 410 check!
            }

            if (ann.type === "cloud") {
              return <Group {...groupProps}><CloudAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red', strokeWidth: ann.strokeWidth! + 2 } : ann} isSelected={isSelected} /></Group>
            }
            if (ann.type === "highlight") {
              return <Group {...groupProps}><HighlightAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red' } : ann} isSelected={isSelected} /></Group>
            }
            if (ann.type === "signature") {
              return <Group {...groupProps}><SignatureAnnotation annotation={applyHoverGlow ? { ...ann, color: 'red' } : ann} isSelected={isSelected} /></Group>
            }
            
            if (ann.type === "freedraw") {
              return (
                <Line
                  key={ann.id}
                  id={ann.id} // ID on the line itself so intersection finds it
                  points={ann.points || []}
                  stroke={applyHoverGlow ? "red" : (isSelected ? "#3b82f6" : ann.color)}
                  strokeWidth={applyHoverGlow ? ann.strokeWidth! + 2 : ann.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={isFading ? 0 : ann.opacity}
                  scaleX={isFading ? 0.95 : (applyHoverGlow ? 1.02 : 1)}
                  scaleY={isFading ? 0.95 : (applyHoverGlow ? 1.02 : 1)}
                  shadowColor={applyHoverGlow ? "red" : undefined}
                  shadowBlur={applyHoverGlow ? 15 : 0}
                  draggable={activeTool === "pointer" && !ann.locked}
                  onClick={() => activeTool === "pointer" && setSelectedAnnotationId(ann.id)}
                  onTap={() => activeTool === "pointer" && setSelectedAnnotationId(ann.id)}
                  onDragEnd={(e) => updateAnnotation(ann.id, { x: e.target.x(), y: e.target.y() })}
                  {...eraserProps}
                />
              )
            }
            if (ann.type === "eraser_stroke") {
              return (
                <Line
                  key={ann.id}
                  points={ann.points || []}
                  stroke="black"
                  strokeWidth={ann.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="destination-out"
                />
              )
            }
            return null
          })}

          {/* Brush Erase Cursor Rendering */}
          {activeTool === "eraser" && eraserSettings.mode === "drag" && brushPos && (
            <Circle
              x={brushPos.x / scale}
              y={brushPos.y / scale}
              radius={(eraserSettings.brushSize / 2) / scale}
              fill="rgba(100, 116, 139, 0.1)"
              stroke={isDrawing ? "#ef4444" : "#3b82f6"} // Red when erasing, blue when idle
              strokeWidth={1.5 / scale}
              listening={false}
            />
          )}

        </Layer>
      </Stage>
    </div>
  )
}
