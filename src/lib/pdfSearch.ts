import type { PDFDocumentProxy } from "pdfjs-dist"

export interface PdfSearchResult {
  pageNumber: number
  snippet: string
  matchIndex: number
}

export async function searchPdfText(pdfDocument: PDFDocumentProxy, query: string): Promise<PdfSearchResult[]> {
  if (!query.trim() || !pdfDocument) return []
  
  const results: PdfSearchResult[] = []
  const lowerQuery = query.toLowerCase()

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    try {
      const page = await pdfDocument.getPage(i)
      const textContent = await page.getTextContent()
      
      const fullText = textContent.items.map((item: any) => item.str).join(" ")
      const lowerText = fullText.toLowerCase()
      
      const matchIndex = lowerText.indexOf(lowerQuery)
      
      if (matchIndex !== -1) {
        // Extract a snippet of text around the match
        const start = Math.max(0, matchIndex - 40)
        const end = Math.min(fullText.length, matchIndex + query.length + 40)
        
        let snippet = fullText.substring(start, end)
        if (start > 0) snippet = "..." + snippet
        if (end < fullText.length) snippet = snippet + "..."
        
        results.push({
          pageNumber: i,
          snippet,
          matchIndex
        })
      }
    } catch (err) {
      console.warn(`Failed to search page ${i}`, err)
    }
  }

  return results
}
