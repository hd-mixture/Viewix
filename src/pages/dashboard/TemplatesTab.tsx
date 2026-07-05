import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, LayoutTemplate, Star, Copy, Eye, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  title: string
  category: string
  isPro?: boolean
  thumbnail: string
  description: string
}

const mockTemplates: Template[] = [
  { id: "t1", title: "Modern Invoice", category: "Business", thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80", description: "Clean, professional invoice for freelancers and agencies." },
  { id: "t2", title: "Creative Resume", category: "Personal", thumbnail: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=500&q=80", description: "Stand out with this modern resume design." },
  { id: "t3", title: "Monthly Planner", category: "Productivity", isPro: true, thumbnail: "https://images.unsplash.com/photo-1506784951206-3962de9bd41e?w=500&q=80", description: "Organize your month efficiently." },
  { id: "t4", title: "Project Proposal", category: "Business", isPro: true, thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80", description: "Win more clients with this comprehensive proposal." },
  { id: "t5", title: "Meeting Minutes", category: "Business", thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&q=80", description: "Simple template for tracking meeting notes and action items." },
  { id: "t6", title: "Workout Tracker", category: "Personal", thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80", description: "Track your fitness progress daily." },
]

const categories = ["All", "Business", "Personal", "Productivity"]

export function TemplatesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredTemplates = mockTemplates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || t.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 p-8 lg:p-12 flex flex-col w-full h-full relative z-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Template Gallery</h1>
          <p className="text-slate-500 dark:text-slate-400">Start your next document instantly with a professional template.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/60 overflow-x-auto max-w-[calc(100vw-4rem)] custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 w-full sm:w-56 lg:w-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto mt-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <LayoutTemplate className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={template.id}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={template.thumbnail} 
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60" />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center gap-3",
                      hoveredId === template.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}>
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white w-32 shadow-lg">
                        <Play className="w-4 h-4 mr-2" /> Use
                      </Button>
                      <Button variant="secondary" className="w-32 bg-white/90 hover:bg-white text-slate-900">
                        <Eye className="w-4 h-4 mr-2" /> Preview
                      </Button>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {template.isPro && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">
                          Pro
                        </span>
                      )}
                      <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">
                        {template.category}
                      </span>
                    </div>

                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/90 backdrop-blur-md flex items-center justify-center transition-colors group/star">
                      <Star className="w-4 h-4 text-white group-hover/star:text-amber-500 group-hover/star:fill-amber-500 transition-colors" />
                    </button>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{template.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{template.description}</p>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
