import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Grid, List, Clock, MoreVertical, FileText, Pin, Trash2, Copy, Edit2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPdfFromDB } from "@/lib/db"

interface RecentFile {
  name: string
  size: number
  pages: number
  timestamp: number
  pinned?: boolean
}

interface RecentFilesTabProps {
  onOpenFile?: (file: File) => void
}

export function RecentFilesTab({ onOpenFile }: RecentFilesTabProps) {
  const [files, setFiles] = useState<RecentFile[]>([])
  const [starredFiles, setStarredFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
    setFiles(stored)
    
    const starred = JSON.parse(localStorage.getItem('viewix_starred') || '[]')
    setStarredFiles(new Set(starred.map((s: any) => s.name)))
  }, [])

  const filteredFiles = files
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Pinned always first
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      
      if (sortBy === 'date') return b.timestamp - a.timestamp
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.size - a.size
      return 0
    })

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24))
    if (Math.abs(daysDifference) < 1) return 'Today'
    if (Math.abs(daysDifference) === 1) return 'Yesterday'
    if (Math.abs(daysDifference) < 7) return rtf.format(daysDifference, 'day')
    return new Date(timestamp).toLocaleDateString()
  }

  const handleOpenRecent = async (fileData: RecentFile) => {
    const file = await getPdfFromDB(fileData.name)
    if (file && onOpenFile) {
      onOpenFile(file)
    } else {
      alert("File not found in local storage.")
    }
  }

  const handleRemove = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation()
    const newFiles = files.filter(f => f.name !== fileName)
    setFiles(newFiles)
    localStorage.setItem('viewix_recent', JSON.stringify(newFiles))
  }

  const handleToggleStar = (e: React.MouseEvent, fileData: RecentFile) => {
    e.stopPropagation()
    const stored = JSON.parse(localStorage.getItem('viewix_starred') || '[]')
    
    // Check if already starred
    const existingIndex = stored.findIndex((s: any) => s.name === fileData.name)
    const newStarred = new Set(starredFiles)
    if (existingIndex >= 0) {
      stored.splice(existingIndex, 1)
      newStarred.delete(fileData.name)
    } else {
      stored.push({
        id: fileData.name + Date.now(),
        name: fileData.name,
        size: fileData.size,
        timestamp: Date.now()
      })
      newStarred.add(fileData.name)
    }
    setStarredFiles(newStarred)
    localStorage.setItem('viewix_starred', JSON.stringify(stored))
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Recent Files</h1>
          <p className="text-slate-500 dark:text-slate-400">Pick up right where you left off.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search recent files..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 w-full md:w-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No recent files</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Files you open or upload will appear here for quick access later.</p>
        </div>
      ) : (
        <div className="overflow-y-auto pb-20 custom-scrollbar pr-2">
          
          {(() => {
            const favoriteFiles = filteredFiles.filter(f => starredFiles.has(f.name))
            const otherFiles = filteredFiles.filter(f => !starredFiles.has(f.name))
            
            const renderFile = (file: RecentFile, i: number, isStarred: boolean) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={file.timestamp + file.name}
                onClick={() => handleOpenRecent(file)}
                className={cn(
                  "group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer",
                  viewMode === 'list' ? "flex items-center gap-4" : "flex flex-col"
                )}
              >
                <div className={cn("bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0", viewMode === 'list' ? "w-12 h-12" : "w-full aspect-[4/3] mb-4 relative")}>
                  <FileText className="w-8 h-8 text-blue-500/50" />
                  
                  {/* Star Button */}
                  {viewMode === 'grid' && (
                    <button 
                      onClick={(e) => handleToggleStar(e, file)}
                      className={cn(
                        "absolute top-2 left-2 w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center justify-center transition-opacity z-10",
                        isStarred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Star className={cn("w-4 h-4 transition-colors", isStarred ? "text-amber-500 fill-amber-500" : "text-slate-400 hover:text-amber-500 hover:fill-amber-500")} />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate" title={file.name}>
                      {file.name}
                    </h4>
                    {file.pinned && <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0 fill-blue-500" />}
                  </div>
                  
                  <div className={cn("text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1", viewMode === 'list' && "items-center")}>
                    <span>{formatDate(file.timestamp)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 self-center hidden sm:block" />
                    <span>{formatSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 self-center hidden sm:block" />
                    <span>{file.pages} pages</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                  {viewMode === 'list' && (
                    <button 
                      onClick={(e) => handleToggleStar(e, file)}
                      className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center justify-center"
                    >
                      <Star className={cn("w-4 h-4 transition-colors", isStarred ? "text-amber-500 fill-amber-500" : "text-slate-400 hover:text-amber-500 hover:fill-amber-500")} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleRemove(e, file.name)}
                    className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm flex items-center justify-center group/btn"
                    title="Remove from recent"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 group-hover/btn:text-red-500 transition-colors" />
                  </button>
                </div>
              </motion.div>
            )

            return (
              <div className="space-y-8">
                {favoriteFiles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Favorites</h3>
                    <div className={cn(
                      "grid gap-4",
                      viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"
                    )}>
                      <AnimatePresence mode="popLayout">
                        {favoriteFiles.map((file, i) => renderFile(file, i, true))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                
                {otherFiles.length > 0 && (
                  <div>
                    {favoriteFiles.length > 0 && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Recent</h3>}
                    <div className={cn(
                      "grid gap-4",
                      viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"
                    )}>
                      <AnimatePresence mode="popLayout">
                        {otherFiles.map((file, i) => renderFile(file, i, false))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </motion.div>
  )
}
