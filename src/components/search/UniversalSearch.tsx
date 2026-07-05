import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Command, FileText, X, PenTool, Layout, Settings, BookMarked, MoveUpRight, Zap } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { searchPdfText, type PdfSearchResult } from "@/lib/pdfSearch"
import { useHotkeys } from "react-hotkeys-hook"
import { cn } from "@/lib/utils"

const PLACEHOLDERS = [
  "Search tools...",
  "Search PDF...",
  "Search annotations...",
  "Search bookmarks...",
  "Search commands..."
]

const TOOL_RESULTS = [
  { id: "pointer", icon: MousePointer2, label: "Select", category: "Annotation", shortcut: "V" },
  { id: "hand", icon: Hand, label: "Hand", category: "Navigation", shortcut: "Space" },
  { id: "text", icon: Type, label: "Text", category: "Annotation", shortcut: "T" },
  { id: "highlight", icon: Highlighter, label: "Highlight", category: "Annotation", shortcut: "H" },
  { id: "rectangle", icon: Square, label: "Rectangle", category: "Annotation", shortcut: "R" },
  { id: "oval", icon: Circle, label: "Circle", category: "Annotation", shortcut: "O" },
  { id: "arrow", icon: MoveUpRight, label: "Arrow", category: "Annotation", shortcut: "A" },
  { id: "signature", icon: PenTool, label: "Sign", category: "Annotation", shortcut: "S" },
  { id: "eraser", icon: Eraser, label: "Eraser", category: "Annotation", shortcut: "E" },
  { id: "theme", icon: Zap, label: "Toggle Theme", category: "Settings", shortcut: "None" },
]

// To avoid circular dependencies and messy imports for all icons:
import { MousePointer2, Hand, Type, Highlighter, Square, Circle, Eraser } from "lucide-react"

export function UniversalSearch() {
  const { 
    isSearchFocused, 
    setIsSearchFocused, 
    searchMode, 
    setSearchMode, 
    searchQuery, 
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    pdfDocument,
    setCurrentPage,
    setActiveTool
  } = useWorkspaceStore()
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [shortcutBadge, setShortcutBadge] = useState<"K" | "D">("K")
  const [pdfResults, setPdfResults] = useState<PdfSearchResult[]>([])
  const [isSearchingPdf, setIsSearchingPdf] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Cycle Placeholders & Badges
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
      setShortcutBadge((prev) => prev === "K" ? "D" : "K")
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Override Ctrl+F and Ctrl+K
  useHotkeys("mod+f, mod+d", (e) => {
    e.preventDefault()
    setSearchMode("document")
    setIsSearchFocused(true)
    inputRef.current?.focus()
  }, { enableOnFormTags: true })

  useHotkeys("mod+k", (e) => {
    e.preventDefault()
    setSearchMode("tools")
    setIsSearchFocused(true)
    inputRef.current?.focus()
  }, { enableOnFormTags: true })
  
  useHotkeys("escape", () => {
    if (isSearchFocused) {
      setIsSearchFocused(false)
      inputRef.current?.blur()
    }
  }, { enableOnFormTags: true }, [isSearchFocused])

  // PDF Search Debounce
  useEffect(() => {
    if (searchMode === "document" && searchQuery && pdfDocument) {
      setIsSearchingPdf(true)
      const timer = setTimeout(async () => {
        const results = await searchPdfText(pdfDocument, searchQuery)
        setPdfResults(results)
        setIsSearchingPdf(false)
        setSelectedIndex(0)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setPdfResults([])
    }
  }, [searchQuery, searchMode, pdfDocument])

  // Tool Search Filter
  const filteredTools = TOOL_RESULTS.filter(t => 
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const maxResults = searchMode === "tools" ? filteredTools.length : pdfResults.length
  const displayedItems = searchMode === "tools" ? filteredTools : pdfResults

  useHotkeys("down", (e) => {
    if (!isSearchFocused || maxResults === 0) return
    e.preventDefault()
    setSelectedIndex((prev) => (prev + 1) % maxResults)
  }, { enableOnFormTags: true }, [isSearchFocused, maxResults])

  useHotkeys("up", (e) => {
    if (!isSearchFocused || maxResults === 0) return
    e.preventDefault()
    setSelectedIndex((prev) => (prev - 1 + maxResults) % maxResults)
  }, { enableOnFormTags: true }, [isSearchFocused, maxResults])
  
  useHotkeys("enter", (e) => {
    if (!isSearchFocused || maxResults === 0) return
    e.preventDefault()
    
    if (searchMode === "tools") {
      const tool = filteredTools[selectedIndex]
      if (tool.id === "theme") {
        document.documentElement.classList.toggle("dark")
      } else {
        setActiveTool(tool.id as any)
      }
      addSearchHistory(tool.label)
    } else {
      const result = pdfResults[selectedIndex]
      setCurrentPage(result.pageNumber)
      addSearchHistory(searchQuery)
    }
    
    setIsSearchFocused(false)
    inputRef.current?.blur()
  }, { enableOnFormTags: true }, [isSearchFocused, maxResults, selectedIndex, filteredTools, pdfResults, searchMode])

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded px-0.5">{part}</mark> : part
    )
  }

  return (
    <div className="relative z-[100] w-[340px] h-10 flex justify-center">
      {/* Backdrop */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[90]"
            onClick={() => setIsSearchFocused(false)}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className={cn(
          "absolute top-0 z-[100] flex flex-col bg-slate-100 dark:bg-[#1e293b]/80 border transition-colors origin-top",
          isSearchFocused ? "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-white dark:bg-[#0f172a] rounded-2xl" : "border-transparent rounded-full"
        )}
        initial={false}
        animate={{
          width: isSearchFocused ? 430 : 340,
          scale: isSearchFocused ? 1.03 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="relative flex items-center h-10 px-3">
          <Search className={cn("w-4 h-4 transition-colors", isSearchFocused ? "text-blue-500" : "text-slate-400")} />
          
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={isSearchFocused ? "Search..." : ""}
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          
          {!isSearchFocused && !searchQuery && (
            <div className="absolute left-10 pointer-events-none overflow-hidden h-full flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-slate-500 dark:text-slate-400"
                >
                  {PLACEHOLDERS[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          {/* Mode Pill & Shortcut Badge */}
          <div className="flex items-center gap-2 absolute right-2">
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200 dark:border-white/10"
                >
                  <button 
                    onClick={() => { setSearchMode("tools"); setSelectedIndex(0) }}
                    className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors", searchMode === "tools" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                  >
                    <Command className="w-3 h-3" /> Tools
                  </button>
                  <button 
                    onClick={() => { setSearchMode("document"); setSelectedIndex(0) }}
                    className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors", searchMode === "document" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                  >
                    <FileText className="w-3 h-3" /> Doc
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {!isSearchFocused && (
                <motion.div
                  key={shortcutBadge}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:flex items-center gap-1 bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400"
                >
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>{shortcutBadge}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dropdown Results */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 dark:border-white/5"
            >
              <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                
                {searchMode === "tools" && filteredTools.map((tool, idx) => (
                  <div 
                    key={tool.id} 
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      if (tool.id === "theme") document.documentElement.classList.toggle("dark")
                      else setActiveTool(tool.id as any)
                      setIsSearchFocused(false)
                    }}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                      selectedIndex === idx ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-md", selectedIndex === idx ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400")}>
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={cn("text-sm font-medium", selectedIndex === idx ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300")}>{tool.label}</div>
                        <div className="text-[10px] text-slate-500">{tool.category}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                      {tool.shortcut}
                    </div>
                  </div>
                ))}

                {searchMode === "document" && isSearchingPdf && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs">Scanning document...</span>
                  </div>
                )}

                {searchMode === "document" && !isSearchingPdf && pdfResults.map((result, idx) => (
                  <div 
                    key={`${result.pageNumber}-${idx}`} 
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      setCurrentPage(result.pageNumber)
                      setIsSearchFocused(false)
                    }}
                    className={cn(
                      "flex flex-col gap-1 p-2 rounded-lg cursor-pointer transition-colors mb-1",
                      selectedIndex === idx ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20" : "hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded">PAGE {result.pageNumber}</span>
                    </div>
                    <div className={cn("text-xs leading-relaxed", selectedIndex === idx ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400")}>
                      {highlightMatch(result.snippet, searchQuery)}
                    </div>
                  </div>
                ))}

                {searchQuery && maxResults === 0 && !isSearchingPdf && (
                  <div className="flex flex-col items-center justify-center py-8 opacity-60">
                    <X className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500 text-center px-4">No matching {searchMode === "tools" ? "tools" : "document content"} found.</span>
                  </div>
                )}
                
                {!searchQuery && searchHistory.length > 0 && (
                  <div className="pt-2 pb-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Recent Searches</div>
                    {searchHistory.map((query, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSearchQuery(query)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-sm text-slate-600 dark:text-slate-400"
                      >
                        <Search className="w-3.5 h-3.5 opacity-50" />
                        {query}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
