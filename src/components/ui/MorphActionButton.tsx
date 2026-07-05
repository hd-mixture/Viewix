import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, UploadCloud, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as pdfjsLib from "pdfjs-dist"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useToastStore } from "@/store/useToastStore"

const springConfig = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.9
}

interface MorphActionButtonProps {
  onExport: () => Promise<void>
}

export function MorphActionButton({ onExport }: MorphActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredSegment, setHoveredSegment] = useState<'export' | 'upload' | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { pdfFile, setPdfDocument, setPdfFile, resetWorkspace } = useWorkspaceStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
        setHoveredSegment(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // Click outside to collapse on tablet
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
        setHoveredSegment(null)
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== "application/pdf") return
    
    setIsUploading(true)
    setShowMobileSheet(false)
    setIsExpanded(false)
    setHoveredSegment(null)

    try {
      resetWorkspace() // Reset annotations
      const url = URL.createObjectURL(file)
      const config = { url: url }
      const loadingTask = pdfjsLib.getDocument(config)
      const doc = await loadingTask.promise
      
      setPdfFile(file)
      setPdfDocument(doc)
      
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error("PDF Parsing Error: ", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const triggerExport = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (!pdfFile || isExporting) return
    setIsExporting(true)
    setShowMobileSheet(false)
    try {
      await onExport()
      addToast({
        title: "Success",
        description: "PDF exported successfully",
        type: "success"
      })
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "An error occurred while exporting",
        type: "error"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const triggerUpload = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleContainerInteraction = () => {
    if (isMobile) {
      setShowMobileSheet(true)
    } else {
      setIsExpanded(true)
    }
  }

  // Keydown for accessibility
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleContainerInteraction()
    }
  }

  const exportSegmentWidth = hoveredSegment === 'upload' ? '25%' : hoveredSegment === 'export' ? '75%' : '50%'
  const uploadSegmentWidth = hoveredSegment === 'export' ? '25%' : hoveredSegment === 'upload' ? '75%' : '50%'

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="application/pdf" 
        className="hidden" 
      />

      {/* Main Desktop/Tablet Button */}
      <motion.div
        ref={containerRef}
        layout
        transition={springConfig}
        className={cn(
          "relative flex items-center overflow-hidden rounded-full h-[44px] shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-[170px]",
          !pdfFile && "opacity-50 pointer-events-none"
        )}
        style={{
          boxShadow: (hoveredSegment === 'upload' || showMobileSheet) 
            ? '0 10px 30px -10px rgba(16, 185, 129, 0.4)'
            : '0 10px 30px -10px rgba(59, 130, 246, 0.4)'
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            setHoveredSegment(null)
          }
        }}
        onClick={handleContainerInteraction}
        onKeyDown={handleContainerKeyDown}
        tabIndex={0}
      >
        {/* Export Segment */}
        <motion.div
          layout
          className={cn(
            "h-full flex items-center justify-center relative overflow-hidden transition-colors duration-300",
            (hoveredSegment === 'export' || hoveredSegment === null) 
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" 
              : "bg-slate-800/80 backdrop-blur-md text-white/70 hover:text-white"
          )}
          style={{ width: exportSegmentWidth }}
          onMouseEnter={() => !isMobile && setHoveredSegment('export')}
          onClick={triggerExport}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerExport(e)}
          tabIndex={0}
          role="button"
        >
          <div className="flex items-center justify-center whitespace-nowrap overflow-hidden">
            <motion.div 
              animate={{ y: hoveredSegment === 'export' ? -2 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex-shrink-0"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </motion.div>
            
            <AnimatePresence>
              {hoveredSegment === 'export' && (
                <motion.span 
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="font-medium text-sm overflow-hidden"
                >
                  {isExporting ? "Exporting..." : "Export PDF"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          layout
          className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[70%] bg-white/20 backdrop-blur-sm z-10 pointer-events-none"
          style={{
            boxShadow: '0 0 8px rgba(255,255,255,0.3)',
            left: exportSegmentWidth
          }}
        />

        {/* Upload Segment */}
        <motion.div
          layout
          className={cn(
            "h-full flex items-center justify-center relative overflow-hidden transition-colors duration-300",
            hoveredSegment === 'upload' 
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" 
              : "bg-slate-800/80 backdrop-blur-md text-white/70 hover:text-white"
          )}
          style={{ width: uploadSegmentWidth }}
          onMouseEnter={() => !isMobile && setHoveredSegment('upload')}
          onClick={triggerUpload}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerUpload(e)}
          tabIndex={0}
          role="button"
        >
          <div className="flex items-center justify-center whitespace-nowrap overflow-hidden">
            <motion.div
              animate={{ y: hoveredSegment === 'upload' ? -2 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex-shrink-0"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            </motion.div>

            <AnimatePresence>
              {hoveredSegment === 'upload' && (
                <motion.span 
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="font-medium text-sm overflow-hidden"
                >
                  {isUploading ? "Uploading..." : "Change PDF"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Bottom Sheet Fallback */}
      <AnimatePresence>
        {showMobileSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setShowMobileSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] rounded-t-2xl z-[101] p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={triggerExport}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-blue-600 text-white rounded-xl font-medium"
                >
                  {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Export PDF
                </button>
                <button
                  onClick={triggerUpload}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  Change PDF
                </button>
                <button
                  onClick={() => setShowMobileSheet(false)}
                  className="w-full h-12 mt-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
