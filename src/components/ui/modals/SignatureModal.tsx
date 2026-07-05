import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Type, PenTool, Upload, Save, Undo, Redo, Trash2, Bookmark, Check } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
}

const FONTS = [
  { name: "Caveat", label: "Handwritten" },
  { name: "Pacifico", label: "Classic" },
  { name: "Dancing Script", label: "Elegant" },
  { name: "Great Vibes", label: "Modern" }
]

export function SignatureModal({ isOpen, onClose }: SignatureModalProps) {
  const [tab, setTab] = useState<"draw" | "type" | "upload" | "saved">("draw")
  const { addAnnotation, pendingSignaturePosition, setPendingSignaturePosition, savedSignatures, saveSignature, deleteSavedSignature } = useWorkspaceStore()

  // Draw State
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  // Type State
  const [typedSignature, setTypedSignature] = useState("John Doe")
  const [typedFont, setTypedFont] = useState(FONTS[0].name)
  const [typedColor, setTypedColor] = useState("#000000")

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  useEffect(() => {
    // Inject fonts
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Pacifico&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Setup Draw Canvas
  useEffect(() => {
    if (tab === "draw" && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = 3
        ctx.strokeStyle = "#000000"
      }
    }
  }, [tab, isOpen])

  const saveState = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      setStrokes([...strokes, ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)])
      setRedoStack([])
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen" && e.pointerType !== "touch") return
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      ctx.beginPath()
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      saveState()
    }
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveState()
    }
  }

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      setStrokes([])
      setRedoStack([])
    }
  }

  const undoDraw = () => {
    if (strokes.length === 0) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      const newStrokes = [...strokes]
      const lastState = newStrokes.pop()!
      setRedoStack([...redoStack, lastState])
      setStrokes(newStrokes)
      
      if (newStrokes.length > 0) {
        ctx.putImageData(newStrokes[newStrokes.length - 1], 0, 0)
      } else {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const applySignature = (dataUrl: string) => {
    // Save to local storage
    saveSignature(dataUrl)
    
    if (pendingSignaturePosition) {
      const sigWidth = pendingSignaturePosition.width || 150
      const sigHeight = pendingSignaturePosition.height || 60
      
      addAnnotation({
        id: Math.random().toString(36).substr(2, 9),
        pageNumber: pendingSignaturePosition.pageNumber,
        type: "signature",
        x: pendingSignaturePosition.x,
        y: pendingSignaturePosition.y,
        width: sigWidth,
        height: sigHeight,
        signatureDataUrl: dataUrl,
        color: "#000000",
        strokeWidth: 0,
        opacity: 1
      })
      setPendingSignaturePosition(null)
    } else {
        // Fallback drop if opened from toolbar double click
        addAnnotation({
            id: Math.random().toString(36).substr(2, 9),
            pageNumber: 1,
            type: "signature",
            x: 50,
            y: 50,
            width: 150,
            height: 60,
            signatureDataUrl: dataUrl,
            color: "#000000",
            strokeWidth: 0,
            opacity: 1
        })
    }
    
    // Reset state
    clearCanvas()
    setUploadedImage(null)
    onClose()
  }

  const handleSave = () => {
    let dataUrl = ""
    
    if (tab === "draw" && canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL("image/png")
    } else if (tab === "type") {
      const c = document.createElement("canvas")
      c.width = 450; c.height = 150
      const ctx = c.getContext("2d")
      if (ctx) {
        ctx.font = `60px "${typedFont}"`
        ctx.fillStyle = typedColor
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(typedSignature, 225, 75)
        dataUrl = c.toDataURL("image/png")
      }
    } else if (tab === "upload" && uploadedImage) {
      dataUrl = uploadedImage
    }

    if (dataUrl) {
      applySignature(dataUrl)
    }
  }

  const handleSavedSelect = (dataUrl: string) => {
    applySignature(dataUrl)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="signature-modal" className="absolute inset-0 z-[200] isolate flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/10 dark:bg-[#020617]/30 backdrop-blur-sm rounded-2xl"
            onClick={onClose}
          />
          <div className="relative z-[201]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col w-[500px]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add Signature</h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700">
                <button 
                  onClick={() => setTab("draw")} 
                  className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors ${tab === "draw" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"}`}
                >
                  <PenTool className="w-4 h-4" /> Draw
                </button>
                <button 
                  onClick={() => setTab("type")} 
                  className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors ${tab === "type" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"}`}
                >
                  <Type className="w-4 h-4" /> Type
                </button>
                <button 
                  onClick={() => setTab("upload")} 
                  className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors ${tab === "upload" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"}`}
                >
                  <Upload className="w-4 h-4" /> Upload
                </button>
                <button 
                  onClick={() => setTab("saved")} 
                  className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors ${tab === "saved" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"}`}
                >
                  <Bookmark className="w-4 h-4" /> Saved
                </button>
              </div>

              <div className="p-6 flex flex-col items-center justify-center min-h-[240px] bg-slate-50 dark:bg-slate-900/50">
                {tab === "draw" && (
                  <div className="w-full flex flex-col gap-3">
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white w-full h-[180px] overflow-hidden shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={450}
                        height={180}
                        className="cursor-crosshair w-full h-full touch-none"
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerOut={stopDrawing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button onClick={clearCanvas} className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors">
                        Clear Canvas
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={undoDraw} disabled={strokes.length === 0} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50">
                          <Undo className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {tab === "type" && (
                  <div className="w-full flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Type your signature here..." 
                      value={typedSignature}
                      onChange={e => setTypedSignature(e.target.value)}
                      className="w-full p-4 text-3xl text-center bg-white border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 shadow-inner"
                      style={{ fontFamily: typedFont, color: typedColor }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {FONTS.map(f => (
                        <button 
                          key={f.name}
                          onClick={() => setTypedFont(f.name)}
                          className={`px-3 py-2 border rounded-lg text-lg flex items-center justify-between transition-colors ${typedFont === f.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                          style={{ fontFamily: f.name }}
                        >
                          {f.label}
                          {typedFont === f.name && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "upload" && (
                  <div className="w-full">
                    {!uploadedImage ? (
                      <label className="w-full h-[180px] border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 group shadow-inner">
                        <Upload className="w-8 h-8 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium">Click to upload signature (PNG/JPEG)</span>
                        <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleFileUpload} />
                      </label>
                    ) : (
                      <div className="relative w-full h-[180px] border-2 border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center bg-white shadow-inner">
                        <img src={uploadedImage} alt="Uploaded signature" className="max-h-[160px] max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === "saved" && (
                  <div className="w-full flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                    {(savedSignatures || []).length === 0 ? (
                      <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
                        No saved signatures yet.
                      </div>
                    ) : (
                      (savedSignatures || []).map((dataUrl, idx) => (
                        <div key={idx} className="group relative flex items-center justify-center w-full h-[80px] border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 cursor-pointer overflow-hidden transition-colors" onClick={() => handleSavedSelect(dataUrl)}>
                          <img src={dataUrl} alt={`Signature ${idx}`} className="h-[60%] object-contain mix-blend-multiply dark:mix-blend-normal opacity-80 group-hover:opacity-100 transition-opacity" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteSavedSignature(idx); }}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {tab !== "saved" && (
                <div className="p-4 border-t border-slate-200/80 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/30">
                  <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Insert Signature
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
