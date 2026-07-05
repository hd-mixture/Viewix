import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useToastStore } from "@/store/useToastStore"

export function useQuickActions() {
  const { annotations, pdfFile, setPdfFile, setAnnotations, clearAllAnnotations } = useWorkspaceStore()
  const { toast } = useToastStore()

  const exportAnnotationJSON = () => {
    try {
      if (annotations.length === 0) {
        toast({ title: "No annotations", description: "There are no annotations to export.", type: "error" })
        return
      }

      const data = {
        metadata: {
          documentName: pdfFile?.name || "Document",
          exportedAt: new Date().toISOString(),
          version: "1.0",
        },
        annotations,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${pdfFile?.name ? pdfFile.name.replace('.pdf', '') : 'Document'}_annotations.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({ title: "Export Successful", description: "Annotation file exported successfully.", type: "success" })
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export annotations.", type: "error" })
    }
  }

  const importAnnotationJSON = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string
          const parsed = JSON.parse(result)
          
          if (!parsed.annotations || !Array.isArray(parsed.annotations)) {
            throw new Error("Invalid format")
          }
          
          setAnnotations(parsed.annotations)
          toast({ title: "Import Successful", description: "Annotation file imported successfully.", type: "success" })
        } catch (error) {
          toast({ title: "Import Failed", description: "This annotation file is incompatible or corrupted.", type: "error" })
        }
      }
      reader.onerror = () => {
        toast({ title: "Import Failed", description: "Failed to read the file.", type: "error" })
      }
      reader.readAsText(file)
    }
    
    input.click()
  }

  const duplicateDocument = () => {
    try {
      if (!pdfFile) {
        toast({ title: "Error", description: "No document is currently open.", type: "error" })
        return
      }

      // Create a duplicate File object
      const nameParts = pdfFile.name.split('.')
      const ext = nameParts.pop()
      const newName = `${nameParts.join('.')} (Copy).${ext}`
      
      const duplicateFile = new File([pdfFile], newName, { type: pdfFile.type })
      
      // Update store with new file
      setPdfFile(duplicateFile)
      toast({ title: "Document Duplicated", description: "Document duplicated successfully.", type: "success" })
    } catch (error) {
      toast({ title: "Duplicate Failed", description: "Failed to duplicate document.", type: "error" })
    }
  }

  const clearAll = () => {
    if (annotations.length === 0) {
      toast({ title: "Already Clear", description: "There are no annotations to clear.", type: "info" })
      return
    }
    clearAllAnnotations()
    toast({ title: "Cleared", description: "All annotations cleared.", type: "success" })
  }

  return {
    exportAnnotationJSON,
    importAnnotationJSON,
    duplicateDocument,
    clearAll
  }
}
