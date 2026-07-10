import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ShieldCheck, UploadCloud, PenTool, Zap, Users, Crown, ChevronRight, FileText, File as FileIcon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPdfFromDB } from "@/lib/db"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import * as pdfjsLib from "pdfjs-dist"

export function HomeTab({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  isDragReject, 
  isUploading, 
  errorMsg,
  onOpenFile
}: any) {
  const { theme } = useTheme()
  const { isOffline } = useWorkspaceStore()
  const isLight = theme !== "dark"
  const illustrationSrc = isLight ? "/Futuristic_interface_light.png" : "/Futuristic_interface.png"

  const [recentDoc, setRecentDoc] = useState<any>(null)
  const [readingProgress, setReadingProgress] = useState<number>(0)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
      if (stored && stored.length > 0) {
        const doc = stored[0]
        setRecentDoc(doc)
        
        // Calculate progress
        const savedProgress = localStorage.getItem(`viewix_progress_${doc.name}`)
        if (savedProgress && doc.pages) {
          const currentPage = parseInt(savedProgress, 10)
          const percentage = Math.round((currentPage / doc.pages) * 100)
          setReadingProgress(Math.min(100, Math.max(0, percentage)))
        } else {
          setReadingProgress(0) // Start of document
        }
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (!recentDoc) return
      try {
        const file = await getPdfFromDB(recentDoc.name)
        if (!file) return
        
        const url = URL.createObjectURL(file)
        const loadingTask = pdfjsLib.getDocument({ url })
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        
        const viewport = page.getViewport({ scale: 0.5 }) 
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) return
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({ canvasContext: context, viewport }).promise
        setCoverImage(canvas.toDataURL("image/jpeg", 0.8))
        
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Failed to generate thumbnail:", err)
      }
    }
    fetchCoverImage()
  }, [recentDoc])

  const handleContinueReading = async () => {
    if (!recentDoc) return
    const file = await getPdfFromDB(recentDoc.name)
    if (file && onOpenFile) {
      onOpenFile(file)
    } else {
      alert("Could not load the file. It may have been cleared from local storage.")
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    return 'Just now';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 px-4 md:px-8 lg:px-12 pb-8 pt-8 md:pt-4 flex flex-col justify-start md:justify-between w-full h-full relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar gap-8 md:gap-0"
    >
      {/* ================= DESKTOP LAYOUT (Unchanged) ================= */}
      <div className="hidden md:flex flex-col justify-between w-full h-full gap-0">
        <div className="flex flex-col md:flex-row items-center w-full md:flex-1 min-h-max py-0 lg:py-4 gap-6 md:gap-0 shrink-0">
          {/* Hero Left: Text & Upload */}
          <div className="flex-1 pr-0 lg:pr-8 space-y-6 lg:space-y-6 w-full shrink-0">
            
            {/* Hero Top Section (Text & Mobile Illustration) */}
            <div className="flex flex-row items-start justify-between w-full gap-2">
              {/* Text Content */}
              <div className="flex-1 space-y-2.5 md:space-y-3 pt-0 lg:pt-6">
                <div className="flex flex-col gap-0 lg:-space-y-1">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="uppercase tracking-[0.2em] text-[10px] md:text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                  >
                    Welcome to
                  </motion.h2>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[40px] sm:text-[44px] md:text-5xl lg:text-[64px] font-bold tracking-tight text-[#111827] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-[1.05] md:leading-[1.1] transition-colors duration-500"
                  >
                    Viewi<span className="text-blue-600">x</span>
                  </motion.h1>
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[14px] sm:text-[15px] md:text-xl lg:text-2xl font-semibold text-slate-600 dark:text-slate-300 pt-0.5 md:pt-1 transition-colors duration-500 leading-[1.3]"
                >
                  A Modern PDF Annotation<br className="md:hidden" /> Workspace.
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-500 dark:text-slate-400 max-w-[220px] md:max-w-md text-[10.5px] md:text-sm lg:text-base leading-[1.6] md:leading-relaxed transition-colors duration-500"
                >
                  Read, annotate, edit and collaborate on your PDF documents with a powerful and beautiful workspace.
                </motion.p>
              </div>

              {/* Mobile Hero Illustration */}
              <motion.div
                key={`mobile-${theme}`}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                className="w-[140px] sm:w-[160px] shrink-0 relative md:hidden aspect-square mt-2 -ml-2"
              >
                <img
                  src={illustrationSrc}
                  alt="Workspace Illustration"
                  className={cn(
                    "absolute inset-0 w-full h-full object-contain object-center scale-[1.05] -translate-x-2 transition-all duration-700 ease-in-out",
                    isLight ? "drop-shadow-[0_8px_16px_rgba(37,99,235,0.08)]" : "drop-shadow-[0_0_16px_rgba(37,99,235,0.12)]"
                  )}
                />
              </motion.div>
            </div>

            {/* Upload Dropzone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              {...getRootProps()}
              className={cn(
                "w-full md:max-w-[400px] rounded-3xl border-2 border-dashed bg-white dark:bg-slate-900/30 p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden",
                isDragActive && !isDragReject ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-slate-300 dark:border-slate-700",
                isDragReject ? "border-red-500 bg-red-50/50 dark:bg-red-500/10" : "",
                !isDragActive && !isOffline && "hover:border-blue-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-sm dark:shadow-none"
              )}
            >
              <div className={cn("transition-opacity duration-300", isOffline ? "opacity-0 pointer-events-none" : "opacity-100")}>
                <input {...getInputProps()} />
                <UploadCloud className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600 dark:text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm lg:text-base font-medium text-slate-700 dark:text-slate-200 mb-1 transition-colors duration-500">
                  {errorMsg ? (
                    <span className="text-red-500 dark:text-red-400">{errorMsg}</span>
                  ) : isUploading ? (
                    "Processing PDF..."
                  ) : isDragActive ? (
                    "Drop PDF here"
                  ) : (
                    "Drag & drop your PDF here"
                  )}
                </p>
                {!errorMsg && !isUploading && (
                  <p className="text-slate-400 dark:text-slate-500 text-xs mb-3 lg:mb-4 transition-colors duration-500">or</p>
                )}

                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl h-10 lg:h-11 shadow-[0_4px_14px_rgba(37,99,235,0.25)] dark:shadow-[0_0_15px_rgba(37,99,235,0.2)] border-0 transition-shadow pointer-events-none">
                  <UploadCloud className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Upload PDF
                </Button>

                <p className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1.5 transition-colors duration-500">
                  Supports: PDF <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /> Max file size: 200MB
                </p>
              </div>

              {isOffline && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900/30 backdrop-blur-sm z-10 rounded-3xl">
                  <motion.div className="h-24 w-full relative flex items-center justify-center mb-1 z-0" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <img src="/offline_illustration.png" alt="Offline" className="absolute bottom-[-95px] w-72 h-72 object-contain drop-shadow-lg max-w-none" />
                  </motion.div>
                  <h3 className="mb-0.5 text-xl font-heading font-bold text-slate-800 dark:text-white relative z-10 pt-2">You're Offline</h3>
                  <p className="max-w-[250px] mx-auto text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed relative z-10">
                    Please reconnect to upload documents.
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start lg:items-center justify-center md:justify-start gap-2 text-[11px] md:text-xs lg:text-sm text-slate-500 dark:text-slate-500 pl-0 md:pl-2 pt-1 md:pt-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0" />
              <span className="text-center md:text-left">Your files are <span className="text-blue-500 dark:text-blue-400">private</span> and <span className="text-blue-500 dark:text-blue-400">secure</span>. <br className="md:hidden" />All processing happens in your browser.</span>
            </motion.div>
          </div>

          {/* Hero Right: Illustration */}
          <motion.div
            key={theme}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 h-full relative hidden md:block"
          >
            <img
              src={illustrationSrc}
              alt="Workspace Illustration"
              className={cn(
                "absolute inset-0 w-full h-full object-contain object-center -translate-x-8 scale-[1.1] transition-all duration-700 ease-in-out",
                isLight ? "drop-shadow-[0_20px_40px_rgba(37,99,235,0.1)]" : "drop-shadow-[0_0_40px_rgba(37,99,235,0.15)]"
              )}
            />
          </motion.div>
        </div>

        {/* Bottom Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 shrink-0 pt-2 md:pt-4"
        >
          <FeatureCard
            icon={PenTool}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-100 dark:bg-purple-500/10"
            title="Smart Annotations"
            description="Highlight, mark and comment with ease."
          />
          <FeatureCard
            icon={Zap}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-100 dark:bg-blue-500/10"
            title="Lightning Fast"
            description="Optimized performance for large PDF files."
          />
          <FeatureCard
            icon={ShieldCheck}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-100 dark:bg-emerald-500/10"
            title="Secure & Private"
            description="Your files never leave your device."
          />
          <FeatureCard
            icon={Users}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-100 dark:bg-amber-500/10"
            title="Collaborate"
            description="Share and collaborate seamlessly."
          />
        </motion.div>
      </div>

      {/* ================= NEW PREMIUM MOBILE LAYOUT ================= */}
      <div className="flex md:hidden flex-col w-full gap-5 pb-8">
        
        {/* Mobile Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] bg-white dark:bg-[#131C31] border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col shadow-sm min-h-[190px]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="relative z-20 space-y-3">
            <div className="space-y-1.5">
              <h2 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">Welcome to Viewix</h2>
              <h1 className="text-[26px] font-extrabold text-slate-800 dark:text-white leading-[1.1] tracking-tight">
                Your Workspace, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Reimagined.</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[150px] leading-[1.6]">
              Read, annotate, and collaborate on your PDF documents effortlessly.
            </p>
          </div>
          
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 right-2 z-10"
          >
            <img src={illustrationSrc} alt="Illustration" className="w-[140px] h-[140px] object-contain drop-shadow-xl opacity-90" />
          </motion.div>
        </motion.div>

        {/* Primary Action (Upload) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: "easeOut" }}
          {...getRootProps()}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 to-indigo-600 p-5 shadow-[0_8px_30px_rgba(37,99,235,0.25)] dark:shadow-[0_8px_30px_rgba(37,99,235,0.15)] cursor-pointer active:scale-[0.98] transition-transform duration-200"
        >
          <input {...getInputProps()} />
          <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay pointer-events-none rounded-[24px]" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1 text-white pr-4">
              <h3 className="text-lg font-bold tracking-tight">Upload Document</h3>
              <p className="text-[11px] text-blue-100/90 leading-snug">
                {errorMsg ? (
                  <span className="text-red-200">{errorMsg}</span>
                ) : isUploading ? (
                  "Processing your PDF..."
                ) : (
                  "Tap to select a PDF file (Max 200MB)"
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Feature Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Why Viewix?</h3>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <MobileFeatureCard 
              icon={PenTool} color="bg-purple-500" iconColor="text-white"
              title="Smart Tools" desc="Highlight & draw"
            />
            <MobileFeatureCard 
              icon={Zap} color="bg-blue-500" iconColor="text-white"
              title="Lightning Fast" desc="Zero lag processing"
            />
            <MobileFeatureCard 
              icon={ShieldCheck} color="bg-emerald-500" iconColor="text-white"
              title="100% Private" desc="Local in-browser"
            />
          </div>
        </motion.div>

        {/* Continue Reading Section (Mobile Only) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-3 w-full"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Continue Reading</h3>
          </div>
          
          <div className="relative overflow-hidden rounded-[28px] bg-white/60 dark:bg-[#131C31]/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-lg min-h-[170px] flex flex-col justify-between">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 dark:bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />

            {recentDoc ? (
              <>
                <div className="relative z-10 flex gap-4">
                  {/* Thumbnail Placeholder */}
                  <div className="w-[72px] h-[90px] rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700/60 overflow-hidden relative group">
                    {coverImage ? (
                      <img src={coverImage} alt="PDF Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <FileIcon className="w-8 h-8 text-blue-500/40 dark:text-blue-500/60" />
                    )}
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-red-200/80 dark:border-red-500/20">PDF</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">Last opened {formatTimeAgo(recentDoc.timestamp)}</p>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight line-clamp-2 pr-2">{recentDoc.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                      <span>{formatSize(recentDoc.size)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span>{recentDoc.pages} Pages</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Button */}
                <div className="relative z-10 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Reading Progress</span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{readingProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mb-5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${readingProgress}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                    />
                  </div>
                  
                  <button 
                    onClick={handleContinueReading}
                    className="w-full h-[46px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_4px_14px_rgba(37,99,235,0.25)] dark:shadow-[0_4px_14px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Continue Reading <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center py-4 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">No recent documents</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload your first PDF to begin.</p>
                </div>
                <div {...getRootProps()} className="w-full">
                  <input {...getInputProps()} />
                  <button 
                    className="w-full h-[46px] mt-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_4px_14px_rgba(37,99,235,0.25)] dark:shadow-[0_4px_14px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function FeatureCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description
}: {
  icon: any,
  iconColor: string,
  iconBg: string,
  title: string,
  description: string
}) {
  return (
    <div className="group flex items-start gap-2.5 md:gap-4 p-3.5 md:p-5 rounded-xl md:rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div className={cn("p-2 md:p-2.5 rounded-lg md:rounded-xl shrink-0 transition-colors duration-500", iconBg)}>
        <Icon className={cn("w-4 h-4 md:w-5 md:h-5 transition-colors duration-500", iconColor)} />
      </div>
      <div className="pt-0.5">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-[11px] md:text-sm mb-0.5 md:mb-1 transition-colors duration-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h4>
        <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 leading-[1.4] md:leading-relaxed transition-colors duration-500">{description}</p>
      </div>
    </div>
  )
}
function MobileFeatureCard({
  icon: Icon, color, iconColor, title, desc
}: { icon: any, color: string, iconColor: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-[18px] bg-white dark:bg-[#131C31] border border-slate-100 dark:border-slate-800/80 shadow-sm min-w-[120px] shrink-0 snap-start">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-0.5">{title}</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{desc}</p>
      </div>
    </div>
  )
}
