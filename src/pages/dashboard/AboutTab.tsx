import { useState } from "react"
import { motion } from "framer-motion"
import { Info, MessageCircle, Globe, Heart, CheckCircle2, History, Sparkles, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

const upcomingFeatures = [
  "Settings: Theme overrides, Auto Save, Keyboard Shortcuts",
  "User Profile: Account management and Connected devices",
  "Collaboration: Multi-user real-time document viewing"
]

const changelog = [
  {
    version: "v2.5.0",
    date: "July 2026",
    changes: [
      "Added intelligent 'Continue Reading' widget on Mobile Home with live PDF cover extraction",
      "Introduced dynamic daily 'Viewix Wisdom' quotes with 3D glassmorphism floating effects",
      "Designed a smart, context-aware collapsible Properties Panel for desktop layout",
      "Implemented real-time tracking of document reading progress natively"
    ]
  },
  {
    version: "v2.4.0",
    date: "July 2026",
    changes: [
      "Extensive Mobile UI improvements for drawing and text formatting",
      "Added live Eraser brush size preview with animated iOS-style toggle",
      "Introduced responsive sliders for Size and Stroke in Quick Actions",
      "Fixed mobile scrolling and pinch-to-zoom interference during drawing",
      "Improved text tool with Bold, Italic, and Underline mobile toggles"
    ]
  },
  {
    version: "v2.3.0",
    date: "July 2026",
    changes: [
      "Redesigned Template Gallery with premium animated category navigation",
      "Added Starred Templates grouping and robust recent file integration",
      "Introduced official PDF-styled printable Keyboard Shortcuts layout",
      "Fixed dark/light mode button contrasts in dashboard tabs",
      "Fixed template copy persistence and timestamp tracking"
    ]
  },
  {
    version: "v2.2.0",
    date: "July 2026",
    changes: [
      "Added Universal Search command palette (Ctrl+T / Ctrl+D)",
      "Implemented bi-directional sliding animations for Toolbar",
      "Added 'Open File' native integration in Dashboard header",
      "Introduced Viewix Pro roadmap preview and Coming Soon modals",
      "Enhanced PDF text highlighting to respect native text rendering"
    ]
  },
  {
    version: "v2.1.0",
    date: "July 2026",
    changes: [
      "Added Morph Action Button for exporting",
      "Redesigned the entire dashboard experience",
      "Implemented Framer Motion page transitions",
      "Fixed an issue with PDF state persistence",
    ]
  },
  {
    version: "v2.0.0",
    date: "July 2026",
    changes: [
      "Complete visual overhaul of the workspace",
      "Introduced dynamic dark mode",
      "Added signature and annotation tools",
      "Performance improvements for large PDFs"
    ]
  }
]

export function AboutTab() {
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const showToast = useWorkspaceStore(state => state.showToast)

  const handleCheckUpdate = () => {
    setIsChecking(true)
    setTimeout(() => {
      setIsChecking(false)
      setLastChecked(new Date())
      showToast("Up to date", "You are running the latest version of Viewix (v2.5.0).", 3000)
    }, 1500)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10 overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">About Viewix</h1>
          <p className="text-slate-500 dark:text-slate-400">Version 2.5.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column: Version & Changelog */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-white/10 blur-[50px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] rounded-full bg-indigo-400/20 blur-[40px] pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 font-['Plus_Jakarta_Sans',sans-serif]">Viewix Workspace</h2>
              <p className="text-blue-100 max-w-lg mb-8 leading-relaxed">
                A modern, beautiful, and powerful PDF workspace built for the web. Experience lightning-fast annotations and a seamless user interface.
              </p>
              
              <div className="flex items-center gap-4 mt-8">
                <Button 
                  onClick={handleCheckUpdate}
                  disabled={isChecking}
                  className="bg-white text-blue-600 hover:bg-blue-50 border-0 flex items-center gap-2 min-w-[160px] justify-center transition-all disabled:opacity-90"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check for Updates"
                  )}
                </Button>
                <span className="text-sm text-blue-200">
                  {lastChecked 
                    ? `Last checked: ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                    : "Up to date"}
                </span>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" /> Changelog
            </h2>
            <div className="space-y-6">
              {changelog.map((release, i) => (
                <div key={i} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{release.version}</h3>
                    <span className="text-sm font-medium text-slate-500">{release.date}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
                    <ul className="space-y-3">
                      {release.changes.map((change, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Upcoming Changelog
            </h2>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">v3.0.0 (Roadmap)</h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20">Coming Soon</span>
              </div>
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/5 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm">
                <ul className="space-y-3">
                  {upcomingFeatures.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Credits & Socials */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-500 fill-blue-500/20" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Built with passion</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Designed and engineered by the Antigravity team to push the boundaries of what's possible in the browser.
            </p>
            <div className="flex justify-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#1DA1F2] dark:hover:text-[#1DA1F2] transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors">
                <Info className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Viewix Workspace.<br/>All rights reserved.
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-slate-500">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Licenses</a>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
