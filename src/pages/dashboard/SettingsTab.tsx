import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, User, Palette, Layout, PenTool, Zap, HardDrive, FlaskConical, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Layout },
  { id: "annotation", label: "Annotation", icon: PenTool },
  { id: "performance", label: "Performance", icon: Zap },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "experimental", label: "Experimental", icon: FlaskConical },
]

export function SettingsTab() {
  const [activeSection, setActiveSection] = useState("general")
  const { theme, setTheme } = useTheme()

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Auto-save Documents</h4>
                  <p className="text-sm text-slate-500">Automatically save changes every 30 seconds.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Analytics</h4>
                  <p className="text-sm text-slate-500">Help improve Viewix by sending anonymous usage data.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )
      case "appearance":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Appearance Settings</h3>
            
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Theme</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("flex flex-col items-center p-4 rounded-xl border-2 transition-all", theme === 'light' ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                >
                  <Sun className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300" />
                  <span className="text-sm font-medium">Light Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("flex flex-col items-center p-4 rounded-xl border-2 transition-all", theme === 'dark' ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                >
                  <Moon className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={cn("flex flex-col items-center p-4 rounded-xl border-2 transition-all", theme === 'system' ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                >
                  <Monitor className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300" />
                  <span className="text-sm font-medium">System Default</span>
                </button>
              </div>
            </div>
          </motion.div>
        )
      case "performance":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Performance Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Hardware Acceleration</h4>
                  <p className="text-sm text-slate-500">Use GPU for rendering PDFs smoothly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Low Resolution Previews</h4>
                  <p className="text-sm text-slate-500">Load low-res pages first while scrolling fast.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )
      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64">
            <h3 className="text-xl font-medium text-slate-400">Settings for {activeSection} coming soon.</h3>
          </motion.div>
        )
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your workspace preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 overflow-y-auto custom-scrollbar md:pr-4">
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
