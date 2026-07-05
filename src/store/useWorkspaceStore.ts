import { create } from "zustand"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { savePdfToDB } from "@/lib/db"

export type Tool = "pointer" | "hand" | "text" | "rectangle" | "oval" | "arrow" | "cloud" | "highlight" | "freedraw" | "line" | "eraser" | "eraser_stroke" | "sticky_note" | "signature"

export interface Annotation {
  id: string
  pageNumber: number
  type: Tool
  x: number
  y: number
  width?: number
  height?: number
  points?: number[] 
  rects?: {x: number, y: number, width: number, height: number}[]
  
  // Base styles
  color: string
  opacity: number
  
  // Stroke & Fill
  strokeWidth?: number
  fillColor?: string
  borderStyle?: "solid" | "dashed" | "dotted"
  cornerRadius?: number
  shadow?: boolean
  
  // Text & Typography
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline" | "line-through"
  textAlign?: "left" | "center" | "right"
  backgroundColor?: string
  
  // Highlight
  blendMode?: "multiply" | "normal" | "screen"
  
  // Arrow / Line
  arrowHead?: "none" | "arrow" | "triangle" | "circle" | "square"
  dashStyle?: "solid" | "dashed" | "dotted"
  
  // Cloud
  density?: number
  
  // Sticky Note
  author?: string
  timestamp?: number
  
  // Signature
  signatureType?: "draw" | "type" | "upload"
  signatureDataUrl?: string
  
  // Layering & State
  zIndex?: number
  locked?: boolean
  hidden?: boolean
  isEditing?: boolean
  rotation?: number
}

export type ToolDefaults = Record<Tool, Partial<Annotation>>

const defaultToolSettings: ToolDefaults = {
  pointer: {},
  hand: {},
  eraser: {},
  text: { color: "#000000", fontSize: 16, fontFamily: "Inter", fontWeight: "normal", fontStyle: "normal", textDecoration: "none", textAlign: "left", opacity: 1 },
  rectangle: { color: "#3b82f6", fillColor: "transparent", strokeWidth: 2, borderStyle: "solid", cornerRadius: 0, opacity: 1, shadow: false },
  oval: { color: "#ef4444", fillColor: "transparent", strokeWidth: 2, borderStyle: "solid", opacity: 1, shadow: false },
  arrow: { color: "#22c55e", strokeWidth: 2, arrowHead: "arrow", dashStyle: "solid", opacity: 1 },
  cloud: { color: "#8b5cf6", fillColor: "transparent", strokeWidth: 2, density: 3, opacity: 1, shadow: false },
  highlight: { color: "#fef08a", opacity: 0.5, blendMode: "multiply" },
  freedraw: { color: "#000000", strokeWidth: 2, opacity: 1 },
  line: { color: "#64748b", strokeWidth: 2, dashStyle: "solid", opacity: 1 },
  sticky_note: { color: "#fef08a", opacity: 1, author: "User" },
  signature: { color: "#000000", strokeWidth: 2, opacity: 1 }
}

interface WorkspaceState {
  pdfFile: File | null
  pdfDocument: PDFDocumentProxy | null
  numPages: number
  currentPage: number
  zoom: number
  rotation: number
  
  selectedPages: number[]
  lastSelectedPage: number | null
  isOrganizeMode: boolean
  
  activeTool: Tool
  annotations: Annotation[]
  pastAnnotations: Annotation[][]
  futureAnnotations: Annotation[][]
  selectedAnnotationId: string | null
  
  activeSidebarTab: "workspace" | "pages" | "bookmarks" | "comments" | "outline" | "history" | null
  
  toolDefaults: ToolDefaults
  updateToolDefault: (tool: Tool, updates: Partial<Annotation>) => void
  
  historyLog: ("annotation" | "document" | "full_state")[]
  pastDocuments: { file: File, doc: PDFDocumentProxy }[]
  futureDocuments: { file: File, doc: PDFDocumentProxy }[]
  
  pushDocumentToHistory: () => void
  pushFullStateToHistory: () => void
  isSignatureModalOpen: boolean
  setSignatureModalOpen: (isOpen: boolean) => void
  pendingSignaturePosition: { x: number, y: number, width?: number, height?: number, pageNumber: number } | null
  setPendingSignaturePosition: (pos: { x: number, y: number, width?: number, height?: number, pageNumber: number } | null) => void
  savedSignatures: string[]
  saveSignature: (dataUrl: string) => void
  deleteSavedSignature: (index: number) => void
  
  // Actions
  setPdfFile: (file: File | null) => void
  setPdfDocument: (doc: PDFDocumentProxy | null) => void
  setNumPages: (num: number) => void
  setCurrentPage: (page: number) => void
  setZoom: (zoom: number) => void
  setRotation: (rotation: number) => void
  setActiveTool: (tool: Tool) => void
  setActiveSidebarTab: (tab: "workspace" | "pages" | "bookmarks" | "comments" | "outline" | "history" | null) => void
  
  setSelectedPages: (pages: number[]) => void
  setLastSelectedPage: (page: number | null) => void
  setIsOrganizeMode: (val: boolean) => void
  
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
  duplicateAnnotation: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  lockAnnotation: (id: string) => void
  toggleVisibility: (id: string) => void
  duplicatePageAnnotations: (pageNumber: number) => void
  reorderPageAnnotations: (newOrder: number[]) => void
  deletePageAnnotations: (pagesToDelete: number[]) => void
  rotatePageAnnotations: (pagesToRotate: number[], angle: 90 | -90 | 180, preRotationDimensions: Record<number, { width: number, height: number }>) => void
  clearAllAnnotations: () => void
  setAnnotations: (annotations: Annotation[]) => void
  undo: () => void
  redo: () => void
  
  setSelectedAnnotationId: (id: string | null) => void
  resetWorkspace: () => void

  toastMessage: { 
    title: string, 
    message: string, 
    duration?: number,
    action?: { label: string, onClick: () => void }
  } | null
  showToast: (
    title: string, 
    message: string, 
    duration?: number,
    action?: { label: string, onClick: () => void }
  ) => void
  hideToast: () => void

  hasShownHighlightWarning: boolean
  setHasShownHighlightWarning: (val: boolean) => void

  eraserSettings: {
    mode: 'click' | 'drag'
    eraseLocked: boolean
    highlightFirst: boolean
    brushSize: number
  }
  setEraserSettings: (settings: Partial<{ mode: 'click' | 'drag', eraseLocked: boolean, highlightFirst: boolean, brushSize: number }>) => void
  deleteAnnotations: (ids: string[]) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pdfFile: null,
  pdfDocument: null,
  numPages: 0,
  currentPage: 1,
  zoom: 1,
  rotation: 0,
  
  selectedPages: [],
  lastSelectedPage: null,
  isOrganizeMode: false,
  
  activeTool: "pointer",
  annotations: [],
  pastAnnotations: [],
  futureAnnotations: [],
  selectedAnnotationId: null,
  
  activeSidebarTab: "workspace",

  toastMessage: null,
  showToast: (title, message, duration, action) => {
    set({ toastMessage: { title, message, duration, action } })
  },
  hideToast: () => set({ toastMessage: null }),

  hasShownHighlightWarning: false,
  setHasShownHighlightWarning: (val) => set({ hasShownHighlightWarning: val }),

  eraserSettings: {
    mode: 'click',
    eraseLocked: false,
    highlightFirst: true,
    brushSize: 24
  },
  setEraserSettings: (settings) => set((state) => ({
    eraserSettings: { ...state.eraserSettings, ...settings }
  })),
  
  toolDefaults: defaultToolSettings,
  updateToolDefault: (tool, updates) => set((state) => ({
    toolDefaults: {
      ...state.toolDefaults,
      [tool]: { ...state.toolDefaults[tool], ...updates }
    }
  })),

  historyLog: [],
  pastDocuments: [],
  futureDocuments: [],
  
  isSignatureModalOpen: false,
  pendingSignaturePosition: null,
  savedSignatures: JSON.parse(localStorage.getItem('viewix-signatures') || '[]'),
  
  setSignatureModalOpen: (isOpen) => set({ isSignatureModalOpen: isOpen }),
  setPendingSignaturePosition: (pos) => set({ pendingSignaturePosition: pos }),
  saveSignature: (dataUrl) => set((state) => {
    const newSaved = [dataUrl, ...state.savedSignatures]
    localStorage.setItem('viewix-signatures', JSON.stringify(newSaved))
    return { savedSignatures: newSaved }
  }),
  deleteSavedSignature: (index) => set((state) => {
    const newSaved = [...state.savedSignatures]
    newSaved.splice(index, 1)
    localStorage.setItem('viewix-signatures', JSON.stringify(newSaved))
    return { savedSignatures: newSaved }
  }),
  
  setPdfFile: (file) => {
    set({ pdfFile: file, hasShownHighlightWarning: false })
    // Save the actual file blob to IndexedDB for the recent files feature
    savePdfToDB(file.name, file)
  },
  setPdfDocument: (doc) => {
    set({ pdfDocument: doc, numPages: doc.numPages })
    // Automatically save to recent files once document is loaded
    const state = get()
    if (state.pdfFile) {
       const newRecent = {
         name: state.pdfFile.name,
         size: state.pdfFile.size,
         pages: doc.numPages,
         timestamp: Date.now()
       }
       const stored = JSON.parse(localStorage.getItem('viewix_recent') || '[]')
       const updated = [newRecent, ...stored.filter((f: any) => f.name !== state.pdfFile!.name)].slice(0, 10)
       localStorage.setItem('viewix_recent', JSON.stringify(updated))
    }
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  setZoom: (zoom) => set({ zoom }),
  setRotation: (rotation) => set({ rotation }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  
  setSelectedPages: (pages) => set({ selectedPages: pages }),
  setLastSelectedPage: (page) => set({ lastSelectedPage: page }),
  setIsOrganizeMode: (val) => set({ isOrganizeMode: val }),
  
  addAnnotation: (annotation) => set((state) => ({ 
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: [...state.annotations, annotation] 
  })),
  updateAnnotation: (id, updates) => set((state) => ({
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: state.annotations.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  deleteAnnotation: (id) => set((state) => ({
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: state.annotations.filter(a => a.id !== id),
    selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId
  })),
  deleteAnnotations: (ids) => set((state) => {
    if (ids.length === 0) return state
    return {
      pastAnnotations: [...state.pastAnnotations, state.annotations],
      futureAnnotations: [],
      historyLog: [...state.historyLog, "annotation"],
      annotations: state.annotations.filter(a => !ids.includes(a.id)),
      selectedAnnotationId: ids.includes(state.selectedAnnotationId || "") ? null : state.selectedAnnotationId
    }
  }),
  duplicateAnnotation: (id) => {
    const state = get()
    const target = state.annotations.find(a => a.id === id)
    if (!target) return
    const duplicate: Annotation = {
      ...target,
      id: Math.random().toString(36).substr(2, 9),
      x: target.x + 20, 
      y: target.y + 20,
    }
    set({ 
      pastAnnotations: [...state.pastAnnotations, state.annotations],
      futureAnnotations: [],
      historyLog: [...state.historyLog, "annotation"],
      annotations: [...state.annotations, duplicate],
      selectedAnnotationId: duplicate.id 
    })
  },
  bringForward: (id) => set((state) => {
    const annIdx = state.annotations.findIndex(a => a.id === id)
    if (annIdx === -1) return state
    const newAnnotations = [...state.annotations]
    const ann = newAnnotations[annIdx]
    const targetIdx = newAnnotations.findIndex((a, idx) => idx > annIdx && a.pageNumber === ann.pageNumber)
    if (targetIdx !== -1) {
      newAnnotations[annIdx] = newAnnotations[targetIdx]
      newAnnotations[targetIdx] = ann
      return {
        pastAnnotations: [...state.pastAnnotations, state.annotations],
        futureAnnotations: [],
        historyLog: [...state.historyLog, "annotation"],
        annotations: newAnnotations
      }
    }
    return state
  }),
  sendBackward: (id) => set((state) => {
    const annIdx = state.annotations.findIndex(a => a.id === id)
    if (annIdx === -1) return state
    const newAnnotations = [...state.annotations]
    const ann = newAnnotations[annIdx]
    // Find the last annotation on the same page that is before the current one
    let targetIdx = -1
    for (let i = annIdx - 1; i >= 0; i--) {
      if (newAnnotations[i].pageNumber === ann.pageNumber) {
        targetIdx = i
        break
      }
    }
    if (targetIdx !== -1) {
      newAnnotations[annIdx] = newAnnotations[targetIdx]
      newAnnotations[targetIdx] = ann
      return {
        pastAnnotations: [...state.pastAnnotations, state.annotations],
        futureAnnotations: [],
        historyLog: [...state.historyLog, "annotation"],
        annotations: newAnnotations
      }
    }
    return state
  }),
  lockAnnotation: (id) => set((state) => ({
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: state.annotations.map(a => a.id === id ? { ...a, locked: !a.locked } : a)
  })),
  toggleVisibility: (id) => set((state) => ({
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: state.annotations.map(a => a.id === id ? { ...a, hidden: !a.hidden } : a),
    selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId // Deselect if hidden
  })),
  duplicatePageAnnotations: (pageNumber) => set((state) => {
    const prior = state.annotations.filter(a => a.pageNumber < pageNumber)
    const current = state.annotations.filter(a => a.pageNumber === pageNumber)
    const subsequent = state.annotations.filter(a => a.pageNumber > pageNumber).map(a => ({ ...a, pageNumber: a.pageNumber + 1 }))
    
    const clonedCurrent = current.map(a => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      pageNumber: pageNumber + 1
    }))
    
    return {
      annotations: [...prior, ...current, ...clonedCurrent, ...subsequent],
      selectedAnnotationId: null
    }
  }),
  reorderPageAnnotations: (newOrder: number[]) => set((state) => {
    // newOrder[i] is the OLD page number that should now be at position i + 1
    const reorderedAnnotations = state.annotations.map(a => {
      const newIndex = newOrder.indexOf(a.pageNumber)
      if (newIndex !== -1) {
        return { ...a, pageNumber: newIndex + 1 }
      }
      return a // Fallback (shouldn't happen if newOrder contains all pages)
    })
    
    return {
      annotations: reorderedAnnotations,
      selectedAnnotationId: null
    }
  }),
  deletePageAnnotations: (pagesToDelete: number[]) => set((state) => {
    // Sort descending
    const sorted = [...pagesToDelete].sort((a, b) => b - a)
    let newAnns = [...state.annotations].filter(a => !pagesToDelete.includes(a.pageNumber))
    
    // Shift remaining annotations down
    for (const deletedPage of sorted) {
      newAnns = newAnns.map(a => {
        if (a.pageNumber > deletedPage) {
          return { ...a, pageNumber: a.pageNumber - 1 }
        }
        return a
      })
    }
    return { annotations: newAnns, selectedAnnotationId: null }
  }),
  rotatePageAnnotations: (pagesToRotate, angle, preRotationDimensions) => {
    set((state) => {
      const updatedAnnotations = state.annotations.map(ann => {
        if (!pagesToRotate.includes(ann.pageNumber)) return ann;
        
        const dim = preRotationDimensions[ann.pageNumber];
        if (!dim) return ann;
        
        const W = dim.width;
        const H = dim.height;
        let newX = ann.x;
        let newY = ann.y;
        let newW = ann.width;
        let newH = ann.height;
        let newPoints = ann.points ? [...ann.points] : undefined;

        if (angle === 90) {
          if (ann.type === 'rectangle' || ann.type === 'oval') {
            newX = H - ann.y - (ann.height || 0);
            newY = ann.x;
            newW = ann.height;
            newH = ann.width;
          } else {
            newX = H - ann.y;
            newY = ann.x;
            if (newPoints) {
              for (let i = 0; i < newPoints.length; i += 2) {
                const px = newPoints[i];
                const py = newPoints[i+1];
                newPoints[i] = H - py;
                newPoints[i+1] = px;
              }
            }
          }
        } else if (angle === -90) {
          if (ann.type === 'rectangle' || ann.type === 'oval') {
            newX = ann.y;
            newY = W - ann.x - (ann.width || 0);
            newW = ann.height;
            newH = ann.width;
          } else {
            newX = ann.y;
            newY = W - ann.x;
            if (newPoints) {
              for (let i = 0; i < newPoints.length; i += 2) {
                const px = newPoints[i];
                const py = newPoints[i+1];
                newPoints[i] = py;
                newPoints[i+1] = W - px;
              }
            }
          }
        } else if (angle === 180) {
          if (ann.type === 'rectangle' || ann.type === 'oval') {
            newX = W - ann.x - (ann.width || 0);
            newY = H - ann.y - (ann.height || 0);
          } else {
            newX = W - ann.x;
            newY = H - ann.y;
            if (newPoints) {
              for (let i = 0; i < newPoints.length; i += 2) {
                const px = newPoints[i];
                const py = newPoints[i+1];
                newPoints[i] = W - px;
                newPoints[i+1] = H - py;
              }
            }
          }
        }

        return {
          ...ann,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
          points: newPoints
        };
      });
      return { annotations: updatedAnnotations };
    });
  },
  clearAllAnnotations: () => set((state) => {
    if (state.annotations.length === 0) return state;
    return {
      pastAnnotations: [...state.pastAnnotations, state.annotations],
      futureAnnotations: [],
      historyLog: [...state.historyLog, "annotation"],
      annotations: [],
      selectedAnnotationId: null
    }
  }),
  setAnnotations: (newAnnotations) => set((state) => ({
    pastAnnotations: [...state.pastAnnotations, state.annotations],
    futureAnnotations: [],
    historyLog: [...state.historyLog, "annotation"],
    annotations: newAnnotations,
    selectedAnnotationId: null
  })),
  pushDocumentToHistory: () => set((state) => {
    if (!state.pdfFile || !state.pdfDocument) return state
    return {
      pastDocuments: [...state.pastDocuments, { file: state.pdfFile, doc: state.pdfDocument }],
      futureDocuments: [],
      historyLog: [...state.historyLog, "document"]
    }
  }),
  pushFullStateToHistory: () => set((state) => {
    if (!state.pdfFile || !state.pdfDocument) return state
    return {
      pastDocuments: [...state.pastDocuments, { file: state.pdfFile, doc: state.pdfDocument }],
      futureDocuments: [],
      pastAnnotations: [...state.pastAnnotations, state.annotations],
      futureAnnotations: [],
      historyLog: [...state.historyLog, "full_state"]
    }
  }),
  undo: () => set((state) => {
    if (state.historyLog.length === 0) return state
    
    const lastAction = state.historyLog[state.historyLog.length - 1]
    const newLog = state.historyLog.slice(0, -1)
    
    if (lastAction === "annotation" && state.pastAnnotations.length > 0) {
      const previous = state.pastAnnotations[state.pastAnnotations.length - 1]
      const newPast = state.pastAnnotations.slice(0, -1)
      return {
        pastAnnotations: newPast,
        futureAnnotations: [state.annotations, ...state.futureAnnotations],
        historyLog: newLog,
        annotations: previous,
        selectedAnnotationId: null,
      }
    } else if (lastAction === "document" && state.pastDocuments.length > 0 && state.pdfFile && state.pdfDocument) {
      const previous = state.pastDocuments[state.pastDocuments.length - 1]
      const newPast = state.pastDocuments.slice(0, -1)
      return {
        pastDocuments: newPast,
        futureDocuments: [{ file: state.pdfFile, doc: state.pdfDocument }, ...state.futureDocuments],
        historyLog: newLog,
        pdfFile: previous.file,
        pdfDocument: previous.doc,
        numPages: previous.doc.numPages,
      }
    } else if (lastAction === "full_state" && state.pastDocuments.length > 0 && state.pastAnnotations.length > 0 && state.pdfFile && state.pdfDocument) {
      const prevDoc = state.pastDocuments[state.pastDocuments.length - 1]
      const newPastDocs = state.pastDocuments.slice(0, -1)
      const prevAnn = state.pastAnnotations[state.pastAnnotations.length - 1]
      const newPastAnns = state.pastAnnotations.slice(0, -1)
      return {
        pastDocuments: newPastDocs,
        futureDocuments: [{ file: state.pdfFile, doc: state.pdfDocument }, ...state.futureDocuments],
        pastAnnotations: newPastAnns,
        futureAnnotations: [state.annotations, ...state.futureAnnotations],
        historyLog: newLog,
        pdfFile: prevDoc.file,
        pdfDocument: prevDoc.doc,
        numPages: prevDoc.doc.numPages,
        annotations: prevAnn,
        selectedAnnotationId: null,
      }
    }
    return state
  }),
  redo: () => set((state) => {
    // Redo logic relies on having future states. We need to check if the next redo is a document or annotation.
    // For simplicity, we can just check which future stack has items if we want, but technically we need a futureLog.
    // To avoid over-engineering, if there's futureAnnotations, pop them first, then futureDocuments.
    // Actually, redo is less critical for document structure in this prototype, but we can implement basic redo.
    
    // Quick heuristic: since we didn't track futureLog, we can just prefer annotations.
    if (state.futureAnnotations.length > 0) {
      const next = state.futureAnnotations[0]
      const newFuture = state.futureAnnotations.slice(1)
      return {
        pastAnnotations: [...state.pastAnnotations, state.annotations],
        futureAnnotations: newFuture,
        historyLog: [...state.historyLog, "annotation"],
        annotations: next,
        selectedAnnotationId: null,
      }
    } else if (state.futureDocuments.length > 0 && state.pdfFile && state.pdfDocument) {
      const next = state.futureDocuments[0]
      const newFuture = state.futureDocuments.slice(1)
      return {
        pastDocuments: [...state.pastDocuments, { file: state.pdfFile, doc: state.pdfDocument }],
        futureDocuments: newFuture,
        historyLog: [...state.historyLog, "document"],
        pdfFile: next.file,
        pdfDocument: next.doc,
        numPages: next.doc.numPages,
      }
    }
    return state
  }),
  setSelectedAnnotationId: (id) => set({ selectedAnnotationId: id }),
  resetWorkspace: () => set({ 
    pdfFile: null, 
    pdfDocument: null, 
    numPages: 0, 
    currentPage: 1, 
    zoom: 1, 
    rotation: 0,
    selectedPages: [],
    lastSelectedPage: null,
    isOrganizeMode: false,
    activeTool: "pointer",
    annotations: [],
    selectedAnnotationId: null,
    historyLog: [],
    pastDocuments: [],
    futureDocuments: [],
    pastAnnotations: [],
    futureAnnotations: []
  }),
}))
