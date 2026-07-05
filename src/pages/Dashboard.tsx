import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import {
  FolderOpen, Settings, Info, LayoutTemplate,
  Home, Clock, Star, Bookmark, Zap, ShieldCheck,
  Users, UploadCloud, PenTool, Keyboard, Crown,
  Sun, Moon, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import * as pdfjsLib from "pdfjs-dist"
import { SignatureModal } from "@/components/ui/modals/SignatureModal"
import { ToastNotification } from "@/components/ui/ToastNotification"

// Ensure pdf.js worker is loaded using CDN to prevent Vite resolve errors
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export function Dashboard() {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { setPdfFile, setPdfDocument, isSignatureModalOpen, setSignatureModalOpen } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()

  const loadPdfDocument = async (file: File) => {
    const url = URL.createObjectURL(file)
    const config = { url: url }
    console.log("Passing config to getDocument:", config)
    const loadingTask = pdfjsLib.getDocument(config)
    const doc = await loadingTask.promise

    // Slight delay before revoking to ensure PDF is fully parsed
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    return doc
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setErrorMsg(null)

    const file = acceptedFiles[0]
    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file.")
      return
    }

    setIsUploading(true)

    try {
      const doc = await loadPdfDocument(file)
      setPdfDocument(doc)
      setPdfFile(file)
    } catch (error: any) {
      console.error("PDF Parsing Error: ", error)
      setErrorMsg(error?.message || "Failed to parse PDF document.")
    } finally {
      setIsUploading(false)
    }
  }, [setPdfFile, setPdfDocument])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  })

  // Illustration swap
  const isLight = theme !== "dark"
  const illustrationSrc = isLight ? "/Futuristic_interface_light.png" : "/Futuristic_interface.png"

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-500">
      {/* Left Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F172A] flex flex-col justify-between py-6 px-4 transition-colors duration-500">
        <div className="space-y-6">
          {/* Logo Area */}
          <div className="px-2 flex justify-center py-2">
            <Logo />
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1 text-sm font-medium">
            <SidebarItem icon={Home} label="Home" active />
            <SidebarItem icon={Clock} label="Recent Files" />
            <SidebarItem icon={Star} label="Starred" />
            <SidebarItem icon={Bookmark} label="Bookmarks" />
            <SidebarItem icon={LayoutTemplate} label="Templates" />
          </nav>

          <div className="h-px bg-slate-200 dark:bg-slate-800/50 w-full transition-colors duration-500" />

          {/* Tools Navigation */}
          <div className="space-y-2">
            <h4 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</h4>
            <nav className="space-y-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              <SidebarItem icon={Settings} label="Settings" />
              <SidebarItem icon={Keyboard} label="Keyboard Shortcuts" />
              <SidebarItem icon={HelpCircle} label="Help & Support" />
              <SidebarItem icon={Info} label="About Viewix" />
            </nav>
          </div>
        </div>

        {/* Pro Card */}
        <div className="relative mt-auto overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 p-5 shadow-lg dark:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 text-amber-500">
            <Crown className="w-20 h-20" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Crown className="h-4 w-4 fill-amber-500/20" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Unlock Pro</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Get unlimited features and cloud sync.
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_15px_rgba(37,99,235,0.2)] dark:shadow-[0_0_10px_rgba(37,99,235,0.3)] h-9 text-xs transition-shadow">
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[100px] pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-900/10 blur-[80px] pointer-events-none transition-colors duration-500" />

        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-end px-8 gap-4 shrink-0 relative z-10">
          <Button variant="outline" className="gap-2 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-5 h-9 text-sm shadow-sm backdrop-blur-sm transition-all duration-500">
            <FolderOpen className="h-4 w-4" /> Open File
          </Button>

          <div className="flex items-center bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full p-1 shadow-sm backdrop-blur-sm transition-all duration-500">
            <button
              onClick={() => setTheme("light")}
              className={cn("p-1.5 rounded-full transition-colors", isLight ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-200")}
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn("p-1.5 rounded-full transition-colors", !isLight ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>

          <div className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700/50 overflow-hidden ml-2 shadow-sm transition-colors duration-500">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4F46E5" alt="User" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 px-8 lg:px-12 pb-8 flex flex-col justify-between w-full h-full relative z-10 overflow-y-auto overflow-x-hidden">

          <div className="flex items-center flex-1 min-h-0 py-2 lg:py-4">
            {/* Hero Left: Text & Upload */}
            <div className="flex-1 pr-0 lg:pr-8 space-y-5 lg:space-y-6">
              <div className="space-y-3 pt-2 lg:pt-6">
                <div className="flex flex-col gap-0 lg:-space-y-1">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="uppercase tracking-[0.2em] text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                  >
                    Welcome to
                  </motion.h2>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-[1.1] transition-colors duration-500"
                  >
                    Viewi<span className="text-blue-600">x</span>
                  </motion.h1>
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-slate-600 dark:text-slate-300 pt-1 transition-colors duration-500"
                >
                  A Modern PDF Annotation Workspace.
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-500 dark:text-slate-400 max-w-md text-sm lg:text-base leading-relaxed transition-colors duration-500"
                >
                  Read, annotate, edit and collaborate on your PDF documents with a powerful and beautiful workspace.
                </motion.p>
              </div>

              {/* Upload Dropzone */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                {...getRootProps()}
                className={cn(
                  "max-w-[400px] rounded-3xl border-2 border-dashed bg-white dark:bg-slate-900/30 p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer group",
                  isDragActive && !isDragReject ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-slate-300 dark:border-slate-700",
                  isDragReject ? "border-red-500 bg-red-50/50 dark:bg-red-500/10" : "",
                  !isDragActive && "hover:border-blue-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-sm dark:shadow-none"
                )}
              >
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

                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl h-10 lg:h-11 shadow-[0_4px_14px_rgba(37,99,235,0.25)] dark:shadow-[0_0_15px_rgba(37,99,235,0.2)] border-0 transition-shadow">
                  <UploadCloud className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Upload PDF
                </Button>

                <p className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500 mt-3 lg:mt-4 flex items-center justify-center gap-1.5 transition-colors duration-500">
                  Supports: PDF <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /> Max file size: 200MB
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-start lg:items-center gap-2 text-xs lg:text-sm text-slate-500 dark:text-slate-500 pl-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 lg:mt-0" />
                <span>Your files are <span className="text-blue-500 dark:text-blue-400">private</span> and <span className="text-blue-500 dark:text-blue-400">secure</span>. All processing happens in your browser.</span>
              </motion.div>
            </div>

            {/* Hero Right: Illustration */}
            <motion.div
              key={theme} // Forces re-render for smooth motion blur effect on image swap
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
            className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0 pt-4"
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
      </main>
    </div>
  )
}

function SidebarItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
        active
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
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
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none transition-colors duration-500">
      <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors duration-500", iconBg)}>
        <Icon className={cn("w-5 h-5 transition-colors duration-500", iconColor)} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1 transition-colors duration-500">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-500">{description}</p>
        Left Sidebar Width      </div>
    </div>
  )
}
