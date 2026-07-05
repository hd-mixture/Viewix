import * as pdfjsLib from "pdfjs-dist"

// Configure the worker for Vite
// In a real app we might want to copy this to public folder, but for now we try URL resolving
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`

export const loadPdfDocument = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  return await loadingTask.promise
}
