import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, FileText, AlertTriangle, Copy, Trash2, Download, Plus, ArrowLeft, Image as ImageIcon, MessageSquare, ZoomIn } from "lucide-react"
import type { BlankPageConfig } from "@/lib/pdfActions"
import * as pdfjsLib from "pdfjs-dist"

interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function ModalBase({ isOpen, onClose, children }: ModalBaseProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[200] isolate flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/10 dark:bg-[#020617]/30 backdrop-blur-sm rounded-2xl"
            onClick={onClose}
          />
          <div className="relative z-[201]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function OpenRecentModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (fileName: string) => void }) {
  const [recentFiles, setRecentFiles] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
      setRecentFiles(stored)
    }
  }, [isOpen])

  const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatTime = (ms: number) => {
    const diff = Math.floor((Date.now() - ms) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} mins ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="w-[260px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Open Recent</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2 max-h-[272px] overflow-y-auto custom-scrollbar">
          {recentFiles.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
              No recent documents found.
            </div>
          ) : (
            recentFiles.map((file, i) => (
              <button 
                key={i} 
                onClick={() => { onSelect(file.name); onClose() }}
                className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-left transition-colors group"
              >
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform mt-0.5 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{formatTime(file.timestamp)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{formatBytes(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{file.pages} pgs</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </ModalBase>
  )
}

export function DuplicateModal({ isOpen, onClose, onDuplicate }: { isOpen: boolean, onClose: () => void, onDuplicate: () => void }) {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="w-[260px] p-5 text-center flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-1">
          <Copy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">Duplicate?</h2>
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
            Create a temporary copy of this document and its annotations.
          </p>
        </div>
        <div className="flex w-full gap-2 mt-3">
          <button 
            onClick={onClose}
            className="flex-1 px-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[12px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onDuplicate(); onClose() }}
            className="flex-1 px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

export function ClearAnnotationsModal({ isOpen, onClose, onClear }: { isOpen: boolean, onClose: () => void, onClear: () => void }) {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="w-[260px] p-5 text-center flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400 mb-1">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">Clear All?</h2>
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
            Remove all annotations. You can undo this action later.
          </p>
        </div>
        <div className="flex w-full gap-2 mt-3">
          <button 
            onClick={onClose}
            className="flex-1 px-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[12px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onClear(); onClose() }}
            className="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

export function BlankPagePopoverContent({ onClose, onCreate }: { onClose: () => void, onCreate: (config: BlankPageConfig) => void }) {
  const [size, setSize] = useState<'A4' | 'Letter'>('A4')
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>('Portrait')
  const [backgroundType, setBackgroundType] = useState<'Blank' | 'Lined' | 'Grid' | 'Dotted'>('Blank')
  const [pageName, setPageName] = useState('')

  const handleCreate = () => {
    onCreate({ size, orientation, backgroundType, pageName: pageName.trim() || undefined })
  }

  return (
    <div className="w-full flex flex-col">
      <div className="px-2 py-1 flex items-center gap-2 mb-1 border-b border-slate-100 dark:border-white/5">
        <button onClick={(e) => { e.stopPropagation(); onClose() }} className="p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
           <ArrowLeft className="h-3 w-3" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Blank Page</span>
      </div>
      
      <div className="p-2 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">Page Size</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['A4', 'Letter'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${size === s ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f172a] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">Orientation</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['Portrait', 'Landscape'] as const).map(o => (
              <button
                key={o}
                onClick={() => setOrientation(o)}
                className={`py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${orientation === o ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f172a] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">Background</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['Blank', 'Lined', 'Grid', 'Dotted'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBackgroundType(b)}
                className={`py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${backgroundType === b ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f172a] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">Name (Optional)</label>
          <input 
            type="text" 
            value={pageName}
            onChange={e => setPageName(e.target.value)}
            placeholder="e.g. Notes, Appendix A" 
            className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="pt-2 px-1 flex gap-2">
        <button 
          onClick={handleCreate}
          className="w-full py-1.5 text-[11px] font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="h-3 w-3" />
          Create Page
        </button>
      </div>
    </div>
  )
}

export function PageDetailsPopoverContent({ onBack, pageNumber, pdfDocument, currentZoom }: { onBack: () => void, pageNumber: number, pdfDocument: any, currentZoom: number }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pdfDocument) return;
    
    let isMounted = true;
    setLoading(true);
    
    const fetchDetails = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        
        let wordCount = 0;
        let charCount = 0;
        let containsImages = false;
        let imageCount = 0;
        
        textContent.items.forEach((item: any) => {
          if (item.str) {
            charCount += item.str.length;
            wordCount += item.str.split(/\s+/).filter(Boolean).length;
          }
        });
        
        const ops = await page.getOperatorList();
        const fns = ops.fnArray;
        
        for (let i = 0; i < fns.length; i++) {
          if (fns[i] === pdfjsLib.OPS.paintImageXObject || fns[i] === pdfjsLib.OPS.paintJpegXObject || fns[i] === pdfjsLib.OPS.paintInlineImageXObject || fns[i] === pdfjsLib.OPS.paintInlineImageXObjectGroup) {
            containsImages = true;
            imageCount++;
          }
        }
        
        const w = Math.round(viewport.width);
        const h = Math.round(viewport.height);
        
        let sizeName = "Custom";
        if (Math.abs(w - 595) < 10 && Math.abs(h - 842) < 10) sizeName = "A4";
        if (Math.abs(w - 842) < 10 && Math.abs(h - 595) < 10) sizeName = "A4";
        if (Math.abs(w - 612) < 10 && Math.abs(h - 792) < 10) sizeName = "Letter";
        if (Math.abs(w - 792) < 10 && Math.abs(h - 612) < 10) sizeName = "Letter";
        
        const orientation = w > h ? "Landscape" : "Portrait";
        
        if (isMounted) {
          setDetails({
            dimensions: `${w} × ${h} px`,
            sizeName,
            orientation,
            wordCount,
            charCount,
            containsText: charCount > 0,
            containsImages,
            imageCount,
            annotations: 0,
          });
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchDetails();
    return () => { isMounted = false; }
  }, [pageNumber, pdfDocument]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 px-1 py-1 border-b border-slate-100 dark:border-white/5 mb-2 pb-2">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
           <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page {pageNumber} Details</span>
      </div>
      
      <div className="max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-3.5 pb-1">
        {loading ? (
           <div className="py-8 flex items-center justify-center text-slate-400">
             <span className="text-xs">Analyzing page...</span>
           </div>
        ) : details ? (
          <>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">Number</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{pageNumber}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400">Size</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{details.sizeName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-0.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Dimensions</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{details.dimensions}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Orientation</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{details.orientation}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Current Zoom</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{Math.round(currentZoom * 100)}%</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60 my-0.5"></div>
            
            <div className="flex flex-col gap-2 px-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Contains</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${details.containsText ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  <FileText className="h-3 w-3 shrink-0" />
                  <span>Text</span>
                  {details.containsText && <span className="ml-auto text-[8px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded truncate">{details.wordCount} w</span>}
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${details.containsImages ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  <ImageIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">Images</span>
                  {details.containsImages && <span className="ml-auto text-[8px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded truncate">{details.imageCount}</span>}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  <span>Notes</span>
                  <span className="ml-auto text-[8px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">0</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-red-500 text-xs">Failed to load details</div>
        )}
      </div>
    </div>
  )
}
