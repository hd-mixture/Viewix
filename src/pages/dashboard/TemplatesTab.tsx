import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, LayoutTemplate, Star, Copy, Eye, Plus, Crown, FileText, Trash2,
  LayoutGrid, Clock, Bookmark, Briefcase, User, Zap, Layout, Award, Mail, FileBarChart,
  Grid, List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWorkspaceStore, type Template, type Annotation } from "@/store/useWorkspaceStore"
import { TemplatePreviewModal } from "@/components/ui/modals/TemplatePreviewModal"
import { createPdfFromTemplate } from "@/utils/templateUtils"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { templateData as mockTemplates } from "@/data/templateData"

const CATEGORIES_CONFIG = [
  { id: "All", label: "All", icon: LayoutGrid },
  { type: "divider" },
  { id: "Recently Used", label: "Recently Used", icon: Clock },
  { id: "My Templates", label: "My Templates", icon: Bookmark },
  { type: "divider" },
  { id: "Business", label: "Business", icon: Briefcase },
  { id: "Personal", label: "Personal", icon: User },
  { id: "Productivity", label: "Productivity", icon: Zap },
  { id: "Invoices", label: "Invoices", icon: FileText },
  { id: "Resume", label: "Resume", icon: Layout },
  { id: "Certificates", label: "Certificates", icon: Award },
  { id: "Letters", label: "Letters", icon: Mail },
  { id: "Reports", label: "Reports", icon: FileBarChart },
]

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function TemplatesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftState, setScrollLeftState] = useState(0)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftShadow(scrollLeft > 0)
    setShowRightShadow(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
  }

  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeftState(scrollContainerRef.current?.scrollLeft || 0)
  }
  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk
  }
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) return
    if (e.deltaY !== 0 && e.deltaX === 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }

  const { 
    favoriteTemplates, 
    toggleFavoriteTemplate, 
    myTemplates, 
    duplicateTemplate, 
    recentTemplates, 
    addRecentTemplate,
    showToast,
    setPdfFile,
    setPdfDocument,
    setActiveDashboardTab,
    setOpenedFromDashboard,
    setAnnotations
  } = useWorkspaceStore()

  // Combine mock templates with user's duplicated templates
  const allTemplates = useMemo(() => [...myTemplates, ...mockTemplates], [myTemplates])

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesCategory = false
      if (activeCategory === "All") matchesCategory = true
      else if (activeCategory === "My Templates") matchesCategory = myTemplates.some(mt => mt.id === t.id)
      else if (activeCategory === "Starred") matchesCategory = favoriteTemplates.includes(t.id)
      else if (activeCategory === "Recently Used") matchesCategory = recentTemplates.some(rt => rt.id === t.id)
      else matchesCategory = t.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [allTemplates, searchQuery, activeCategory, myTemplates, favoriteTemplates, recentTemplates])

  const starredTemplates = useMemo(() => filteredTemplates.filter(t => favoriteTemplates.includes(t.id)), [filteredTemplates, favoriteTemplates])
  const unstarredTemplates = useMemo(() => filteredTemplates.filter(t => !favoriteTemplates.includes(t.id)), [filteredTemplates, favoriteTemplates])

  const handleUseTemplate = async (template: Template) => {
    setPreviewTemplate(null)
    
    // Generate an empty PDF blob using our utility
    const file = await createPdfFromTemplate(template)
    
    // In a real app we'd generate a real PDF, here we use our placeholder
    setOpenedFromDashboard(true)
    useWorkspaceStore.getState().setActiveTemplateId(template.id)
    
    // Simulating the dropzone loading process
    import("pdfjs-dist").then(async (pdfjsLib) => {
      try {
        const url = URL.createObjectURL(file)
        const loadingTask = pdfjsLib.getDocument({ url })
        const doc = await loadingTask.promise
        
        setPdfFile(file)
        setPdfDocument(doc)
        
        // Inject JSON Annotations
        if (template.annotations && template.annotations.length > 0) {
          const generatedAnnotations: Annotation[] = template.annotations.map(ann => ({
            ...ann,
            id: crypto.randomUUID(),
            pageNumber: 1,
            // default fills for certain properties if missing
            opacity: ann.opacity ?? 1,
            color: ann.color ?? "#000000"
          })) as Annotation[]
          
          setAnnotations(generatedAnnotations)
        } else {
          setAnnotations([])
        }
        
        showToast("Success", "Template loaded successfully.", 3000)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (e) {
        console.error(e)
        showToast("Error", "Failed to load template.", 3000)
      }
    })
  }

  const handleDuplicate = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation()
    duplicateTemplate(template)
    showToast("Success", "Template duplicated to My Templates.", 3000)
  }

  const handleFavorite = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation()
    toggleFavoriteTemplate(template.id)
  }

  const handlePreview = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation()
    setPreviewTemplate(template)
  }

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (!previewTemplate) return
    const currentIndex = filteredTemplates.findIndex(t => t.id === previewTemplate.id)
    if (direction === 'prev' && currentIndex > 0) {
      setPreviewTemplate(filteredTemplates[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < filteredTemplates.length - 1) {
      setPreviewTemplate(filteredTemplates[currentIndex + 1])
    }
  }

  const renderTemplateCard = (template: Template, isMobileListMode: boolean = false, isHorizontalScroll: boolean = false) => {
    const isHovered = hoveredId === template.id
    const isFavorite = favoriteTemplates.includes(template.id)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        key={template.id}
        className={cn(
          "group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] md:rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col",
          isMobileListMode 
            ? "flex-row items-stretch p-0 md:flex-col md:items-stretch min-h-[64px]" 
            : isHorizontalScroll
              ? "w-[140px] shrink-0 snap-start md:w-auto md:shrink-1 md:snap-none"
              : "w-full md:w-auto"
        )}
        onMouseEnter={() => setHoveredId(template.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => handleUseTemplate(template)}
      >
        <div className={cn(
          "relative bg-slate-100 dark:bg-slate-800/50 overflow-hidden shrink-0 md:border-b md:border-slate-100 md:dark:border-slate-800",
          isMobileListMode 
            ? "w-[84px] sm:w-[100px] md:w-full md:aspect-[4/3]" 
            : "w-full aspect-[4/3]"
        )}>
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full h-full"
          >
            <ImageWithFallback 
              src={template.thumbnail} 
              alt={template.title}
              fallbackTitle={template.title}
              category={template.category}
            />
          </motion.div>
          
          {template.isPro && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-amber-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
              <Crown className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden md:inline">PRO</span>
            </div>
          )}

          <button 
            onClick={(e) => handleFavorite(e, template)}
            className={cn(
              "absolute top-2 right-2 md:top-3 md:right-3 h-6 w-6 md:h-8 md:w-8 rounded-full items-center justify-center transition-all z-10",
              isMobileListMode ? "hidden md:flex" : "flex",
              isFavorite 
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-500 opacity-100" 
                : "bg-white/50 dark:bg-slate-800/50 text-slate-500 md:opacity-0 md:group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500"
            )}
          >
            <Star className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isFavorite && "fill-current")} />
          </button>

          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center gap-3 z-0"
              >
                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  onClick={(e) => handlePreview(e, template)}
                  className="h-10 w-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-colors backdrop-blur-md"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={(e) => handleDuplicate(e, template)}
                  className="h-10 w-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-colors backdrop-blur-md"
                >
                  <Copy className="w-5 h-5" />
                </motion.button>
                {template.id.startsWith('copy-') && (
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Are you sure you want to delete this copied template?")) {
                        useWorkspaceStore.getState().deleteMyTemplate(template.id)
                      }
                    }}
                    className="h-10 w-10 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={cn(
          "relative flex flex-1 min-w-0",
          isMobileListMode ? "flex-row items-center p-2 sm:p-2.5 gap-1.5 md:flex-col md:items-stretch md:justify-start md:h-[90px] md:gap-0" : "flex-col justify-center md:justify-start p-2.5 md:p-4 h-auto"
        )}>
          <div className="flex flex-col flex-1 min-w-0 md:static">
            <h3 className={cn(
              "text-slate-900 dark:text-white truncate mb-0.5",
              isMobileListMode ? "font-semibold text-[11.5px] sm:text-[12.5px] md:font-semibold md:text-sm" : "font-bold md:font-semibold text-[10.5px] md:text-sm text-center md:text-left"
            )}>{template.title}</h3>
            
            <div className={cn("relative flex-1", isMobileListMode ? "w-full" : "")}>
              <div className="flex flex-col text-left relative transition-opacity duration-200 md:group-hover:opacity-0">
                {!template.id.startsWith('copy-') && (
                  <p className={cn(
                    "text-slate-500 dark:text-slate-400 line-clamp-2 md:mt-1",
                    isMobileListMode ? "text-[10px] sm:text-[11px] leading-[1.3] pr-1" : "text-[9px] md:text-[13px] leading-tight md:leading-snug"
                  )}>
                    {template.description}
                  </p>
                )}
                {template.id.startsWith('copy-') && (
                  <div className={cn("flex flex-col", isMobileListMode ? "gap-0 mt-0" : "gap-0.5 mt-0.5 md:mt-1")}>
                    <span className={cn("font-medium text-slate-400 dark:text-slate-500", isMobileListMode ? "text-[11px]" : "text-[9px] md:text-[12px]")}>
                      Created {formatTimeAgo(parseInt(template.id.split('-')[1]))}
                    </span>
                    <div className={cn("text-slate-400 flex items-center gap-1", isMobileListMode ? "text-[11px]" : "text-[9px] md:text-[12px]")}>
                      <FileText className="w-3 h-3 md:hidden" />
                      <span className="md:hidden">{template.size ? formatSize(template.size) : "583 Bytes"}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Desktop Hover Overlay */}
              <div className="absolute inset-0 hidden md:flex flex-col justify-start pt-1 pointer-events-none group-hover:pointer-events-auto">
                <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-200 ease-out w-full">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-sm shadow-md shadow-blue-500/20"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {isMobileListMode && (
            <div className="shrink-0 md:hidden flex flex-col gap-1 justify-center pl-1">
              <Button 
                onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                className="bg-blue-50/80 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 rounded-[8px] h-[26px] px-2.5 text-[10px] font-semibold shadow-none w-full"
              >
                Use
              </Button>
              <div className="flex gap-1 w-full">
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleDuplicate(e, template); }}
                  className={cn(
                    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[8px] h-[26px] text-[10px] font-semibold shadow-none flex items-center justify-center gap-1",
                    template.id.startsWith('copy-') ? "flex-1 px-1" : "w-full px-2.5"
                  )}
                >
                  <Copy className="w-2.5 h-2.5" /> {!template.id.startsWith('copy-') && "Copy"}
                </Button>
                {template.id.startsWith('copy-') && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Are you sure you want to delete this copied template?")) {
                        useWorkspaceStore.getState().deleteMyTemplate(template.id)
                      }
                    }}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-[8px] h-[26px] w-[26px] p-0 flex items-center justify-center shrink-0 shadow-none"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {!isMobileListMode && (
            <div className="flex md:hidden items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <Button 
                onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                className="flex-1 bg-blue-50/80 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 rounded-[8px] h-[28px] px-2 text-[10px] font-semibold shadow-none"
              >
                Use
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); handleDuplicate(e, template); }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[8px] w-[28px] h-[28px] p-0 flex items-center justify-center shrink-0 shadow-none"
              >
                <Copy className="w-3 h-3" />
              </Button>
              {template.id.startsWith('copy-') && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Are you sure you want to delete this copied template?")) {
                      useWorkspaceStore.getState().deleteMyTemplate(template.id)
                    }
                  }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-[8px] w-[28px] h-[28px] p-0 flex items-center justify-center shrink-0 shadow-none"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-0 px-5 py-4 md:p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
      >
        <div className="flex flex-col gap-6 mb-8 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tight">Template Gallery</h1>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Start your next document instantly with a professional template.</p>
            </div>
            
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-10 w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="w-full md:w-fit max-w-full mx-auto relative md:mx-auto">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              className="flex items-center gap-2 md:gap-1 bg-transparent md:bg-white dark:bg-transparent md:dark:bg-slate-900 md:rounded-2xl md:shadow-sm md:border md:border-slate-200 md:dark:border-slate-800 py-2 -mx-5 px-5 scroll-px-5 md:mx-0 md:p-2 md:scroll-px-0 overflow-x-auto select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {CATEGORIES_CONFIG.map((cat, i) => {
                if (cat.type === 'divider') {
                  return <div key={`div-${i}`} className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
                }
                const isActive = activeCategory === cat.id
                const Icon = cat.icon!
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id!)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 min-w-[54px] h-[54px] md:min-w-[96px] md:h-[72px] px-1 md:px-2 rounded-[14px] md:rounded-xl transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 snap-start group outline-none",
                      isActive 
                        ? "text-blue-600 dark:text-blue-500 font-semibold bg-blue-50/80 md:bg-blue-600/5 dark:bg-blue-500/10 shadow-sm md:shadow-none" 
                        : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-600/5 dark:hover:bg-blue-500/10 bg-white dark:bg-slate-800/60 md:bg-transparent md:dark:bg-transparent shadow-sm md:shadow-none"
                    )}
                  >
                    <Icon className={cn("w-[16px] h-[16px] md:w-[22px] md:h-[22px] transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]", !isActive && "group-hover:-translate-y-[2px]")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[9px] md:text-[13px]">{cat.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryIndicator"
                        className="absolute bottom-0 left-4 right-4 h-[3px] bg-blue-600 dark:bg-blue-500 rounded-t-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            
            <AnimatePresence>
              {showLeftShadow && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none rounded-l-2xl z-10 hidden md:block"
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showRightShadow && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none rounded-r-2xl z-10 hidden md:block"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 md:pb-8 min-h-0">
          {filteredTemplates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center max-w-sm mx-auto mt-20"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 absolute -bottom-2 -left-2 rotate-[-15deg] opacity-50" />
                <LayoutTemplate className="w-12 h-12 text-slate-400 dark:text-slate-500 relative z-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                We couldn't find any templates matching "{searchQuery}". Try adjusting your search or category filter.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-8 md:gap-10">
              {activeCategory === "All" && !searchQuery && starredTemplates.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[15px] md:text-lg font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500 fill-amber-500" /> Starred Templates
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto md:overflow-visible snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-4 md:pb-2 -mx-5 px-5 scroll-px-5 md:mx-0 md:px-0 md:scroll-px-0 pt-2 -mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <AnimatePresence mode="popLayout">
                      {starredTemplates.map((t) => renderTemplateCard(t, false, true))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              
              <div className={activeCategory === "All" && !searchQuery && starredTemplates.length > 0 ? "pt-2 md:border-t md:border-slate-200 md:dark:border-slate-800/60" : ""}>
                <div className="flex justify-between items-center mb-4">
                  {(activeCategory === "All" && !searchQuery && starredTemplates.length > 0) ? (
                    <h2 className="text-[15px] md:text-lg font-bold text-slate-900 dark:text-slate-200">All Templates</h2>
                  ) : (
                    <h2 className="text-[15px] md:text-lg font-bold text-slate-900 dark:text-slate-200 hidden md:block">Templates</h2> // Empty or hidden on mobile if no starred
                  )}
                  
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex md:hidden items-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[14px] p-0.5 shadow-sm shrink-0">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-1.5 rounded-xl transition-colors", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600")}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-1.5 rounded-xl transition-colors", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600")}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "gap-3 md:gap-6",
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                    : "flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                  <AnimatePresence mode="popLayout">
                    {activeCategory === "All" && !searchQuery 
                      ? unstarredTemplates.map((t) => renderTemplateCard(t, viewMode === 'list', false))
                      : filteredTemplates.map((t) => renderTemplateCard(t, viewMode === 'list', false))
                    }
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onUse={handleUseTemplate}
        onPrev={() => navigatePreview('prev')}
        onNext={() => navigatePreview('next')}
        hasPrev={previewTemplate ? filteredTemplates.findIndex(t => t.id === previewTemplate.id) > 0 : false}
        hasNext={previewTemplate ? filteredTemplates.findIndex(t => t.id === previewTemplate.id) < filteredTemplates.length - 1 : false}
      />
    </>
  )
}
