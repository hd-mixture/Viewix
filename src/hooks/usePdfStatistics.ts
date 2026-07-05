import { useState, useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'

export interface PdfStats {
  words: number
  charactersWithSpaces: number
  charactersWithoutSpaces: number
  images: number
  tables: string
  textPages: number
  imagePages: number
  documentType: 'searchable' | 'scanned' | 'mixed'
}

export function usePdfStatistics(pdfDocument: PDFDocumentProxy | null) {
  const [stats, setStats] = useState<PdfStats | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Cache to prevent recalculating the same document multiple times
  const cacheRef = useRef<Record<string, PdfStats>>({})

  useEffect(() => {
    if (!pdfDocument) {
      setStats(null)
      return
    }

    const fingerprint = (pdfDocument as any).fingerprints?.[0] || 'default_fingerprint'

    if (cacheRef.current[fingerprint]) {
      setStats(cacheRef.current[fingerprint])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    const extractStats = async () => {
      try {
        let totalWords = 0
        let charWithSpaces = 0
        let charNoSpaces = 0
        let totalImages = 0

        let totalTextPages = 0
        let totalImagePages = 0

        for (let i = 1; i <= pdfDocument.numPages; i++) {
          if (!isMounted) return

          const page = await pdfDocument.getPage(i)
          
          // 1. Extract Text
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str).join(' ')
          
          charWithSpaces += pageText.length
          const pageCharNoSpaces = pageText.replace(/\s+/g, '').length
          charNoSpaces += pageCharNoSpaces
          
          const wordsMatch = pageText.match(/\S+/g)
          if (wordsMatch) {
            totalWords += wordsMatch.length
          }

          // 2. Extract Images (by parsing operator list)
          let pageHasImages = false
          const opList = await page.getOperatorList()
          for (let j = 0; j < opList.fnArray.length; j++) {
            const fn = opList.fnArray[j]
            if (
              fn === pdfjsLib.OPS.paintImageXObject || 
              fn === pdfjsLib.OPS.paintInlineImageXObject || 
              fn === pdfjsLib.OPS.paintJpegXObject
            ) {
              totalImages++
              pageHasImages = true
            }
          }
          
          // Heuristic Page Classification
          if (pageCharNoSpaces > 50) {
            totalTextPages++
          } else if (pageHasImages) {
            totalImagePages++
          }
          
          // Yield to main thread briefly so UI doesn't freeze entirely on massive PDFs
          await new Promise(r => setTimeout(r, 0))
        }

        if (isMounted) {
          let docType: 'searchable' | 'scanned' | 'mixed' = 'mixed'
          if (pdfDocument.numPages > 0) {
            if (totalTextPages >= pdfDocument.numPages * 0.8) {
              docType = 'searchable'
            } else if (totalImagePages >= pdfDocument.numPages * 0.8) {
              docType = 'scanned'
            }
          }

          const finalStats: PdfStats = {
            words: totalWords,
            charactersWithSpaces: charWithSpaces,
            charactersWithoutSpaces: charNoSpaces,
            images: totalImages,
            tables: '—', // Tables are technically impossible to detect without heuristics in raw PDF
            textPages: totalTextPages,
            imagePages: totalImagePages,
            documentType: docType
          }
          
          cacheRef.current[fingerprint] = finalStats
          setStats(finalStats)
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to extract PDF stats", err)
        if (isMounted) {
          const fallback: PdfStats = { 
            words: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0, images: 0, tables: '—',
            textPages: 0, imagePages: 0, documentType: 'mixed'
          }
          setStats(fallback)
          setLoading(false)
        }
      }
    }

    extractStats()

    return () => {
      isMounted = false
    }
  }, [pdfDocument])

  return { stats, loading }
}
