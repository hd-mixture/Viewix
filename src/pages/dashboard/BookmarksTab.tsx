import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bookmark, Search, FileText, ChevronRight, ChevronDown, MoreVertical, ExternalLink, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkItem {
  id: string
  title: string
  page: number
  children?: BookmarkItem[]
}

interface DocumentBookmarks {
  docId: string
  docName: string
  bookmarks: BookmarkItem[]
}

const mockBookmarks: DocumentBookmarks[] = [
  {
    docId: "doc1",
    docName: "Q3_Financial_Report.pdf",
    bookmarks: [
      { id: "b1", title: "Executive Summary", page: 1 },
      { id: "b2", title: "Revenue Analysis", page: 4, children: [
        { id: "b3", title: "North America", page: 5 },
        { id: "b4", title: "EMEA", page: 7 }
      ]},
      { id: "b5", title: "Conclusion", page: 12 }
    ]
  },
  {
    docId: "doc2",
    docName: "Design_System_V2.pdf",
    bookmarks: [
      { id: "b6", title: "Typography", page: 3 },
      { id: "b7", title: "Color Palette", page: 8 },
      { id: "b8", title: "Components", page: 15 }
    ]
  }
]

export function BookmarksTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set(["doc1", "doc2"]))
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["b2"]))

  const toggleDoc = (id: string) => {
    const newExpanded = new Set(expandedDocs)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedDocs(newExpanded)
  }

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedNodes(newExpanded)
  }

  const renderBookmark = (bm: BookmarkItem, depth: number = 0) => {
    const hasChildren = bm.children && bm.children.length > 0
    const isExpanded = expandedNodes.has(bm.id)

    return (
      <div key={bm.id} className="w-full">
        <div 
          className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          style={{ paddingLeft: `${(depth * 1.5) + 0.75}rem` }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {hasChildren ? (
              <button onClick={() => toggleNode(bm.id)} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{bm.title}</span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md text-slate-400 hover:text-blue-500">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md text-slate-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              pg {bm.page}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {bm.children!.map(child => renderBookmark(child, depth + 1))}
          </div>
        )}
      </div>
    )
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Global Bookmarks</h1>
          <p className="text-slate-500 dark:text-slate-400">All your saved bookmarks across all documents.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bookmarks..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-10 w-full md:w-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-20">
        {mockBookmarks.map(doc => (
          <div key={doc.docId} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
            <div 
              className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              onClick={() => toggleDoc(doc.docId)}
            >
              <div className="flex items-center gap-3">
                {expandedDocs.has(doc.docId) ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">{doc.docName}</h3>
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                  {doc.bookmarks.length} bookmarks
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-4 h-4" /> Open Document
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedDocs.has(doc.docId) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-2">
                    {doc.bookmarks.map(bm => renderBookmark(bm))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
