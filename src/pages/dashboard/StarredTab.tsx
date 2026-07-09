import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Star, FileText, Download, Trash2, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getPdfFromDB } from "@/lib/db"

interface StarredFile {
  id: string
  name: string
  size: number
  timestamp: number
}

interface StarredTabProps {
  onOpenFile?: (file: File) => void
}

export function StarredTab({ onOpenFile }: StarredTabProps) {
  const [files, setFiles] = useState<StarredFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewix_starred') || '[]')
    setFiles(stored)
  }, [])

  const handleOpenStarred = async (fileData: StarredFile) => {
    const file = await getPdfFromDB(fileData.name)
    if (file && onOpenFile) {
      onOpenFile(file)
    } else {
      alert("File not found in local storage.")
    }
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const removeStar = (id: string) => {
    const newFiles = files.filter(f => f.id !== id)
    setFiles(newFiles)
    localStorage.setItem('viewix_starred', JSON.stringify(newFiles))
    
    const newSelected = new Set(selectedIds)
    newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 px-5 py-4 md:p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tight">Starred Files</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Your favorite and most important documents.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 md:mr-4 justify-between sm:justify-start"
            >
              <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 mr-1 md:mr-2">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 md:h-9 gap-1 md:gap-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm">
                  <Download className="h-3 w-3 md:h-4 md:w-4" /> Export
                </Button>
                <Button variant="destructive" size="sm" className="h-8 md:h-9 gap-1 md:gap-2 px-2 md:px-3 text-xs md:text-sm shadow-sm" onClick={() => {
                  const newFiles = files.filter(f => !selectedIds.has(f.id))
                  setFiles(newFiles)
                  localStorage.setItem('viewix_starred', JSON.stringify(newFiles))
                  setSelectedIds(new Set())
                }}>
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" /> Remove
                </Button>
              </div>
            </motion.div>
          )}

          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search starred..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 w-full md:w-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
            <Star className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No starred files</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Star your important documents to access them quickly from here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-20 custom-scrollbar md:pr-2">
          <AnimatePresence mode="popLayout">
            {filteredFiles.map((file, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={file.id}
                onClick={() => handleOpenStarred(file)}
                className={cn(
                  "group relative bg-white dark:bg-slate-900/40 border rounded-2xl p-2.5 md:p-4 transition-all cursor-pointer flex flex-col",
                  selectedIds.has(file.id) 
                    ? "border-amber-500 bg-amber-50/30 dark:bg-amber-500/5 shadow-md" 
                    : "border-slate-200 dark:border-slate-800/60 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50"
                )}
              >
                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-white/80 dark:bg-slate-900/80 md:bg-transparent rounded-lg backdrop-blur-sm md:backdrop-blur-none shadow-sm md:shadow-none p-1 md:p-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.id) }}
                    className="text-slate-400 hover:text-amber-500 transition-colors flex items-center justify-center"
                  >
                    {selectedIds.has(file.id) ? (
                      <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                    ) : (
                      <Square className="w-4 h-4 md:w-5 md:h-5 opacity-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/80 dark:bg-slate-900/80 md:bg-transparent rounded-lg backdrop-blur-sm md:backdrop-blur-none shadow-sm md:shadow-none p-1 md:p-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeStar(file.id) }}
                    className="text-amber-500 hover:scale-110 transition-transform flex items-center justify-center"
                    title="Remove from Starred"
                  >
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-amber-500" />
                  </button>
                </div>

                <div className="w-full aspect-square md:aspect-[4/3] bg-amber-50/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mb-3 md:mb-4 mt-2 md:mt-2 group-hover:scale-[1.02] transition-transform">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-amber-500/50" />
                </div>
                
                <div className="flex flex-col min-w-0 px-0.5 md:px-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-[11px] md:text-sm truncate mb-0.5 md:mb-1" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                    <span>{new Date(file.timestamp).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block" />
                    <span>{formatSize(file.size)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
