import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Search, Undo2, Redo2, Settings, Download, Sun, Moon, Maximize, ZoomIn, ZoomOut, CheckCircle2, FolderOpen } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { exportPdfWithAnnotations } from "@/utils/export"
import { useTheme } from "next-themes"

export function Navbar() {
  const { pdfFile, annotations, undo, redo, pastAnnotations, futureAnnotations, zoom, setZoom } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()

  const handleExport = () => {
    if (pdfFile) {
      exportPdfWithAnnotations(pdfFile, annotations)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="absolute top-0 left-0 right-0 h-[72px] flex items-center justify-between px-6 z-50">
      
      {/* Left: Logo & Doc Info */}
      <div className="flex items-center gap-6">
        <div className="w-[120px]">
          <Logo />
        </div>
        
        {pdfFile && (
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
            <div className="h-10 w-8 bg-blue-50 dark:bg-blue-500/20 rounded flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
              <div className="w-4 h-5 border-2 border-blue-400 rounded-sm flex flex-col gap-1 p-0.5">
                 <div className="w-full h-0.5 bg-blue-400 rounded-full"></div>
                 <div className="w-2/3 h-0.5 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                {pdfFile.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Page 1 of 1</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                <span>Saved just now</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Search & Zoom Controls */}
      <div className="flex-1 flex items-center justify-center gap-6 px-4">
        {/* Search */}
        <div className="flex w-[280px] items-center gap-2 rounded-full bg-white/60 dark:bg-white/5 px-4 py-2 border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-inner transition-colors hover:bg-white focus-within:bg-white dark:hover:bg-white/10 dark:focus-within:bg-white/10 focus-within:border-blue-200 dark:focus-within:border-white/20">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search in document..." 
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 text-slate-800 dark:text-slate-200 font-medium"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            <span>Ctrl</span><span>K</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center gap-1 bg-white/60 dark:bg-white/5 rounded-full p-1 border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-14 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 mr-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All changes saved</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" 
            onClick={undo}
            disabled={pastAnnotations.length === 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" 
            onClick={redo}
            disabled={futureAnnotations.length === 0}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          variant="outline" 
          className="gap-2 text-slate-600 dark:text-slate-300 font-medium rounded-full px-5 h-9 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all ml-2"
          onClick={() => useWorkspaceStore.getState().resetWorkspace()}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Change PDF</span>
        </Button>

        <Button 
          variant="default" 
          className="gap-2 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full px-5 h-9 border border-blue-500/50 transition-all"
          onClick={handleExport}
          disabled={!pdfFile}
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </Button>

        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10">
          <Settings className="h-4 w-4" />
        </Button>
        
        <div className="h-8 w-8 rounded-full border-2 border-slate-200 dark:border-white/10 overflow-hidden ml-1 shadow-sm">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4F46E5" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  )
}
