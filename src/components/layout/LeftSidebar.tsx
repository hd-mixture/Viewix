import { useState } from "react"
import { Layers, Bookmark, List, Settings, MessageSquare, Clock, Plus, Upload, FolderOpen, Download, FileJson, LayoutDashboard } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

import { PagesPanel } from "./sidebar/PagesPanel"
import { WorkspacePanel } from "./sidebar/WorkspacePanel"
import { BookmarksPanel } from "./sidebar/BookmarksPanel"
import { CommentsPanel } from "./sidebar/CommentsPanel"
import { OutlinePanel } from "./sidebar/OutlinePanel"
import { HistoryPanel } from "./sidebar/HistoryPanel"

export function LeftSidebar() {
  const { activeSidebarTab, setActiveSidebarTab } = useWorkspaceStore()
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)

  return (
    <div className="flex h-full gap-4 z-20 pointer-events-none relative">
      
      {/* Far Left Navigation Toolbar */}
      <aside className="w-[60px] h-full flex flex-col items-center py-4 bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg dark:shadow-2xl pointer-events-auto transition-colors duration-500 relative z-30">
        <div className="flex flex-col gap-2">
          <NavIconButton 
            icon={Settings} 
            active={activeSidebarTab === "workspace"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "workspace" ? null : "workspace")}
            tooltip="Document Overview"
          />
        </div>
        
        <div className="w-8 h-px bg-slate-200 dark:bg-white/10 my-4 transition-colors duration-500" />
        
        <div className="flex flex-col gap-2 flex-1">
          <NavIconButton 
            icon={Layers} 
            active={activeSidebarTab === "pages"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "pages" ? null : "pages")}
            tooltip="Pages"
          />
          <NavIconButton 
            icon={Bookmark} 
            active={activeSidebarTab === "bookmarks"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "bookmarks" ? null : "bookmarks")}
            tooltip="Bookmarks"
          />
          <NavIconButton 
            icon={MessageSquare} 
            active={activeSidebarTab === "comments"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "comments" ? null : "comments")}
            tooltip="Comments"
          />
          <NavIconButton 
            icon={List} 
            active={activeSidebarTab === "outline"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "outline" ? null : "outline")}
            tooltip="Outline"
          />
          <NavIconButton 
            icon={Clock} 
            active={activeSidebarTab === "history"} 
            onClick={() => setActiveSidebarTab(activeSidebarTab === "history" ? null : "history")}
            tooltip="History"
          />
        </div>

        <div className="flex flex-col gap-2 mt-auto relative">
          <NavIconButton 
            icon={Plus} 
            active={isPlusMenuOpen}
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            tooltip="Actions"
          />
          
          {/* Floating Action Menu */}
          <AnimatePresence>
            {isPlusMenuOpen && (
              <>
                {/* Invisible backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsPlusMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute bottom-0 left-[68px] w-64 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                >
                  <MenuItem icon={Upload} label="Upload PDF" />
                  <MenuItem icon={FolderOpen} label="Open Recent" />
                  <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <MenuItem icon={Download} label="Import Annotation JSON" />
                  <MenuItem icon={FileJson} label="Export Annotation JSON" />
                  <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-1" />
                  <MenuItem icon={LayoutDashboard} label="New Workspace" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Dynamic Content Panel Container */}
      <div className="relative h-full flex items-center pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSidebarTab === "workspace" && (
            <SidebarPanelWrapper key="workspace">
              <WorkspacePanel />
            </SidebarPanelWrapper>
          )}
          {activeSidebarTab === "pages" && (
            <SidebarPanelWrapper key="pages">
              <PagesPanel />
            </SidebarPanelWrapper>
          )}
          {activeSidebarTab === "bookmarks" && (
            <SidebarPanelWrapper key="bookmarks">
              <BookmarksPanel />
            </SidebarPanelWrapper>
          )}
          {activeSidebarTab === "comments" && (
            <SidebarPanelWrapper key="comments">
              <CommentsPanel />
            </SidebarPanelWrapper>
          )}
          {activeSidebarTab === "outline" && (
            <SidebarPanelWrapper key="outline">
              <OutlinePanel />
            </SidebarPanelWrapper>
          )}
          {activeSidebarTab === "history" && (
            <SidebarPanelWrapper key="history">
              <HistoryPanel />
            </SidebarPanelWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SidebarPanelWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full flex items-center"
    >
      {children}
    </motion.div>
  )
}

function NavIconButton({ icon: Icon, active, onClick, tooltip }: { icon: any, active?: boolean, onClick?: () => void, tooltip: string }) {
  return (
    <div className="relative group/nav pointer-events-auto">
      <button 
        onClick={onClick}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
          active 
            ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white scale-105 border border-blue-400 dark:border-blue-500" 
            : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:scale-105"
        )}
      >
        <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "scale-110 drop-shadow-md")} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-medium rounded-lg opacity-0 -translate-x-2 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
        {tooltip}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700" />
      </div>
    </div>
  )
}

function MenuItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors text-left group">
      <div className="text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-medium text-[13px]">{label}</span>
    </button>
  )
}
