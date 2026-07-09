import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  FolderOpen, Settings, Info, LayoutTemplate,
  Home, Clock, Star, Bookmark, Zap, ShieldCheck,
  Users, UploadCloud, PenTool, Keyboard, Crown,
  Sun, Moon, HelpCircle, Menu, X, MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import * as pdfjsLib from "pdfjs-dist"
import { SignatureModal } from "@/components/ui/modals/SignatureModal"
import { ToastNotification } from "@/components/ui/ToastNotification"
import { ComingSoonModal } from "@/components/ui/modals/ComingSoonModal"
import { ProPreviewModal } from "@/components/ui/modals/ProPreviewModal"

import { HomeTab } from "./dashboard/HomeTab"
import { RecentFilesTab } from "./dashboard/RecentFilesTab"
import { StarredTab } from "./dashboard/StarredTab"
import { BookmarksTab } from "./dashboard/BookmarksTab"
import { TemplatesTab } from "./dashboard/TemplatesTab"
import { SettingsTab } from "./dashboard/SettingsTab"
import { ShortcutsTab } from "./dashboard/ShortcutsTab"
import { HelpSupportTab } from "./dashboard/HelpSupportTab"
import { AboutTab } from "./dashboard/AboutTab"

// Ensure pdf.js worker is loaded using CDN to prevent Vite resolve errors
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export function Dashboard() {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [comingSoonType, setComingSoonType] = useState<"settings" | "profile" | null>(null)
  const [isProModalOpen, setIsProModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { 
    setPdfFile, 
    setPdfDocument, 
    isSignatureModalOpen, 
    setSignatureModalOpen,
    activeDashboardTab,
    setActiveDashboardTab,
    setOpenedFromDashboard
  } = useWorkspaceStore()
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
      localStorage.setItem('viewix_last_active_file', file.name)
    } catch (error: any) {
      console.error("PDF Parsing Error: ", error)
      setErrorMsg(error?.message || "Failed to parse PDF document.")
    } finally {
      setIsUploading(false)
    }
  }, [setPdfFile, setPdfDocument])

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } = useDropzone({
    onDrop: (files, rejectedFiles) => {
      setOpenedFromDashboard(false)
      
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0]
        if (error.code === 'file-too-large') {
          setErrorMsg("File is too large. Max size is 200MB.")
        } else {
          setErrorMsg("Please upload a valid PDF file.")
        }
        return
      }

      onDrop(files)
    },
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024, // 200MB limit
  })

  // Illustration swap
  const isLight = theme !== "dark"
  const illustrationSrc = isLight ? "/Futuristic_interface_light.png" : "/Futuristic_interface.png"

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-500">
      
      {/* Mobile Header (Only visible on mobile) */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-16 shrink-0 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="scale-75 origin-center">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setComingSoonType("profile")}
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4F46E5" alt="User" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-y-0 left-0 z-[70] w-[280px] bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/50">
                <Logo />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <nav className="space-y-1">
                  <SidebarItem icon={Home} label="Home" active={activeDashboardTab === "home"} onClick={() => { setActiveDashboardTab("home"); setIsMobileMenuOpen(false); }} />
                  <SidebarItem icon={Clock} label="Recent Files" active={activeDashboardTab === "recent"} onClick={() => { setActiveDashboardTab("recent"); setIsMobileMenuOpen(false); }} />
                  <SidebarItem icon={Star} label="Starred" active={activeDashboardTab === "starred"} onClick={() => { setActiveDashboardTab("starred"); setIsMobileMenuOpen(false); }} />
                  <SidebarItem icon={Bookmark} label="Bookmarks" active={activeDashboardTab === "bookmarks"} onClick={() => { setActiveDashboardTab("bookmarks"); setIsMobileMenuOpen(false); }} />
                  <SidebarItem icon={LayoutTemplate} label="Templates" active={activeDashboardTab === "templates"} onClick={() => { setActiveDashboardTab("templates"); setIsMobileMenuOpen(false); }} />
                </nav>

                <div className="h-px bg-slate-200 dark:bg-slate-800/50 w-full" />

                <div className="space-y-2">
                  <h4 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</h4>
                  <nav className="space-y-1">
                    <SidebarItem icon={Settings} label="Settings" active={activeDashboardTab === "settings"} onClick={() => { setActiveDashboardTab("settings"); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Keyboard} label="Shortcuts" active={activeDashboardTab === "shortcuts"} onClick={() => { setActiveDashboardTab("shortcuts"); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={HelpCircle} label="Help" active={activeDashboardTab === "help"} onClick={() => { setActiveDashboardTab("help"); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Info} label="About Viewix" active={activeDashboardTab === "about"} onClick={() => { setActiveDashboardTab("about"); setIsMobileMenuOpen(false); }} />
                  </nav>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
                <button 
                  onClick={() => setIsProModalOpen(true)}
                  className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 p-4 shadow-md text-left"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 dark:opacity-10 text-amber-500">
                    <Crown className="w-16 h-16" />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 text-amber-500 mb-1">
                    <Crown className="h-4 w-4 fill-amber-500/20" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Viewix Pro</h3>
                  </div>
                  <p className="relative z-10 text-xs text-slate-500 dark:text-slate-400">Version 2.3.0</p>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Left Sidebar (Desktop only) */}
      <aside className="hidden md:flex w-[280px] shrink-0 border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F172A] flex-col justify-between py-6 px-4 transition-colors duration-500">
        <div className="space-y-6">
          {/* Logo Area */}
          <div className="px-2 flex justify-center py-2">
            <Logo />
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1 text-sm font-medium">
            <SidebarItem icon={Home} label="Home" active={activeDashboardTab === "home"} onClick={() => setActiveDashboardTab("home")} />
            <SidebarItem icon={Clock} label="Recent Files" active={activeDashboardTab === "recent"} onClick={() => setActiveDashboardTab("recent")} />
            <SidebarItem icon={Star} label="Starred" active={activeDashboardTab === "starred"} onClick={() => setActiveDashboardTab("starred")} />
            <SidebarItem icon={Bookmark} label="Bookmarks" active={activeDashboardTab === "bookmarks"} onClick={() => setActiveDashboardTab("bookmarks")} />
            <SidebarItem icon={LayoutTemplate} label="Templates" active={activeDashboardTab === "templates"} onClick={() => setActiveDashboardTab("templates")} />
          </nav>

          <div className="h-px bg-slate-200 dark:bg-slate-800/50 w-full transition-colors duration-500" />

          {/* Tools Navigation */}
          <div className="space-y-2">
            <h4 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</h4>
            <nav className="space-y-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              <SidebarItem icon={Settings} label="Settings" active={activeDashboardTab === "settings"} onClick={() => setActiveDashboardTab("settings")} />
              <SidebarItem icon={Keyboard} label="Keyboard Shortcuts" active={activeDashboardTab === "shortcuts"} onClick={() => setActiveDashboardTab("shortcuts")} />
              <SidebarItem icon={HelpCircle} label="Help & Support" active={activeDashboardTab === "help"} onClick={() => setActiveDashboardTab("help")} />
              <SidebarItem icon={Info} label="About Viewix" active={activeDashboardTab === "about"} onClick={() => setActiveDashboardTab("about")} />
            </nav>
          </div>
        </div>

        {/* Pro Card */}
        <button 
          onClick={() => setIsProModalOpen(true)}
          className="relative mt-auto overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 p-5 shadow-lg dark:shadow-xl transition-all duration-300 hover:shadow-amber-500/10 hover:border-amber-500/30 dark:hover:shadow-amber-500/20 group text-left cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 text-amber-500 transition-transform duration-500 group-hover:scale-110">
            <Crown className="w-20 h-20" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Crown className="h-4 w-4 fill-amber-500/20" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Viewix Pro</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              Preview the premium roadmap for professional users.
            </p>
          </div>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-[72px] md:pb-0">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[100px] pointer-events-none transition-colors duration-500 hidden md:block" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-900/10 blur-[80px] pointer-events-none transition-colors duration-500 hidden md:block" />

        {/* Top Navbar (Desktop only) */}
        <header className="hidden md:flex h-16 items-center justify-end px-8 gap-4 shrink-0 relative z-10">
          <Button 
            variant="outline" 
            onClick={open}
            className="gap-2 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 rounded-xl px-5 h-9 text-sm shadow-sm backdrop-blur-sm transition-all duration-300"
          >
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

          <button 
            onClick={() => setComingSoonType("profile")}
            className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700/50 overflow-hidden ml-2 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300 cursor-pointer"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4F46E5" alt="User" />
          </button>
        </header>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          {activeDashboardTab === "home" && (
            <HomeTab
              key="home"
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              isDragReject={isDragReject}
              isUploading={isUploading}
              errorMsg={errorMsg}
              illustrationSrc={illustrationSrc}
            />
          )}
          {activeDashboardTab === "recent" && (
            <RecentFilesTab key="recent" onOpenFile={async (file) => {
              setOpenedFromDashboard(true)
              await onDrop([file])
            }} />
          )}
          {activeDashboardTab === "starred" && (
            <StarredTab key="starred" onOpenFile={async (file) => {
              setOpenedFromDashboard(true)
              await onDrop([file])
            }} />
          )}
          {activeDashboardTab === "bookmarks" && (
            <BookmarksTab key="bookmarks" />
          )}
          {activeDashboardTab === "templates" && (
            <TemplatesTab key="templates" />
          )}
          {activeDashboardTab === "settings" && (
            <SettingsTab key="settings" />
          )}
          {activeDashboardTab === "shortcuts" && (
            <ShortcutsTab key="shortcuts" />
          )}
          {activeDashboardTab === "help" && (
            <HelpSupportTab key="help" />
          )}
          {activeDashboardTab === "about" && (
            <AboutTab key="about" />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe">
        <div className="flex items-center justify-around px-2 h-[72px]">
          <BottomNavItem icon={Home} label="Home" active={activeDashboardTab === "home"} onClick={() => setActiveDashboardTab("home")} />
          <BottomNavItem icon={Clock} label="Recent" active={activeDashboardTab === "recent"} onClick={() => setActiveDashboardTab("recent")} />
          <BottomNavItem icon={Star} label="Starred" active={activeDashboardTab === "starred"} onClick={() => setActiveDashboardTab("starred")} />
          <BottomNavItem icon={LayoutTemplate} label="Templates" active={activeDashboardTab === "templates"} onClick={() => setActiveDashboardTab("templates")} />
        </div>
      </nav>

      <ComingSoonModal 
        isOpen={comingSoonType !== null} 
        onClose={() => setComingSoonType(null)} 
        type={comingSoonType || "profile"} 
      />
      <ProPreviewModal 
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  )
}

function SidebarItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
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

function BottomNavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative",
        active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      )}
    >
      {active && (
        <motion.div
          layoutId="bottomNavBubble"
          className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon className={cn("w-5 h-5 mb-1 transition-transform duration-300", active && "scale-110")} />
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </button>
  )
}
