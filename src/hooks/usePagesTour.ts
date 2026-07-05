import { create } from 'zustand'

interface TourState {
  isActive: boolean
  currentStep: number
  totalSteps: number
  dontShowAgain: boolean
  tourPermanentlyDone: boolean   // reactive flag to hide the "Organize Pages" card
  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  setDontShowAgain: (val: boolean) => void
}

const TOUR_DONE_KEY = 'viewix_tour_done'

export const usePagesTour = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: 7,
  dontShowAgain: localStorage.getItem(TOUR_DONE_KEY) === 'true',
  tourPermanentlyDone: localStorage.getItem(TOUR_DONE_KEY) === 'true',

  startTour: () => {
    set({ isActive: true, currentStep: 0 })
  },

  endTour: () => {
    const { dontShowAgain } = get()
    if (dontShowAgain) {
      localStorage.setItem(TOUR_DONE_KEY, 'true')
      set({ isActive: false, currentStep: 0, tourPermanentlyDone: true })
    } else {
      set({ isActive: false, currentStep: 0 })
    }
  },

  nextStep: () => {
    const { currentStep, totalSteps, endTour } = get()
    if (currentStep >= totalSteps - 1) {
      endTour()
    } else {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  skipTour: () => {
    const { dontShowAgain } = get()
    if (dontShowAgain) {
      localStorage.setItem(TOUR_DONE_KEY, 'true')
      set({ isActive: false, currentStep: 0, tourPermanentlyDone: true })
    } else {
      set({ isActive: false, currentStep: 0 })
    }
  },

  setDontShowAgain: (val: boolean) => {
    set({ dontShowAgain: val })
  },
}))
