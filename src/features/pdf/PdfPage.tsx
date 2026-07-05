import { useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { AnnotationLayer } from "./AnnotationLayer"
import "pdfjs-dist/web/pdf_viewer.css" // Import CSS for TextLayer

interface PdfPageProps {
  pageNumber: number
  pdfDocument: PDFDocumentProxy
  scale: number
}

export function PdfPage({ pageNumber, pdfDocument, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isVisible, setIsVisible] = useState(false)
  const [page, setPage] = useState<PDFPageProxy | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 1131 }) // Default A4 approx

  const { setCurrentPage, searchQuery, searchMode } = useWorkspaceStore()

  // Intersection Observer for Virtualization
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // If it takes up significant portion of viewport, it's the current page
            if (entry.intersectionRatio > 0.5) {
              setCurrentPage(pageNumber)
            }
          } else {
            // Unload canvas to save memory when far out of view
            // In a real app we might keep a small buffer (prev/next)
            setIsVisible(false)
          }
        })
      },
      { rootMargin: "50% 0px", threshold: [0, 0.5] }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [pageNumber, setCurrentPage])

  // Get Page Dimensions early
  useEffect(() => {
    let active = true
    pdfDocument.getPage(pageNumber).then((pdfPage) => {
      if (!active) return
      setPage(pdfPage)
      const viewport = pdfPage.getViewport({ scale: 1.0 })
      setDimensions({ width: viewport.width, height: viewport.height })
    })
    return () => { active = false }
  }, [pdfDocument, pageNumber])

  // Render Canvas when visible
  useEffect(() => {
    if (!isVisible || !page || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const viewport = page.getViewport({ scale })
    
    // Support high DPI displays
    const outputScale = window.devicePixelRatio || 1
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = Math.floor(viewport.width) + "px"
    canvas.style.height = Math.floor(viewport.height) + "px"

    const transform = outputScale !== 1 
      ? [outputScale, 0, 0, outputScale, 0, 0] 
      : undefined

    const renderContext = {
      canvasContext: context,
      transform,
      viewport,
    }

    const renderTask = page.render(renderContext)
    
    renderTask.promise.then(() => {
      if (textLayerRef.current) {
        // Clear previous text
        textLayerRef.current.innerHTML = ''
        
        page.getTextContent().then((textContent) => {
          if (!textLayerRef.current) return
          
          const textLayer = new pdfjsLib.TextLayer({
            textContentSource: textContent,
            container: textLayerRef.current,
            viewport,
          })
          textLayer.render()
        })
      }
    }).catch((e) => {
      // Rendering might be cancelled
    })

    return () => {
      renderTask.cancel()
    }
  }, [isVisible, page, scale])

  // Apply search highlighting dynamically
  useEffect(() => {
    if (!textLayerRef.current || !isVisible) return
    
    // We use an interval to check when the spans are finally rendered by PDF.js
    const highlightInterval = setInterval(() => {
      const spans = textLayerRef.current?.querySelectorAll("span")
      if (!spans || spans.length === 0) return // Wait until rendered
      
      clearInterval(highlightInterval) // Stop polling once we found the spans
      
      // Reset all highlights first
      spans.forEach(span => {
        span.style.backgroundColor = ""
        span.style.color = "transparent"
        span.style.borderRadius = ""
      })

      if (searchMode === "document" && searchQuery) {
        const lowerQuery = searchQuery.toLowerCase()
        let scrolled = false
        spans.forEach(span => {
          if (span.textContent?.toLowerCase().includes(lowerQuery)) {
            span.style.backgroundColor = "rgba(250, 204, 21, 0.4)" // yellow-400/40 for better contrast over canvas text
            span.style.borderRadius = "2px"
            
            if (!scrolled && useWorkspaceStore.getState().currentPage === pageNumber) {
              span.scrollIntoView({ behavior: 'smooth', block: 'center' })
              scrolled = true
            }
          }
        })
      }
    }, 200)

    return () => clearInterval(highlightInterval)
  }, [searchQuery, searchMode, pageNumber, isVisible])

  return (
    <div 
      ref={containerRef}
      className="relative bg-white shadow-xl dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex-shrink-0 transition-shadow hover:shadow-2xl dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] select-none rounded-[1px] border border-slate-200/80 dark:border-white/10"
      style={{ 
        width: dimensions.width * scale, 
        height: dimensions.height * scale 
      }}
    >
      {isVisible ? (
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          Loading Page {pageNumber}...
        </div>
      )}
      
      {isVisible && (
        <div 
          ref={textLayerRef} 
          className="absolute inset-0 textLayer" 
          style={{ opacity: 1, pointerEvents: 'auto', userSelect: 'text' }} // Ensure it's selectable
        />
      )}
      
      {isVisible && (
        <AnnotationLayer 
          pageNumber={pageNumber} 
          width={dimensions.width} 
          height={dimensions.height} 
          scale={scale} 
        />
      )}
    </div>
  )
}
