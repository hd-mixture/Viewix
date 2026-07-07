import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ShieldCheck, UploadCloud, PenTool, Zap, Users, Crown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HomeTab({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  isDragReject, 
  isUploading, 
  errorMsg 
}: any) {
  const { theme } = useTheme()
  const isLight = theme !== "dark"
  const illustrationSrc = isLight ? "/Futuristic_interface_light.png" : "/Futuristic_interface.png"

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 px-4 md:px-8 lg:px-12 pb-8 flex flex-col justify-between w-full h-full relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar"
    >
      {/* Top Section (Row 1: Text+Image, Row 2: Upload, Row 3: Security) */}
      <div className="flex flex-col flex-1 min-h-0 py-2 lg:py-4 gap-6 md:gap-8">
        
        {/* Row 1: Text & Illustration Side-by-Side */}
        <div className="flex flex-row items-center justify-between gap-2 md:gap-8">
          
          {/* Text Area */}
          <div className="flex-[1.2] md:flex-1 space-y-3 pt-2 lg:pt-6">
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
                className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-[1.1] transition-colors duration-500"
              >
                Viewi<span className="text-blue-600">x</span>
              </motion.h1>
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-lg lg:text-2xl font-medium text-slate-600 dark:text-slate-300 pt-1 transition-colors duration-500 pr-2 md:pr-0"
            >
              A Modern PDF Annotation Workspace.
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400 max-w-[200px] md:max-w-md text-[10px] md:text-sm lg:text-base leading-relaxed transition-colors duration-500"
            >
              Read, annotate, edit and collaborate on your PDF documents with a powerful and beautiful workspace.
            </motion.p>
          </div>

          {/* Illustration Area */}
          <motion.div
            key={theme}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-[0.8] md:flex-1 h-[140px] md:h-[300px] lg:h-[400px] relative"
          >
            <img
              src={illustrationSrc}
              alt="Workspace Illustration"
              className={cn(
                "absolute inset-0 w-full h-full object-contain object-right md:object-center md:-translate-x-8 scale-[1.35] md:scale-[1.1] transition-all duration-700 ease-in-out",
                isLight ? "drop-shadow-[0_20px_40px_rgba(37,99,235,0.1)]" : "drop-shadow-[0_0_40px_rgba(37,99,235,0.15)]"
              )}
            />
          </motion.div>
        </div>

        {/* Row 2 & 3: Upload Area & Security (Centered or Left-aligned on Desktop) */}
        <div className="flex flex-col space-y-4 lg:pl-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            {...getRootProps()}
            className={cn(
              "w-full md:max-w-[500px] rounded-[24px] border-2 border-dashed bg-white dark:bg-slate-900/30 p-5 md:p-8 text-center transition-all duration-300 cursor-pointer group mx-auto md:mx-0",
              isDragActive && !isDragReject ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-slate-300 dark:border-slate-700",
              isDragReject ? "border-red-500 bg-red-50/50 dark:bg-red-500/10" : "",
              !isDragActive && "hover:border-blue-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-sm dark:shadow-none"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-8 w-8 md:h-10 md:w-10 text-blue-600 dark:text-blue-500 mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-xs md:text-base font-medium text-slate-700 dark:text-slate-200 mb-1 transition-colors duration-500">
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
              <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs mb-3 md:mb-4 transition-colors duration-500">or</p>
            )}

            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[14px] h-10 md:h-11 shadow-[0_4px_14px_rgba(37,99,235,0.25)] dark:shadow-[0_0_15px_rgba(37,99,235,0.2)] border-0 transition-shadow">
              <UploadCloud className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Upload PDF
            </Button>

            <p className="text-[9px] md:text-xs text-slate-400 dark:text-slate-500 mt-3 md:mt-4 flex items-center justify-center gap-1.5 transition-colors duration-500">
              Supports: PDF <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /> Max file size: 200MB
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start md:items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm text-slate-500 dark:text-slate-500 px-2 md:px-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0" />
            <span className="text-center md:text-left">Your files are <span className="text-blue-500 dark:text-blue-400">private</span> and <span className="text-blue-500 dark:text-blue-400">secure</span>. <br className="md:hidden" />All processing happens in your browser.</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom Feature Cards & Mobile Viewix Pro Card */}
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

      {/* Mobile Viewix Pro Card (Hidden on Desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="md:hidden mt-6"
      >
        <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 border border-amber-200/50 dark:border-amber-500/20 shadow-sm active:scale-[0.98] transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Crown className="w-32 h-32" />
          </div>
          
          <div className="flex items-start gap-4 relative z-10 text-left">
            <div className="p-3 bg-white dark:bg-amber-500/20 rounded-xl shadow-sm border border-amber-100 dark:border-amber-500/30">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Viewix Pro</h4>
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pro</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-[200px]">Preview the premium roadmap for professional users.</p>
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center justify-center bg-white dark:bg-amber-500/10 relative z-10 shrink-0">
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </div>
        </button>
      </motion.div>
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
    <div className="group flex items-start gap-2 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div className={cn("p-2 md:p-2.5 rounded-lg md:rounded-xl shrink-0 transition-colors duration-500", iconBg)}>
        <Icon className={cn("w-3.5 h-3.5 md:w-5 md:h-5 transition-colors duration-500", iconColor)} />
      </div>
      <div className="pt-0 md:pt-0.5">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] md:text-sm mb-0.5 md:mb-1 transition-colors duration-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h4>
        <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 leading-tight md:leading-relaxed transition-colors duration-500">{description}</p>
      </div>
    </div>
  )
}
