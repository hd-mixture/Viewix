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
      className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Starred Files</h1>
          <p className="text-slate-500 dark:text-slate-400">Your favorite and most important documents.</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mr-4"
            >
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-2">
                {selectedIds.size} selected
              </span>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="destructive" size="sm" className="h-9 gap-2" onClick={() => {
                const newFiles = files.filter(f => !selectedIds.has(f.id))
                setFiles(newFiles)
                localStorage.setItem('viewix_starred', JSON.stringify(newFiles))
                setSelectedIds(new Set())
              }}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </motion.div>
          )}

          <div className="relative">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-2">
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
                  "group relative bg-white dark:bg-slate-900/40 border rounded-2xl p-4 transition-all cursor-pointer flex flex-col",
                  selectedIds.has(file.id) 
                    ? "border-amber-500 bg-amber-50/30 dark:bg-amber-500/5 shadow-md" 
                    : "border-slate-200 dark:border-slate-800/60 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50"
                )}
              >
                <div className="absolute top-4 left-4 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.id) }}
                    className="text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    {selectedIds.has(file.id) ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeStar(file.id) }}
                    className="text-amber-500 hover:scale-110 transition-transform"
                    title="Remove from Starred"
                  >
                    <Star className="w-5 h-5 fill-amber-500" />
                  </button>
                </div>

                <div className="w-full aspect-[4/3] bg-amber-50/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mb-4 mt-2">
                  <FileText className="w-10 h-10 text-amber-500/50" />
                </div>
                
                <div className="flex flex-col min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate mb-1" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{formatSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{new Date(file.timestamp).toLocaleDateString()}</span>
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
