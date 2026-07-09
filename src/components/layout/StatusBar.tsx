import { FileCheck, Activity, Maximize, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StatusBar() {
  const { numPages, currentPage, zoom, setZoom, setCurrentPage, activeSidebarTab, toggleFullscreen } = useWorkspaceStore()

  const handleZoomOut = () => setZoom(Math.max(0.1, zoom - 0.1))
  const handleZoomIn = () => setZoom(Math.min(5, zoom + 0.1))
  
  const getLeftPosition = () => {
    if (!activeSidebarTab) return "108px"
    if (activeSidebarTab === "workspace") return "404px"
    return "324px" // Pages, Bookmarks, Comments, Outline, History (200px wide)
  }

  return (
    <footer 
      className="hidden md:flex absolute bottom-6 right-[348px] items-center justify-between px-6 pointer-events-none z-40 transition-all duration-500"
      style={{ left: getLeftPosition() }}
    >
      {/* Left: Status */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/90 dark:bg-[#1e293b]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-lg transition-colors duration-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 tracking-wide transition-colors duration-500">Ready</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#1e293b]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-lg transition-colors duration-500">
          <FileCheck className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 transition-colors duration-500" />
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 tracking-wide transition-colors duration-500">No unsaved changes</span>
        </div>
      </div>
      
      {/* Right: Page Navigation & Zoom */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Page Navigation */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-[#1e293b]/80 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-lg p-1 transition-colors duration-500">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-500"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 px-2 min-w-[70px] text-center transition-colors duration-500">
            Page {currentPage} of {numPages || 1}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-500"
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-[#1e293b]/80 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-lg p-1 transition-colors duration-500">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-500">
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-12 text-center text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors duration-500">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-500">
            <Plus className="h-3 w-3" />
          </Button>
          <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1 transition-colors duration-500" />
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-500">
            <Maximize className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </footer>
  )
}
