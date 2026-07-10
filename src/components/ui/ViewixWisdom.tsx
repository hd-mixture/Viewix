import React, { useState, useRef, useEffect } from "react"
import { Lightbulb, Highlighter, StickyNote, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { WISDOM_QUOTES, getDailyQuoteIndex } from "@/data/quotes"

export function ViewixWisdom({ className }: { className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    // Pick the daily deterministic quote on mount
    setQuoteIndex(getDailyQuoteIndex(WISDOM_QUOTES.length))
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative w-full overflow-hidden rounded-[16px] p-3.5 shadow-lg dark:shadow-2xl transition-all duration-300 group",
        "bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-[#09101C] dark:via-[#0E1528] dark:to-[#1F1743]",
        "border border-slate-200/80 dark:border-t-white/10 dark:border-l-white/10 dark:border-b-[#8B5CF6]/30 dark:border-r-[#3B82F6]/30",
        className
      )}
    >
      {/* Dynamic Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[16px] opacity-0 transition-opacity duration-300 z-20 mix-blend-screen"
        style={{
          opacity,
          background: `radial-gradient(150px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.15), transparent 80%)`,
        }}
      />
      {/* Intense Bottom Flare Glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-blue-300/30 dark:bg-blue-500/40 rounded-full blur-[40px] pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute -bottom-10 right-0 w-[150px] h-[100px] bg-purple-300/30 dark:bg-purple-500/40 rounded-full blur-[50px] pointer-events-none" />

      {/* Top Left Soft Glow */}
      <div className="absolute -top-10 -left-10 w-[150px] h-[150px] bg-cyan-200/20 dark:bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none" />

      {/* Ambient Star Particles */}
      <div className="absolute top-8 right-[40%] w-1.5 h-1.5 bg-cyan-400 dark:bg-cyan-300 rounded-full blur-[1px] shadow-[0_0_10px_2px_rgba(34,211,238,0.5)] dark:shadow-[0_0_10px_2px_#00E5FF] transition-all duration-700 group-hover:scale-150" />
      <div className="absolute top-[35%] right-6 w-1 h-1 bg-cyan-300 dark:bg-cyan-200 rounded-full blur-[0.5px] shadow-[0_0_8px_1px_rgba(34,211,238,0.4)] dark:shadow-[0_0_8px_1px_#00E5FF] transition-all duration-500 group-hover:opacity-50" />
      <div className="absolute bottom-[45%] right-4 w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full blur-[1.5px] shadow-[0_0_12px_3px_rgba(168,85,247,0.4)] dark:shadow-[0_0_12px_3px_#A855F7]" />
      <div className="absolute bottom-[20%] left-6 w-1.5 h-1.5 bg-purple-300 dark:bg-purple-200 rounded-full blur-[1px] shadow-[0_0_8px_2px_rgba(168,85,247,0.4)] dark:shadow-[0_0_8px_2px_#A855F7] transition-all duration-700 group-hover:scale-150" />
      <div className="absolute bottom-6 right-8 w-1 h-1 bg-purple-400 dark:bg-purple-300 rounded-full blur-[0.5px] shadow-[0_0_8px_1px_rgba(168,85,247,0.4)] dark:shadow-[0_0_8px_1px_#A855F7]" />

      {/* Graphic Elements (Approximating the 3D look with rotated CSS items) */}
      <div className="absolute top-1/2 right-[15px] -translate-y-[60%] w-[130px] h-[150px] pointer-events-none z-0 transition-transform duration-500 group-hover:-translate-y-[65%] scale-[0.65] origin-right">
        
        {/* Document Base */}
        <div className="absolute top-8 right-8 w-[70px] h-[95px] bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-[#1E293B]/90 dark:to-[#0F172A]/90 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] -rotate-12 flex flex-col items-center justify-center gap-2" style={{ transform: 'perspective(500px) rotateY(12deg) rotateX(10deg)' }}>
          <div className="w-10 h-1 bg-slate-300/60 dark:bg-white/20 rounded-full" />
          <div className="w-10 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-sm shadow-[0_0_12px_rgba(34,211,238,0.4)] dark:shadow-[0_0_12px_rgba(34,211,238,0.6)] border border-cyan-300/30" />
          <div className="w-10 h-1 bg-slate-300/60 dark:bg-white/20 rounded-full" />
          <div className="w-6 h-1 bg-slate-300/60 dark:bg-white/20 rounded-full self-start ml-[13px]" />
        </div>
        
        {/* Pen */}
        <div className="absolute top-[-10px] right-2 w-[14px] h-[75px] bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 dark:from-blue-300 dark:via-blue-500 dark:to-blue-800 rounded-full shadow-[0_5px_15px_rgba(59,130,246,0.3)] dark:shadow-[0_5px_15px_rgba(59,130,246,0.6)] rotate-[25deg] border border-blue-200/40 flex flex-col items-center transition-transform duration-500 group-hover:rotate-[30deg] group-hover:translate-x-1 group-hover:-translate-y-1">
          <div className="w-full h-3 bg-slate-700 dark:bg-slate-900 rounded-t-full border-b border-white/20" />
          <div className="w-full h-1 bg-cyan-300/80 my-1" />
          <div className="mt-auto w-0 h-0 border-l-[7px] border-r-[7px] border-t-[14px] border-l-transparent border-r-transparent border-t-slate-700 dark:border-t-slate-900" />
          <div className="absolute bottom-[-14px] w-0 h-0 border-l-[2px] border-r-[2px] border-t-[4px] border-l-transparent border-r-transparent border-t-cyan-400 shadow-[0_5px_10px_rgba(34,211,238,0.6)] dark:shadow-[0_5px_10px_rgba(34,211,238,1)]" />
        </div>

        {/* Purple Bubble */}
        <div className="absolute bottom-6 left-2 w-[48px] h-[32px] bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-400 dark:to-purple-600 rounded-lg rounded-br-sm shadow-[0_8px_20px_rgba(139,92,246,0.3)] dark:shadow-[0_8px_20px_rgba(139,92,246,0.6)] border border-violet-300/40 -rotate-[15deg] flex flex-col justify-center px-2.5 gap-1.5 transition-transform duration-500 group-hover:-rotate-[10deg] group-hover:-translate-y-1" style={{ transform: 'perspective(500px) rotateY(12deg)' }}>
          <div className="flex gap-1">
            <div className="w-3 h-1 bg-white/90 rounded-full shadow-sm" />
            <div className="w-2 h-1 bg-white/90 rounded-full shadow-sm" />
          </div>
          <div className="w-5 h-1 bg-white/90 rounded-full shadow-sm" />
          {/* Bubble tail */}
          <div className="absolute -bottom-2 right-0 w-0 h-0 border-l-[8px] border-r-[0px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-500 dark:border-t-purple-600 drop-shadow-md" />
        </div>

        {/* Yellow Sticky Note */}
        <div className="absolute bottom-1 right-2 w-[36px] h-[40px] bg-gradient-to-br from-[#FDF08B] to-[#F59E0B] rounded shadow-[0_8px_15px_rgba(245,158,11,0.3)] dark:shadow-[0_8px_15px_rgba(245,158,11,0.5)] rotate-12 flex flex-col pt-2 px-2 gap-1.5 border border-yellow-100/60 transition-transform duration-500 group-hover:rotate-[15deg] group-hover:translate-x-1" style={{ transform: 'perspective(500px) rotateY(-10deg)' }}>
          <div className="w-5 h-1 bg-amber-800/30 dark:bg-amber-800/40 rounded-full" />
          <div className="w-4 h-1 bg-amber-800/30 dark:bg-amber-800/40 rounded-full" />
          <div className="w-3 h-1 bg-amber-800/30 dark:bg-amber-800/40 rounded-full" />
          {/* Curled corner illusion */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-amber-600/20 dark:from-amber-600/30 to-transparent rounded-tl-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col">
            <h3 className="text-[12px] font-bold text-slate-800 dark:text-white tracking-wide leading-none">Viewix Wisdom</h3>
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1">Today's Insight</span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative mb-4 pr-[45px]">
          <span className="absolute -top-2 -left-1 text-[32px] font-serif font-bold text-cyan-500/30 dark:text-[#00E5FF] leading-none opacity-80 pointer-events-none">“</span>
          <p className="relative z-10 text-[13px] italic font-medium text-slate-700 dark:text-slate-100 leading-[1.5] font-serif tracking-wide pt-2 pl-4">
            {WISDOM_QUOTES[quoteIndex]?.[0]}<br/>
            {WISDOM_QUOTES[quoteIndex]?.[1]}<br/>
            {WISDOM_QUOTES[quoteIndex]?.[2]}<span className="text-blue-500 dark:text-[#3B82F6] font-bold opacity-50 dark:opacity-80 ml-0.5 not-italic">”</span>
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-auto">
          <div className="h-[1px] w-full bg-slate-200/80 dark:bg-white/10 mb-2" />
          <p className="text-[9.5px] font-medium bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 dark:from-[#00E5FF] dark:via-[#3B82F6] dark:to-[#A855F7] tracking-wider transition-all duration-300 group-hover:brightness-110">
            Read &nbsp;&bull;&nbsp; Mark &nbsp;&bull;&nbsp; Collaborate
          </p>
        </div>
      </div>
    </div>
  )
}
