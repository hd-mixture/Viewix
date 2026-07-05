import { PDFDocument, rgb } from 'pdf-lib'
import type { Annotation } from '@/store/useWorkspaceStore'

export const exportPdfWithAnnotations = async (originalFile: File, annotations: Annotation[]) => {
  const arrayBuffer = await originalFile.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  
  const pages = pdfDoc.getPages()

  for (const ann of annotations) {
    const page = pages[ann.pageNumber - 1]
    if (!page) continue

    const { height } = page.getSize()

    // pdf-lib's y coordinate starts from bottom, while our Konva y starts from top
    const y = height - ann.y

    if (ann.type === 'rectangle') {
      page.drawRectangle({
        x: ann.x,
        y: y - (ann.height || 0),
        width: ann.width || 0,
        height: ann.height || 0,
        borderColor: rgb(0.2, 0.5, 1),
        borderWidth: ann.strokeWidth,
      })
    } else if (ann.type === 'oval') {
      page.drawEllipse({
        x: ann.x + (ann.width || 0) / 2,
        y: y - (ann.height || 0) / 2,
        xScale: Math.abs((ann.width || 0) / 2),
        yScale: Math.abs((ann.height || 0) / 2),
        borderColor: rgb(0.2, 0.5, 1),
        borderWidth: ann.strokeWidth,
      })
    }
    // Note: PDF-lib has limited support for complex freehand drawing and highlights natively without raw PDF operators.
    // For a production app, we would often convert Konva canvas to an image and stamp it onto the PDF.
    // This is an MVP implementation for basic shapes.
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `viewix-annotated-${originalFile.name}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
