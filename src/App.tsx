import { useEffect, useState } from "react"
import { Workspace } from "@/pages/Workspace"
import { Dashboard } from "@/pages/Dashboard"
import { ThemeProvider } from "@/components/ThemeProvider"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { SignatureModal } from "@/components/ui/modals/SignatureModal"
import { ToastNotification } from "@/components/ui/ToastNotification"
import { getPdfFromDB } from "@/lib/db"
import * as pdfjsLib from "pdfjs-dist"

// Ensure pdf.js worker is loaded using CDN to prevent Vite resolve errors
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

function App() {
  const { pdfDocument, setPdfDocument, setPdfFile, isSignatureModalOpen, setSignatureModalOpen } = useWorkspaceStore()
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      if (pdfDocument) {
        setIsRestoring(false)
        return
      }

      try {
        const stored = localStorage.getItem('viewix_recent')
        if (stored) {
          const recents = JSON.parse(stored)
          if (recents.length > 0) {
            const lastActiveName = recents[0].name
            const file = await getPdfFromDB(lastActiveName)
            if (file) {
              const url = URL.createObjectURL(file)
              const config = { url }
              const loadingTask = pdfjsLib.getDocument(config)
              const doc = await loadingTask.promise
              
              setPdfDocument(doc)
              setPdfFile(file)
              
              setTimeout(() => URL.revokeObjectURL(url), 1000)
            }
          }
        }
      } catch (error) {
        console.error("Failed to restore session", error)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, []) // Empty dependency array ensures it only runs on mount

  if (isRestoring) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#0F172A]"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0F172A] font-sans text-foreground antialiased selection:bg-primary/30 relative">
        <SignatureModal 
          isOpen={isSignatureModalOpen} 
          onClose={() => setSignatureModalOpen(false)} 
        />
        <ToastNotification />
        {pdfDocument ? <Workspace /> : <Dashboard />}
      </div>
    </ThemeProvider>
  )
}

export default App
