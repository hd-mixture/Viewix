import { create } from "zustand"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  toast: (options: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (options) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...options, id }]
    }))
    
    // Auto dismiss
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 4000)
  },
  dismiss: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}))
