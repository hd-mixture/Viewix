import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ShieldCheck, UploadCloud, PenTool, Zap, Users } from "lucide-react"
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
      className="flex-1 px-8 lg:px-12 pb-8 flex flex-col justify-between w-full h-full relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar"
    >
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
    <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors duration-500", iconBg)}>
        <Icon className={cn("w-5 h-5 transition-colors duration-500", iconColor)} />
      </div>
      <div className="pt-0.5">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1 transition-colors duration-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-500">{description}</p>
      </div>
    </div>
  )
}
