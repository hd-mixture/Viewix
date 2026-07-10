import { create } from "zustand"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { savePdfToDB } from "@/lib/db"

export type Tool = "pointer" | "hand" | "text" | "rectangle" | "oval" | "arrow" | "cloud" | "highlight" | "freedraw" | "line" | "eraser" | "eraser_stroke" | "sticky_note" | "signature"

export interface Template {
  id: string
  title: string
  category: string
  isPro?: boolean
  thumbnail: string
  description: string
  orientation?: "portrait" | "landscape"
  annotations?: Partial<Annotation>[]
}

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
  cloudShape?: "rectangle" | "circle"
  
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
  cloud: { color: "#8b5cf6", fillColor: "transparent", strokeWidth: 2, density: 3, cloudShape: "rectangle", opacity: 1, shadow: false },
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
  
  showAdvancedProperties: boolean
  setShowAdvancedProperties: (show: boolean) => void
  
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
  
  activeDashboardTab: string
  setActiveDashboardTab: (tab: string) => void
  openedFromDashboard: boolean
  setOpenedFromDashboard: (val: boolean) => void
  isFullscreen: boolean
  toggleFullscreen: () => void

  isOffline: boolean
  setIsOffline: (val: boolean) => void
  isOfflineOverlayVisible: boolean
  setIsOfflineOverlayVisible: (val: boolean) => void
  isSearchFocused: boolean
  setIsSearchFocused: (val: boolean) => void
  searchMode: "tools" | "document"
  setSearchMode: (mode: "tools" | "document") => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchHistory: string[]
  addSearchHistory: (query: string) => void

  // Templates
  favoriteTemplates: string[]
  recentTemplates: Template[]
  myTemplates: Template[]
  toggleFavoriteTemplate: (id: string) => void
  addRecentTemplate: (template: Template) => void
  saveCurrentToRecent: (title: string, newAnnotations?: Annotation[]) => void
  duplicateTemplate: (template: Template) => void
  deleteMyTemplate: (id: string) => void
  
  activeTemplateId: string | null
  setActiveTemplateId: (id: string | null) => void
  
  isSaving: boolean
  setIsSaving: (val: boolean) => void
}

const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pdfFile: null,
  pdfDocument: null,
  numPages: 0,
  currentPage: 1,
  zoom: 1,
  rotation: 0,
  
  isSaving: false,
  setIsSaving: (val) => set({ isSaving: val }),
  
  selectedPages: [],
  lastSelectedPage: null,
  isOrganizeMode: false,
  
  showAdvancedProperties: false,
  setShowAdvancedProperties: (show) => set({ showAdvancedProperties: show }),
  
  activeTool: "pointer",
  annotations: [],
  pastAnnotations: [],
  futureAnnotations: [],
  selectedAnnotationId: null,
  
  activeSidebarTab: "workspace",
  activeDashboardTab: "home",
  openedFromDashboard: false,
  activeTemplateId: null,
  setActiveTemplateId: (id) => set({ activeTemplateId: id }),
  isFullscreen: false,
  
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  setIsOffline: (val) => set({ isOffline: val }),
  isOfflineOverlayVisible: false,
  setIsOfflineOverlayVisible: (val) => set({ isOfflineOverlayVisible: val }),
  
  isSearchFocused: false,
  searchMode: "tools",
  searchQuery: "",
  searchHistory: [],
  setIsSearchFocused: (val) => set({ isSearchFocused: val }),
  setSearchMode: (mode) => set({ searchMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addSearchHistory: (query) => set((state) => {
    if (!query.trim()) return state
    const newHistory = [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 5)
    return { searchHistory: newHistory }
  }),
  setOpenedFromDashboard: (val) => set({ openedFromDashboard: val }),
  setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),
  
  favoriteTemplates: loadFromStorage('viewix_fav_templates', []),
  recentTemplates: loadFromStorage('viewix_recent_templates', []),
  myTemplates: loadFromStorage('viewix_my_templates', []),
  toggleFavoriteTemplate: (id) => set((state) => {
    const newFavs = state.favoriteTemplates.includes(id) 
      ? state.favoriteTemplates.filter(t => t !== id) 
      : [...state.favoriteTemplates, id]
    if (typeof window !== 'undefined') localStorage.setItem('viewix_fav_templates', JSON.stringify(newFavs))
    return { favoriteTemplates: newFavs }
  }),
  addRecentTemplate: (template) => set((state) => {
    const filtered = state.recentTemplates.filter(t => t.id !== template.id)
    const newRecents = [template, ...filtered].slice(0, 10)
    if (typeof window !== 'undefined') localStorage.setItem('viewix_recent_templates', JSON.stringify(newRecents))
    return { recentTemplates: newRecents }
  }),
  saveCurrentToRecent: (title, newAnnotations) => set((state) => {
    if (!state.openedFromDashboard) return state;
    const anns = newAnnotations || state.annotations
    const template: Template = {
      id: `recent-${title.replace(/\s+/g, '_')}`,
      title: title || "Untitled Document",
      category: "Recent",
      thumbnail: "/templates/modern_invoice.png",
      annotations: anns,
      orientation: state.numPages > 0 && state.pdfDocument ? "portrait" : "portrait"
    }
    const filtered = state.recentTemplates.filter(t => t.title !== template.title)
    const newRecents = [template, ...filtered].slice(0, 10)
    if (typeof window !== 'undefined') localStorage.setItem('viewix_recent_templates', JSON.stringify(newRecents))
    
    // Also update myTemplates if this is a copy
    let newMyTemplates = state.myTemplates;
    if (state.activeTemplateId && state.activeTemplateId.startsWith('copy-')) {
      newMyTemplates = state.myTemplates.map(t => 
        t.id === state.activeTemplateId 
          ? { ...t, annotations: anns, title: title || t.title } 
          : t
      );
      if (typeof window !== 'undefined') localStorage.setItem('viewix_my_templates', JSON.stringify(newMyTemplates))
    }
    
    return { recentTemplates: newRecents, myTemplates: newMyTemplates }
  }),
  duplicateTemplate: (template) => set((state) => {
    const newTemplate = { ...template, id: `copy-${Date.now()}`, title: `${template.title} (Copy)` }
    const newMyTemplates = [...state.myTemplates, newTemplate]
    if (typeof window !== 'undefined') localStorage.setItem('viewix_my_templates', JSON.stringify(newMyTemplates))
    
    const newRecents = [newTemplate, ...state.recentTemplates.filter(t => t.id !== newTemplate.id)].slice(0, 10)
    if (typeof window !== 'undefined') localStorage.setItem('viewix_recent_templates', JSON.stringify(newRecents))
    
    return { myTemplates: newMyTemplates, recentTemplates: newRecents }
  }),
  deleteMyTemplate: (id) => set((state) => {
    const newMyTemplates = state.myTemplates.filter(t => t.id !== id)
    if (typeof window !== 'undefined') localStorage.setItem('viewix_my_templates', JSON.stringify(newMyTemplates))
    return { myTemplates: newMyTemplates }
  }),
  toggleFullscreen: () => {
    const isFull = !get().isFullscreen
    if (isFull) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error("Error attempting to exit fullscreen:", err)
        })
      }
    }
    set({ isFullscreen: isFull })
  },

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
    let savedAnnotations: Annotation[] = []
    if (file && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`viewix_annotations_${file.name}`)
        if (stored) savedAnnotations = JSON.parse(stored)
      } catch (e) {}
    }
    set({ 
      pdfFile: file, 
      hasShownHighlightWarning: false,
      annotations: savedAnnotations,
      pastAnnotations: [],
      futureAnnotations: [],
      historyLog: []
    })
    // Save the actual file blob to IndexedDB for the recent files feature
    if (file) savePdfToDB(file.name, file)
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
  setNumPages: (num) => set({ numPages: num }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setZoom: (zoom) => set({ zoom }),
  setRotation: (rotation) => set({ rotation }),
  setActiveTool: (tool) => {
    set({ activeTool: tool, showAdvancedProperties: false })
  },
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  
  setSelectedPages: (pages) => set({ selectedPages: pages }),
  setLastSelectedPage: (page) => set({ lastSelectedPage: page }),
  setIsOrganizeMode: (val) => set({ isOrganizeMode: val, showAdvancedProperties: false }),
  
  addAnnotation: (annotation) => set((state) => {
    const next = [...state.annotations, annotation]
    
    // Save to recent if it's a template edit
    if (state.openedFromDashboard && typeof window !== 'undefined') {
      get().saveCurrentToRecent(state.pdfFile?.name || "Untitled Document")
    }
    
    return {
      annotations: next,
      pastAnnotations: [...state.pastAnnotations, state.annotations].slice(-50),
      futureAnnotations: [],
      historyLog: [...state.historyLog, "annotation"]
    }
  }),
  updateAnnotation: (id, updates) => set((state) => {
    const next = state.annotations.map(a => a.id === id ? { ...a, ...updates } : a)
    
    // Save to recent if it's a template edit
    if (state.openedFromDashboard && typeof window !== 'undefined') {
      get().saveCurrentToRecent(state.pdfFile?.name || "Untitled Document")
    }

    return {
      annotations: next,
      pastAnnotations: [...state.pastAnnotations, state.annotations].slice(-50),
      futureAnnotations: [],
      historyLog: [...state.historyLog, "annotation"]
    }
  }),
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
  resetWorkspace: () => {
    localStorage.removeItem('viewix_last_active_file')
    set({ 
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
      futureAnnotations: [],
      openedFromDashboard: false
    })
  },
}))

if (typeof window !== 'undefined') {
  let saveTimeout: any;
  useWorkspaceStore.subscribe((state, prevState) => {
    if (state.annotations !== prevState.annotations && state.pdfFile) {
      // 1. Immediately update localStorage for general files
      localStorage.setItem(`viewix_annotations_${state.pdfFile.name}`, JSON.stringify(state.annotations))
      
      // 2. Set saving state and update recent templates if needed
      useWorkspaceStore.getState().setIsSaving(true)
      
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        if (state.openedFromDashboard) {
           useWorkspaceStore.getState().saveCurrentToRecent(state.pdfFile!.name.replace('.pdf', ''), state.annotations)
        }
        useWorkspaceStore.getState().setIsSaving(false)
      }, 500)
    }
  })
}
