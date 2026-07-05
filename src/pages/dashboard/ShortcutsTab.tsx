import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Keyboard, RotateCcw, Printer, Command, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Shortcut {
  id: string
  action: string
  keys: string[]
  category: "Navigation" | "Editing" | "View" | "System"
}

const mockShortcuts: Shortcut[] = [
  { id: "s1", action: "Open File", keys: ["⌘", "O"], category: "System" },
  { id: "s2", action: "Save Changes", keys: ["⌘", "S"], category: "System" },
  { id: "s3", action: "Undo", keys: ["⌘", "Z"], category: "Editing" },
  { id: "s4", action: "Redo", keys: ["⌘", "⇧", "Z"], category: "Editing" },
  { id: "s5", action: "Next Page", keys: ["→"], category: "Navigation" },
  { id: "s6", action: "Previous Page", keys: ["←"], category: "Navigation" },
  { id: "s7", action: "Zoom In", keys: ["⌘", "+"], category: "View" },
  { id: "s8", action: "Zoom Out", keys: ["⌘", "-"], category: "View" },
  { id: "s9", action: "Fit to Width", keys: ["⌘", "0"], category: "View" },
  { id: "s10", action: "Toggle Sidebar", keys: ["⌘", "\\"], category: "View" },
]

export function ShortcutsTab() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredShortcuts = mockShortcuts.filter(s => 
    s.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = ["System", "Navigation", "Editing", "View"]

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Keyboard Shortcuts</h1>
          <p className="text-slate-500 dark:text-slate-400">Master Viewix with these power-user commands.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shortcuts..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 w-full sm:w-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button variant="outline" size="sm" className="h-10 gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
          {categories.map(category => {
            const categoryShortcuts = filteredShortcuts.filter(s => s.category === category)
            if (categoryShortcuts.length === 0) return null

            return (
              <div key={category} className="border-b border-slate-200 dark:border-slate-800/60 last:border-0">
                <div className="bg-slate-50/50 dark:bg-slate-800/20 px-6 py-3 border-b border-slate-200 dark:border-slate-800/60">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{category}</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {categoryShortcuts.map(shortcut => (
                    <div key={shortcut.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{shortcut.action}</span>
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        {shortcut.keys.map((key, i) => (
                          <kbd 
                            key={i} 
                            className="h-7 min-w-[28px] px-2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-[0_2px_0_rgba(226,232,240,1)] dark:shadow-[0_2px_0_rgba(51,65,85,1)] group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors font-sans"
                          >
                            {key === "⌘" ? <Command className="w-3.5 h-3.5" /> : key === "⇧" ? <ArrowUp className="w-3.5 h-3.5" /> : key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {filteredShortcuts.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Keyboard className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No shortcuts match your search.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
