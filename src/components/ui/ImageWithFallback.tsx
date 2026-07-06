import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, LayoutTemplate, Briefcase, FileSignature, Presentation, Activity, GraduationCap, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle: string
  category: string
  containerClassName?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  Business: <Briefcase className="w-8 h-8 opacity-50" />,
  Personal: <LayoutTemplate className="w-8 h-8 opacity-50" />,
  Productivity: <Activity className="w-8 h-8 opacity-50" />,
  Invoices: <FileText className="w-8 h-8 opacity-50" />,
  Resume: <FileSignature className="w-8 h-8 opacity-50" />,
  Reports: <Presentation className="w-8 h-8 opacity-50" />,
  Certificates: <GraduationCap className="w-8 h-8 opacity-50" />,
  Letters: <Mail className="w-8 h-8 opacity-50" />,
}

const categoryColors: Record<string, string> = {
  Business: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Personal: "from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
  Productivity: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Invoices: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Resume: "from-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  Reports: "from-cyan-500/20 to-sky-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  Certificates: "from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Letters: "from-slate-500/20 to-gray-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30",
}

export function ImageWithFallback({ 
  src, 
  fallbackTitle, 
  category, 
  className,
  containerClassName,
  ...props 
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const themeClasses = categoryColors[category] || categoryColors.Personal
  const Icon = categoryIcons[category] || <FileText className="w-8 h-8 opacity-50" />

  return (
    <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-xl bg-gradient-to-br",
          themeClasses,
          className
        )}>
          <div className="mb-3 p-4 bg-white/50 dark:bg-black/20 rounded-full shadow-sm backdrop-blur-sm">
            {Icon}
          </div>
          <h4 className="font-bold text-sm leading-tight line-clamp-2">{fallbackTitle}</h4>
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mt-1">{category}</span>
        </div>
      ) : (
        <motion.img
          src={src}
          className={cn(
            "w-full h-full object-cover origin-center transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          {...props}
        />
      )}
    </div>
  )
}
