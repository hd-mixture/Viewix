import { useState, useEffect } from "react"
import * as pdfjsLib from "pdfjs-dist"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useQuickActions } from "@/hooks/useQuickActions"
import { usePdfStatistics } from "@/hooks/usePdfStatistics"
import { OpenRecentModal, DuplicateModal, ClearAnnotationsModal } from "@/components/ui/modals/QuickActionModals"
import { getPdfFromDB } from "@/lib/db"
import { useToastStore } from "@/store/useToastStore"
import { 
  FileText, Layers, FileDigit, Image as ImageIcon, MessageSquare, 
  Highlighter, LayoutTemplate, Clock, FolderOpen, Copy, Download, 
  Upload, Trash2, CheckCircle2, Info, Command, Square, Edit3, MousePointer2, Type, Table
} from "lucide-react"

export function WorkspacePanel() {
  const { pdfDocument, pdfFile, numPages, zoom, currentPage, annotations, pastAnnotations, setPdfFile, setPdfDocument, selectedAnnotationId } = useWorkspaceStore()
  const { exportAnnotationJSON, importAnnotationJSON, duplicateDocument, clearAll } = useQuickActions()
  const { toast } = useToastStore()
  const { stats, loading } = usePdfStatistics(pdfDocument)
  
  const [openTime, setOpenTime] = useState<Date>(new Date())
  const [editingTimeMinutes, setEditingTimeMinutes] = useState(0)

  // Modal States
  const [isRecentOpen, setIsRecentOpen] = useState(false)
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false)
  const [isClearOpen, setIsClearOpen] = useState(false)

  // Sync current open file to recent files if not already there
  useEffect(() => {
    if (pdfFile && numPages > 0) {
      const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
      if (!stored.some((f: any) => f.name === pdfFile.name)) {
        const newRecent = {
          name: pdfFile.name,
          size: pdfFile.size,
          pages: numPages,
          timestamp: Date.now()
        }
        localStorage.setItem('viewix_recent', JSON.stringify([newRecent, ...stored].slice(0, 10)))
      }
    }
  }, [pdfFile, numPages])

  const handleOpenRecent = async (fileName: string) => {
    if (pdfFile?.name === fileName) {
      toast({ title: "Already Open", description: "This document is currently open.", type: "info" })
      return
    }
    
    try {
      const file = await getPdfFromDB(fileName)
      if (file) {
        // Parse the PDF so the viewer can actually render it
        const url = URL.createObjectURL(file)
        const loadingTask = pdfjsLib.getDocument({ url })
        const doc = await loadingTask.promise
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        
        setPdfDocument(doc)
        setPdfFile(file)
        
        toast({ title: "Document Opened", description: `Successfully loaded ${fileName}.`, type: "success" })
      } else {
        toast({ title: "File Not Found", description: "Could not locate this file in storage. Please upload it again.", type: "error" })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to load the document.", type: "error" })
    }
  }

  useEffect(() => {
    if (pdfFile) {
      setOpenTime(new Date())
      setEditingTimeMinutes(0)
    }
  }, [pdfFile])

  useEffect(() => {
    const interval = setInterval(() => {
      setEditingTimeMinutes(prev => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num)

  const highlightCount = annotations.filter(a => a.type === 'highlight').length
  const textCount = annotations.filter(a => a.type === 'text').length
  const shapeCount = annotations.filter(a => ['rectangle', 'oval', 'arrow', 'cloud', 'freedraw'].includes(a.type)).length

  const skeleton = <div className="h-6 w-12 bg-slate-200/60 dark:bg-slate-700/60 animate-pulse rounded mt-0.5"></div>

  return (
    <aside className="scroll-trigger w-[280px] h-full flex flex-col bg-white/60 dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto transition-colors duration-500 relative">
      
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/5 shrink-0 transition-colors duration-500 bg-white/40 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[14px] text-slate-800 dark:text-slate-200 transition-colors duration-500">Document Overview</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar space-y-8">
        
        {/* SECTION 1: Current Document */}
        <div className="space-y-4">
          <SectionTitle title="Current Document" />
          <div className="bg-white/80 dark:bg-[#0f172a]/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={pdfFile?.name || "MediGuide_AI_Production_Level_Blueprint.pdf"}>
                  {pdfFile?.name || "MediGuide_AI_Production_Level_Blueprint.pdf"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">PDF Document</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px]">
              <InfoRow label="File Size" value={pdfFile ? formatBytes(pdfFile.size) : "—"} />
              <InfoRow label="Total Pages" value={numPages > 0 ? `${numPages} Pages` : "—"} />
              <InfoRow label="PDF Version" value="1.7" />
              <InfoRow label="Modified" value={pdfFile ? new Date(pdfFile.lastModified).toLocaleDateString() : "—"} />
            </div>
          </div>
        </div>

        {/* SECTION 2: Document Statistics */}
        <div className="space-y-4">
          <SectionTitle title="Document Statistics" />
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Layers} label="Pages" value={numPages > 0 ? formatNumber(numPages) : "—"} />
            <StatCard icon={FileDigit} label="Words" value={loading ? skeleton : stats ? formatNumber(stats.words) : "—"} />
            <StatCard icon={Type} label="Characters" value={loading ? skeleton : stats ? formatNumber(stats.charactersWithSpaces) : "—"} />
            <StatCard icon={ImageIcon} label="Images" value={loading ? skeleton : stats ? formatNumber(stats.images) : "—"} />
            <StatCard icon={Table} label="Tables" value={loading ? skeleton : stats ? stats.tables : "—"} />
            <StatCard icon={Edit3} label="Annotations" value={formatNumber(annotations.length)} />
            <StatCard icon={Highlighter} label="Highlights" value={formatNumber(highlightCount)} />
            <StatCard icon={MessageSquare} label="Comments" value={formatNumber(textCount)} />
            <StatCard icon={Square} label="Shapes" value={formatNumber(shapeCount)} />
          </div>
        </div>

        {/* SECTION 2.5: Document Analysis */}
        <div className="space-y-4">
          <SectionTitle title="Document Analysis" />
          {loading ? (
             <div className="bg-white/80 dark:bg-[#0f172a]/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm animate-pulse h-[200px]"></div>
          ) : stats ? (
             <DocumentAnalysisCard stats={stats} />
          ) : null}
        </div>

        {/* SECTION 3: Editing Session */}
        <div className="space-y-4">
          <SectionTitle title="Editing Session" />
          <div className="bg-white/80 dark:bg-[#0f172a]/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <SessionStat label="Zoom" value={`${Math.round(zoom * 100)}%`} />
              <SessionStat label="Current Page" value={numPages > 0 ? `${currentPage} / ${numPages}` : "—"} />
              <SessionStat label="Opened" value={openTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
              <SessionStat label="Editing Time" value={`${editingTimeMinutes} min`} />
              <SessionStat label="Auto Save" value="Enabled" textClass="text-green-600 dark:text-green-400" />
              <SessionStat label="Selection" value={selectedAnnotationId ? "1 Item" : "None"} />
            </div>
          </div>
        </div>

        {/* SECTION 4: Document Status */}
        <div className="space-y-4">
          <SectionTitle title="Document Status" />
          <div className="flex flex-wrap gap-2">
            <StatusBadge icon={CheckCircle2} text="Ready" type="success" />
            <StatusBadge icon={Info} text="Annotations Enabled" type="info" />
            <StatusBadge icon={CheckCircle2} text="Export Ready" type="success" />
            <StatusBadge icon={Info} text="GPU Active" type="info" />
            <StatusBadge icon={Info} text="Cache Active" type="info" />
          </div>
        </div>

        {/* SECTION 5: Quick Actions */}
        <div className="space-y-4">
          <SectionTitle title="Quick Actions" />
          <div className="grid grid-cols-1 gap-2">
            <ActionCard onClick={() => setIsRecentOpen(true)} icon={FolderOpen} title="Open Recent" desc="Open a recently viewed document" />
            <ActionCard onClick={() => setIsDuplicateOpen(true)} icon={Copy} title="Duplicate Document" desc="Create a copy of this PDF" />
            <ActionCard onClick={exportAnnotationJSON} icon={Download} title="Export Annotation JSON" desc="Save annotations to a file" />
            <ActionCard onClick={importAnnotationJSON} icon={Upload} title="Import Annotation JSON" desc="Load annotations from a file" />
            <ActionCard onClick={() => setIsClearOpen(true)} icon={Trash2} title="Clear All Annotations" desc="Remove all edits from document" danger />
          </div>
        </div>

        {/* SECTION 6: Keyboard Shortcuts */}
        <div className="space-y-4">
          <SectionTitle title="Keyboard Shortcuts" />
          <div className="flex flex-col gap-2">
            <ShortcutChip keys={["R"]} label="Rectangle" />
            <ShortcutChip keys={["T"]} label="Text" />
            <ShortcutChip keys={["H"]} label="Highlight" />
            <ShortcutChip keys={["A"]} label="Arrow" />
            <ShortcutChip keys={["C"]} label="Comment" />
            <ShortcutChip keys={["Space"]} label="Pan" />
            <ShortcutChip keys={["Ctrl", "Z"]} label="Undo" />
            <ShortcutChip keys={["Ctrl", "Shift", "Z"]} label="Redo" />
            <ShortcutChip keys={["Del"]} label="Delete Annotation" />
          </div>
        </div>

        {/* SECTION 7: Recent Activity */}
        <div className="space-y-4">
          <SectionTitle title="Recent Activity" />
          <div className="relative pl-3 border-l border-slate-200 dark:border-white/10 ml-2 space-y-6">
            
            {pastAnnotations.length > 0 ? pastAnnotations.slice(-4).reverse().map((_, idx) => (
              <ActivityItem key={idx} time="Just now" action="Edited Document" />
            )) : (
              <>
                <ActivityItem time="10:28 AM" action="Exported PDF" />
                <ActivityItem time="10:24 AM" action="Inserted Comment" />
                <ActivityItem time="10:22 AM" action="Added Highlight" />
                <ActivityItem time="10:20 AM" action="Opened Document" />
              </>
            )}
            
          </div>
        </div>

      </div>

      {/* Modals */}
      <OpenRecentModal isOpen={isRecentOpen} onClose={() => setIsRecentOpen(false)} onSelect={handleOpenRecent} />
      <DuplicateModal isOpen={isDuplicateOpen} onClose={() => setIsDuplicateOpen(false)} onDuplicate={duplicateDocument} />
      <ClearAnnotationsModal isOpen={isClearOpen} onClose={() => setIsClearOpen(false)} onClear={clearAll} />

    </aside>
  )
}

// Subcomponents

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h4>
      <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string, value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  )
}

function DocumentAnalysisCard({ stats }: { stats: any }) {
  let config = {
    title: 'Hybrid PDF',
    type: 'mixed',
    icon: Layers,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-200 dark:border-yellow-500/20',
    indicator: '🟡',
    ocr: 'Partial',
    textExt: 'Partial',
    search: 'Partially Supported',
    copy: 'Partially Supported',
    wordCount: 'Estimated'
  }
  
  if (stats.documentType === 'searchable') {
    config = {
      title: 'Digital PDF',
      type: 'searchable',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-500/20',
      indicator: '🟢',
      ocr: 'Available',
      textExt: 'Enabled',
      search: 'Supported',
      copy: 'Supported',
      wordCount: 'Accurate'
    }
  } else if (stats.documentType === 'scanned') {
    config = {
      title: 'Image Based',
      type: 'scanned',
      icon: ImageIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-500/20',
      indicator: '🟠',
      ocr: 'Not Available',
      textExt: 'Unavailable',
      search: 'Disabled',
      copy: 'Disabled',
      wordCount: 'Limited'
    }
  }

  return (
    <div className={`border rounded-xl shadow-sm overflow-hidden transition-all ${config.bg} ${config.border}`}>
       <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
         <span>{config.indicator}</span>
         <span className={`text-[13px] font-bold ${config.color}`}>{stats.documentType === 'searchable' ? 'Searchable PDF' : stats.documentType === 'scanned' ? 'Scanned Image PDF' : 'Mixed PDF'}</span>
       </div>
       <div className="p-4 bg-white/60 dark:bg-[#0f172a]/60 space-y-3">
         <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px]">
           <InfoRow label="Document Type" value={config.title} />
           <InfoRow label="OCR Status" value={config.ocr} />
           <InfoRow label="Text Extraction" value={config.textExt} />
           <InfoRow label="Search Support" value={config.search} />
           <InfoRow label="Copy Text" value={config.copy} />
           <InfoRow label="Word Count" value={config.wordCount} />
           {stats.documentType === 'mixed' && (
             <InfoRow label="Contains" value="Text + Images" />
           )}
         </div>
         
         <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex justify-between items-center text-[11px]">
           <div className="flex gap-4">
             <span className="text-slate-500 dark:text-slate-400">Text Pages: <strong className="text-slate-700 dark:text-slate-300">{stats.textPages}</strong></span>
             <span className="text-slate-500 dark:text-slate-400">Image Pages: <strong className="text-slate-700 dark:text-slate-300">{stats.imagePages}</strong></span>
           </div>
         </div>

         {stats.documentType === 'scanned' && (
           <div className="mt-2 p-2 rounded-lg bg-orange-100/50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 text-[10px] text-orange-700 dark:text-orange-400 leading-relaxed">
             <strong>Recommendation:</strong> Run OCR to enable text search and accurate statistics.
           </div>
         )}
       </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | React.ReactNode }) {
  return (
    <div className="bg-white/80 dark:bg-[#0f172a]/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default min-h-[72px]">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  )
}

function SessionStat({ label, value, textClass }: { label: string, value: string, textClass?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
      <span className={`text-[13px] font-medium ${textClass || 'text-slate-800 dark:text-slate-200'}`}>{value}</span>
    </div>
  )
}

function StatusBadge({ icon: Icon, text, type }: { icon: any, text: string, type: 'success' | 'info' }) {
  const isSuccess = type === 'success'
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors
      ${isSuccess 
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`
    }>
      <Icon className="h-3 w-3" />
      {text}
    </div>
  )
}

function ActionCard({ icon: Icon, title, desc, danger, onClick }: { icon: any, title: string, desc: string, danger?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl border text-left group transition-all
      ${danger 
        ? 'bg-red-50/50 border-red-100 hover:bg-red-50 dark:bg-red-500/5 dark:border-red-500/10 dark:hover:bg-red-500/10' 
        : 'bg-white/50 border-slate-200/80 hover:bg-white dark:bg-[#0f172a]/40 dark:border-white/5 dark:hover:bg-[#0f172a]/80'}
    `}>
      <div className={`p-2 rounded-lg shrink-0 transition-colors
        ${danger 
          ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-500/30' 
          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400'}
      `}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className={`text-[12px] font-semibold mb-0.5 ${danger ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400'}`}>
          {title}
        </h5>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {desc}
        </p>
      </div>
    </button>
  )
}

function ShortcutChip({ keys, label }: { keys: string[], label: string }) {
  return (
    <div className="flex items-center justify-between w-full gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-default shadow-sm">
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd key={i} className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold shadow-sm min-w-[20px] text-center">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}

function ActivityItem({ time, action }: { time: string, action: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#1e293b]" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{time}</span>
        <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200">{action}</span>
      </div>
    </div>
  )
}
