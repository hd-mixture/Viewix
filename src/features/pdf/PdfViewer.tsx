import { useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { PdfPage } from "./PdfPage"
import { Toolbar } from "@/components/Toolbar"
import { useHotkeys } from "react-hotkeys-hook"

export function PdfViewer() {
  const { pdfDocument, numPages, zoom, setZoom, currentPage, setCurrentPage } = useWorkspaceStore()
  const containerRef = useRef<HTMLDivElement>(null)
  
  useHotkeys("mod+=", (e) => {
    e.preventDefault()
    setZoom(Math.min(3, zoom + 0.1))
  }, { enableOnFormTags: false }, [zoom, setZoom])

  useHotkeys("mod+-", (e) => {
    e.preventDefault()
    setZoom(Math.max(0.5, zoom - 0.1))
  }, { enableOnFormTags: false }, [zoom, setZoom])

  useHotkeys("mod+0", (e) => {
    e.preventDefault()
    // Fit Page roughly scales to container height
    if (containerRef.current) {
      const height = containerRef.current.clientHeight - 64
      setZoom(height / 842) // 842 is rough A4 height
    }
  }, { enableOnFormTags: false }, [setZoom])

  useHotkeys("mod+1", (e) => {
    e.preventDefault()
    // Fit Width roughly scales to container width
    if (containerRef.current) {
      const width = containerRef.current.clientWidth - 64
      setZoom(width / 595) // 595 is rough A4 width
    }
  }, { enableOnFormTags: false }, [setZoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        // Smooth proportional zoom handling both trackpad and standard mouse wheels
        let delta = e.deltaY
        if (e.deltaMode === 1) delta *= 33 // Convert lines to roughly pixels
        
        const zoomFactor = Math.exp(-delta * 0.005)
        setZoom(Math.max(0.2, Math.min(5, zoom * zoomFactor)))
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [zoom, setZoom])

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    let maxVisibleHeight = 0
    let mostVisiblePage = currentPage

    const pages = container.querySelectorAll('[id^="page-"]')
    const containerRect = container.getBoundingClientRect()

    pages.forEach(page => {
      const rect = page.getBoundingClientRect()
      const visibleTop = Math.max(rect.top, containerRect.top)
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight
        mostVisiblePage = parseInt(page.id.replace('page-', ''))
      }
    })

    if (mostVisiblePage !== currentPage && !isNaN(mostVisiblePage)) {
      setCurrentPage(mostVisiblePage)
    }
  }

  if (!pdfDocument) return null

  return (
    <>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto overflow-x-auto bg-transparent px-12 pt-12 pb-[160px] flex flex-col items-center gap-12 z-0 custom-scrollbar"
      >
        {Array.from({ length: numPages }).map((_, index) => (
          <div id={`page-${index + 1}`} key={index}>
            <PdfPage 
              pageNumber={index + 1} 
              pdfDocument={pdfDocument} 
              scale={zoom}
            />
          </div>
        ))}
      </div>
      <Toolbar />
    </>
  )
}
