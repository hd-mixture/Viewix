import { useEffect, useRef } from "react"
import { Line, Transformer, Group } from "react-konva"
import type { Annotation } from "@/store/useWorkspaceStore"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface CloudAnnotationProps {
  annotation: Annotation
  isSelected: boolean
}

function generateCloudPoints(width: number, height: number, density: number, shape: "rectangle" | "circle" = "rectangle"): number[] {
  const points: number[] = []
  
  if (shape === "circle") {
    // Generate points along an ellipse
    const rx = width / 2
    const ry = height / 2
    const cx = rx
    const cy = ry
    
    // Density maps to number of bumps (e.g. 5 to 20)
    const numBumps = Math.max(6, Math.floor(density * 4))
    const stepsPerBump = 4
    const totalSteps = numBumps * stepsPerBump
    
    // Average bump amplitude
    const amplitude = Math.min(rx, ry) * 0.15 * (5 / density)
    
    for (let i = 0; i <= totalSteps; i++) {
      const angle = (i / totalSteps) * Math.PI * 2
      // Sine wave superimposed on the radius
      const bumpPhase = (i / stepsPerBump) * Math.PI * 2
      const r_offset = Math.sin(bumpPhase) * amplitude
      
      const rCurrentX = rx + r_offset
      const rCurrentY = ry + r_offset
      
      const px = cx + rCurrentX * Math.cos(angle)
      const py = cy + rCurrentY * Math.sin(angle)
      points.push(px, py)
    }
  } else {
    // Rectangle shape
    const bumpCountX = Math.max(2, Math.floor((width / 100) * density * 3))
    const bumpCountY = Math.max(2, Math.floor((height / 100) * density * 3))
    
    const stepX = width / bumpCountX
    const stepY = height / bumpCountY
    const amplitude = Math.min(stepX, stepY) * 0.5 

    for (let i = 0; i <= bumpCountX; i++) {
      const x = i * stepX
      const y = (i % 2 !== 0 && i !== bumpCountX) ? -amplitude : 0
      points.push(x, y)
    }
    for (let i = 1; i <= bumpCountY; i++) {
      const x = width + ((i % 2 !== 0 && i !== bumpCountY) ? amplitude : 0)
      const y = i * stepY
      points.push(x, y)
    }
    for (let i = 1; i <= bumpCountX; i++) {
      const x = width - i * stepX
      const y = height + ((i % 2 !== 0 && i !== bumpCountX) ? amplitude : 0)
      points.push(x, y)
    }
    for (let i = 1; i < bumpCountY; i++) {
      const x = (i % 2 !== 0) ? -amplitude : 0
      const y = height - i * stepY
      points.push(x, y)
    }
  }
  return points
}

export function CloudAnnotation({ annotation, isSelected }: CloudAnnotationProps) {
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
      width: Math.max(20, (annotation.width || 0) * scaleX),
      height: Math.max(20, (annotation.height || 0) * scaleY),
    })
  }

  const w = Math.max(20, annotation.width || 0)
  const h = Math.max(20, annotation.height || 0)
  const points = generateCloudPoints(w, h, annotation.density || 3, annotation.cloudShape || "rectangle")

  return (
    <Group 
      x={annotation.x} 
      y={annotation.y} 
      draggable={activeTool === "pointer"}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
      onTap={handleSelect}
    >
      <Line
        ref={shapeRef}
        points={points}
        closed
        tension={0.4} // Smooths out the zig-zag into scallops!
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={annotation.fillColor !== "transparent" ? annotation.fillColor : undefined}
        opacity={annotation.opacity}
        onTransformEnd={handleTransformEnd}
      />

      {isSelected && activeTool === "pointer" && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) return oldBox
            return newBox
          }}
        />
      )}
    </Group>
  )
}
