import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Search, Undo2, Redo2, Settings, Sun, Moon, Maximize, ZoomIn, ZoomOut, CheckCircle2, ChevronLeft } from "lucide-react"
import { UniversalSearch } from "@/components/search/UniversalSearch"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { exportPdfWithAnnotations } from "@/utils/export"
import { useTheme } from "next-themes"
import { MorphActionButton } from "@/components/ui/MorphActionButton"
import { useState } from "react"
import { ComingSoonModal } from "@/components/ui/modals/ComingSoonModal"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { pdfFile, annotations, undo, redo, pastAnnotations, futureAnnotations, zoom, setZoom, openedFromDashboard, resetWorkspace, isSaving } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()
  const [comingSoonType, setComingSoonType] = useState<"settings" | "profile" | null>(null)
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState("")

  const handleSaveName = () => {
    setIsEditingName(false)
    if (!editName.trim() || !pdfFile) return
    
    // Create new file with updated name
    const newName = editName.trim() + ".pdf"
    if (newName !== pdfFile.name) {
      const currentAnnotations = useWorkspaceStore.getState().annotations;
      // Transfer annotations to new name in localStorage before setPdfFile resets them
      localStorage.setItem(`viewix_annotations_${newName}`, JSON.stringify(currentAnnotations))
      
      const newFile = new File([pdfFile], newName, { type: pdfFile.type })
      useWorkspaceStore.getState().setPdfFile(newFile)
      
      // Save to recent files with the new name
      useWorkspaceStore.getState().saveCurrentToRecent(editName.trim(), currentAnnotations)
    }
  }

  const handleExportAsync = async () => {
    if (pdfFile) {
      await exportPdfWithAnnotations(pdfFile, annotations)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="absolute top-0 left-0 right-0 h-[72px] flex items-center justify-between px-6 z-50">
      
      {/* Left: Logo & Doc Info */}
      <div className="flex items-center gap-4 flex-1">
        {openedFromDashboard && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetWorkspace} 
            className="h-9 w-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent dark:border-white/5" 
            title="Back to Dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Logo className="scale-90 origin-left" />
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') setIsEditingName(false)
                }}
                className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-blue-500 rounded px-1.5 py-0.5 outline-none w-48"
                autoFocus
              />
            ) : (
              <span 
                className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => {
                  setEditName(pdfFile?.name.replace('.pdf', '') || "Untitled Document")
                  setIsEditingName(true)
                }}
                title="Click to rename"
              >
                {pdfFile?.name || "Untitled Document.pdf"}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 cursor-default">PDF</span>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            Updated just now
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center hidden md:flex items-center gap-4">
        <UniversalSearch />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 flex-1">
        
        <div className={cn("hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mr-2 whitespace-nowrap transition-colors", 
          isSaving 
            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
            : "text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
        )}>
          {isSaving ? (
            <div className="w-3.5 h-3.5 shrink-0 border-2 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{isSaving ? "Saving..." : "All changes saved"}</span>
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

        <div className="ml-2 z-[60]">
          <MorphActionButton onExport={handleExportAsync} />
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => setComingSoonType("settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <button 
          onClick={() => setComingSoonType("profile")}
          className="h-8 w-8 rounded-full border-2 border-slate-200 dark:border-white/10 overflow-hidden ml-1 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4F46E5" alt="User" className="w-full h-full object-cover" />
        </button>
      </div>

      <ComingSoonModal 
        isOpen={comingSoonType !== null} 
        onClose={() => setComingSoonType(null)} 
        type={comingSoonType || "settings"} 
      />
    </header>
  )
}
