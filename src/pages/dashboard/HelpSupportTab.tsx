import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, HelpCircle, Book, MessageCircle, PlayCircle, ExternalLink, ChevronDown, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "How do I edit text in a PDF?",
    a: "Currently, Viewix supports adding text overlays, highlights, and drawings. True native text editing is coming in a future update. Use the text tool in the top toolbar to add annotations."
  },
  {
    q: "Are my files secure?",
    a: "Yes! All PDF processing happens directly in your browser. We never upload your documents to our servers unless you explicitly choose to use our cloud sync feature (Pro only)."
  },
  {
    q: "How do I export my annotated PDF?",
    a: "Click the 'Export PDF' button in the top right corner of the workspace. This will generate a new PDF file containing all your annotations and trigger a download."
  },
  {
    q: "Is there a file size limit?",
    a: "Free users can upload PDFs up to 50MB. Pro users can upload files up to 200MB."
  }
]

export function HelpSupportTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Help & Support</h1>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know about Viewix.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-10 w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column: FAQs & Docs */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" /> Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                if (searchQuery && !faq.q.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.a.toLowerCase().includes(searchQuery.toLowerCase())) return null
                
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden transition-all duration-300 shadow-sm">
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{faq.q}</span>
                      <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 pt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/40">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-500" /> Video Tutorials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="group relative bg-slate-100 dark:bg-slate-800 aspect-video rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-indigo-600 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm font-medium">Getting Started with Viewix {i}</p>
                    <p className="text-white/70 text-xs">2:45 mins</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Contact & Quick Links */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-500" /> Contact Support
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Need more help? Send us a message and we'll get back to you within 24 hours.</p>
            
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Type</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Billing Issue</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea 
                  rows={4} 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none custom-scrollbar"
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-10 shadow-[0_4px_14px_rgba(16,185,129,0.2)]">
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-900/50 border border-blue-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-500" /> Documentation
            </h3>
            <div className="space-y-2">
              {['User Guide', 'Keyboard Shortcuts API', 'Enterprise Deployment', 'Release Notes'].map(link => (
                <a key={link} href="#" className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-xl hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-500/30 border border-transparent transition-all group">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{link}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
