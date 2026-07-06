import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Keyboard, RotateCcw, Printer, Command, ArrowUp, LayoutTemplate, X } from "lucide-react"
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
  const [showPrintModal, setShowPrintModal] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowPrintModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePrintConfirm = () => {
    setShowPrintModal(false)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          #root { display: none !important; }
          #print-section {
            display: block !important;
            position: relative !important;
            padding: 20mm !important;
            width: 100% !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          .print-border { border-color: #cbd5e1 !important; }
        }
      `}</style>

      {typeof document !== "undefined" && createPortal(
        <div id="print-section" className="hidden print:block bg-white w-full min-h-screen">
        <div className="w-full">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12 border-b-2 print-border pb-10">
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md print:bg-blue-600">
                <LayoutTemplate className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-2">Viewix</h1>
              <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase">Read. Mark. Collaborate.</p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">Keyboard Shortcuts Guide</h2>
            <div className="flex items-center gap-3 mt-6 text-sm text-slate-600 font-medium">
              <span className="px-4 py-1.5 bg-slate-100 rounded-full border print-border font-bold">Version 1.0.0</span>
              <span className="text-slate-300">•</span>
              <span>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-2 gap-x-20 gap-y-12">
            {categories.map(category => {
              const categoryShortcuts = mockShortcuts.filter(s => s.category === category)
              if (categoryShortcuts.length === 0) return null
              return (
                <div key={category} className="break-inside-avoid">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-5 border-b-2 print-border pb-3 flex items-center gap-2">
                    {category}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {categoryShortcuts.map(shortcut => (
                      <div key={shortcut.id} className="flex items-center justify-between border-b border-slate-100 border-dashed pb-3">
                        <span className="text-slate-800 font-bold text-[15px] whitespace-nowrap">{shortcut.action}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="min-w-[32px] h-8 px-2.5 flex items-center justify-center bg-slate-100 border print-border rounded-lg text-[13px] font-black text-slate-800 shadow-[0_2px_0_rgba(203,213,225,1)] tracking-wide">
                              {key === "⌘" ? "Ctrl" : key === "⇧" ? "Shift" : key}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-20 pt-10 border-t-2 print-border text-center break-inside-avoid">
            <h4 className="font-black text-slate-900 text-lg tracking-tight mb-1">Viewix</h4>
            <p className="text-slate-500 font-semibold text-sm mb-5 tracking-wide">Read. Mark. Collaborate.</p>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-400">
              <span>Version 1.0.0</span>
              <span className="text-slate-300">•</span>
              <span>Generated automatically by Viewix</span>
            </div>
          </div>
        </div>
      </div>,
      document.body
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10 print:hidden"
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
            <Button variant="outline" size="sm" className="h-10 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm" onClick={() => setShowPrintModal(true)}>
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

      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowPrintModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <span>🖨️</span> Print Keyboard Shortcuts
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                You're about to print the complete Keyboard Shortcuts reference for Viewix.
                <br /><br />
                This will open your browser's native Print Preview.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowPrintModal(false)} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Cancel
                </Button>
                <Button onClick={handlePrintConfirm} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] shadow-sm shadow-blue-500/20">
                  Print
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
