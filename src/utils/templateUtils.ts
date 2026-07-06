import { PDFDocument, rgb } from 'pdf-lib'
import type { Template } from '@/store/useWorkspaceStore'

export async function createPdfFromTemplate(template: Template): Promise<File> {
  const pdfDoc = await PDFDocument.create()
  
  const isLandscape = template.orientation === 'landscape'
  const width = isLandscape ? 841.89 : 595.28
  const height = isLandscape ? 595.28 : 841.89
  
  const page = pdfDoc.addPage([width, height])

  // Return a completely blank PDF page as a canvas for our JSON annotations

  const pdfBytes = await pdfDoc.save()
  
  // Create a blob and then a file
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return new File([blob], `${template.title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' })
}
