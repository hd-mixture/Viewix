import { useEffect, useRef } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { PdfPage } from "./PdfPage"
import { Toolbar } from "@/components/Toolbar"
import { MobileToolbar } from "@/components/workspace/MobileToolbar"
import { MobilePropertiesPanel } from "@/components/workspace/MobilePropertiesPanel"
import { MobileQuickActions } from "@/components/workspace/MobileQuickActions"
import { useHotkeys } from "react-hotkeys-hook"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
export function PdfViewer() {
  const { pdfDocument, pdfFile, numPages, zoom, setZoom, currentPage, setCurrentPage, activeTool, selectedAnnotationId, annotations } = useWorkspaceStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedAnnotationId && window.innerWidth < 768) {
      const annotation = annotations.find(a => a.id === selectedAnnotationId)
      const container = containerRef.current
      if (annotation && container) {
        const pageEl = document.getElementById(`page-${annotation.pageNumber}`)
        if (pageEl) {
          setTimeout(() => {
            const pageRect = pageEl.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            const absolutePageTop = (pageRect.top - containerRect.top) + container.scrollTop
            const targetScrollY = absolutePageTop + (annotation.y * zoom) - 150

            container.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth'
            })
          }, 50)
        }
      }
    }
  }, [selectedAnnotationId])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setZoom(Math.max(0.2, (window.innerWidth - 32) / 595))
    }
  }, [setZoom])
  
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

    let initialDistance = 0
    let initialZoom = zoom

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        initialZoom = useWorkspaceStore.getState().zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        const scale = currentDistance / initialDistance
        setZoom(Math.max(0.2, Math.min(5, initialZoom * scale)))
      }
    }

    const handleTouchEnd = () => {
      initialDistance = 0
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    
    return () => {
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [zoom, setZoom])
  const lastScrolledPageRef = useRef(currentPage)

  useEffect(() => {
    if (currentPage !== lastScrolledPageRef.current) {
      const pageEl = document.getElementById(`page-${currentPage}`)
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      lastScrolledPageRef.current = currentPage
    }
  }, [currentPage])

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
      lastScrolledPageRef.current = mostVisiblePage
      setCurrentPage(mostVisiblePage)
    }
  }

  if (!pdfDocument) return null

  return (
    <>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "absolute inset-0 bg-transparent px-4 md:px-12 pt-4 md:pt-12 pb-32 md:pb-[160px] flex flex-col items-center gap-6 md:gap-12 z-0 custom-scrollbar overflow-y-auto overflow-x-auto"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pdfFile?.name || "document"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-12 w-full"
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
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hidden md:block">
        <Toolbar />
      </div>
      <MobilePropertiesPanel />
      <MobileQuickActions />
      <MobileToolbar />
    </>
  )
}
