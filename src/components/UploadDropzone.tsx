import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { loadPdfDocument } from "@/utils/pdf"
import { motion } from "framer-motion"

export function UploadDropzone() {
  const [isHovered, setIsHovered] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { setPdfFile, setPdfDocument, isOffline } = useWorkspaceStore()

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMsg(null)
    
    if (fileRejections.length > 0) {
      setErrorMsg("Invalid file type. Please upload a PDF.")
      return
    }
    
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 50MB.")
      return
    }

    setIsUploading(true)
    
    try {
      const doc = await loadPdfDocument(file)
      setPdfDocument(doc)
      setPdfFile(file)
    } catch (error) {
      console.error("Failed to load PDF:", error)
      setErrorMsg("Failed to parse PDF document. It may be corrupted or encrypted.")
    } finally {
      setIsUploading(false)
    }
  }, [setPdfFile, setPdfDocument])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isOffline,
  })

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="relative mx-auto w-full max-w-2xl"
    >
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-border bg-card p-12 text-center transition-all duration-300",
          isDragActive && !isDragReject ? "border-primary/50 bg-primary/5 ring-4 ring-primary/10" : "",
          isDragReject ? "border-destructive/50 bg-destructive/5 ring-4 ring-destructive/10" : "",
          !isDragActive && isHovered ? "border-border/80 shadow-2xl shadow-primary/5" : "shadow-xl"
        )}
      >
        {isOffline ? (
          <div className="flex flex-col items-center justify-center py-6">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <img src="/offline_illustration.png" alt="Offline" className="w-48 h-48 object-contain mb-4 drop-shadow-xl" />
            </motion.div>
            <h3 className="mb-2 text-2xl font-heading font-bold text-foreground">You're Offline</h3>
            <p className="max-w-sm mx-auto text-muted-foreground text-sm">
              Please reconnect to the internet to upload new PDF documents.
            </p>
          </div>
        ) : (
          <>
            <input {...getInputProps()} />

            {/* Animated Background Blob */}
            <div 
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[80px] transition-all duration-700",
                (isDragActive || isHovered) ? "scale-150 opacity-100" : "scale-100 opacity-0"
              )}
            />

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-inner ring-1 ring-border">
              {isDragReject ? (
                <AlertCircle className="h-10 w-10 text-destructive" />
              ) : isUploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <UploadCloud className="h-10 w-10 text-primary" />
                </motion.div>
              ) : (
                <File className={cn(
                  "h-10 w-10 transition-colors duration-300",
                  isDragActive || isHovered ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </div>

            <h3 className="mb-2 text-2xl font-heading font-semibold text-foreground">
              {errorMsg 
                ? "Upload Failed"
                : isUploading 
                ? "Processing PDF..." 
                : isDragActive 
                  ? "Drop PDF here" 
                  : "Upload your PDF"}
            </h3>
            
            <p className={cn("mb-8 max-w-sm mx-auto", errorMsg ? "text-destructive" : "text-muted-foreground")}>
              {errorMsg 
                ? errorMsg 
                : isUploading
                ? "Please wait while we process your document."
                : isDragReject 
                  ? "Please upload a valid PDF file." 
                  : "Drag and drop your document here, or click to browse files from your computer."}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border">
              Maximum file size: 50MB
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
