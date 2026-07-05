import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, CheckCircle2, MoreHorizontal } from 'lucide-react'
import { usePagesTour } from '@/hooks/usePagesTour'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Tour Step Definitions
// ─────────────────────────────────────────────
export interface TourStep {
  id: string
  targetId: string
  title: string
  description: React.ReactNode
  preferSide?: 'right' | 'left' | 'top' | 'bottom'
  onEnter?: () => void
  onLeave?: () => void
}

export const STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: 'tour-pages-panel',
    title: '📄 Welcome to Organize Pages',
    description: (
      <>
        Manage your document pages directly from this panel.<br /><br />
        You can <strong>reorder</strong>, <strong>duplicate</strong>, <strong>rotate</strong>, <strong>export</strong> and <strong>delete</strong> pages — all without leaving the main view.
      </>
    ),
    preferSide: 'right',
  },
  {
    id: 'drag-drop',
    targetId: 'tour-first-thumbnail',
    title: '🖱 Drag & Drop Pages',
    description: (
      <>
        Click and hold any page thumbnail, then <strong>drag it</strong> to a new position and release to reorder instantly.<br /><br />
        Multiple selected pages can also be moved together.
      </>
    ),
    preferSide: 'right',
  },
  {
    id: 'search',
    targetId: 'tour-search-pages',
    title: '🔍 Search Pages',
    description: (
      <>
        Quickly find pages inside large documents.<br /><br />
        Search by <strong>page number</strong> or label to jump directly to any page.
      </>
    ),
    preferSide: 'right',
  },
  {
    id: 'select-multiple',
    targetId: 'tour-first-two',
    title: '📄 Select Multiple Pages',
    description: (
      <>
        Hold <kbd className="tour-kbd">Ctrl</kbd> and click to select multiple individual pages.<br /><br />
        Hold <kbd className="tour-kbd">Shift</kbd> and click to select an entire range between two pages.
      </>
    ),
    preferSide: 'right',
    onEnter: () => {
      const state = useWorkspaceStore.getState()
      if (state.numPages >= 2) {
        state.setSelectedPages([1, 2])
      }
    },
    onLeave: () => {
      const state = useWorkspaceStore.getState()
      state.setSelectedPages(state.currentPage ? [state.currentPage] : [])
    }
  },
  {
    id: 'page-actions',
    targetId: 'tour-first-thumbnail',
    title: '⚡ Page Actions',
    description: (
      <>
        <strong>Right-click</strong> any page thumbnail to open this quick-action menu:<br /><br />
        <ul className="list-disc pl-4 space-y-1 mt-1">
          <li><strong>Duplicate</strong> — copy a page</li>
          <li><strong>Export</strong> — save as PDF or PNG</li>
          <li><strong>Rotate</strong> — turn the page</li>
          <li><strong>Delete</strong> — remove the page</li>
        </ul>
      </>
    ),
    preferSide: 'right',
  },
  {
    id: 'advanced-tools',
    targetId: 'tour-advanced-tools-group',
    title: '⚙ Advanced Tools',
    description: (
      <>
        More powerful tools are in the <strong>⋯ menu</strong>:<br /><br />
        <ul className="list-disc pl-4 space-y-1 mt-1">
          <li>Split Document</li>
          <li>Export Pages</li>
          <li>Rotate Pages</li>
          <li>Delete Pages</li>
        </ul>
      </>
    ),
    preferSide: 'right',
    onEnter: () => {
      setTimeout(() => {
        const group = document.getElementById('tour-advanced-tools-group')
        if (group) group.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 250)
    },
    onLeave: () => {
      window.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
  },
  {
    id: 'done',
    targetId: 'tour-organize-card',
    title: "✨ You're Ready!",
    description: (
      <>
        You now know how to organize pages inside Viewix.<br /><br />
        Everything works directly inside the <strong>Pages panel</strong>. No separate organizer needed.
      </>
    ),
    preferSide: 'top',
  }
]

export const getActiveTourSteps = (numPages: number) => {
  return STEPS.filter(step => {
    if (step.id === 'select-multiple' && numPages <= 1) return false
    return true
  })
}

// ─────────────────────────────────────────────
// Tour Spotlight Component — measures and tracks target element
// KEY FIX: returns null until measurement is complete to prevent
//          the tooltip from snapping to a wrong/fallback position
// ─────────────────────────────────────────────
function useSpotlightRect(targetId: string, isActive: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [dynamicTarget, setDynamicTarget] = useState<string>(targetId)

  // Dynamic Target Orchestration
  useEffect(() => {
    if (targetId === 'tour-advanced-tools-group') {
      // Stage 1: Flashlight turns on at the ... button
      setDynamicTarget('tour-more-menu-btn')
      
      // Stage 2: Expand to reveal the entire popup menu
      const t1 = setTimeout(() => {
        setDynamicTarget('tour-more-menu-popup')
      }, 150)
      
      // Stage 3: Smoothly shrink and scroll down to the specific tools
      const t2 = setTimeout(() => {
        setDynamicTarget('tour-advanced-tools-group')
      }, 350)
      
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    } else {
      setDynamicTarget(targetId)
    }
  }, [targetId])

  // Continuous Buttery Smooth Tracking
  useEffect(() => {
    if (!isActive || !dynamicTarget) {
      setRect(null)
      return
    }

    let rafId: number
    const track = () => {
      if (dynamicTarget === 'tour-first-two') {
        const r1 = document.getElementById('tour-first-thumbnail')?.getBoundingClientRect()
        const r2 = document.getElementById('tour-second-thumbnail')?.getBoundingClientRect()
        const r3 = document.getElementById('tour-bulk-action-bar')?.getBoundingClientRect()
        
        if (r1 && r2) {
          let top = Math.min(r1.top, r2.top)
          let bottom = Math.max(r1.bottom, r2.bottom)
          let left = Math.min(r1.left, r2.left)
          let right = Math.max(r1.right, r2.right)
          
          if (r3) {
            top = Math.min(top, r3.top - 8)
            bottom = Math.max(bottom, r3.bottom)
            left = Math.min(left, r3.left)
            right = Math.max(right, r3.right)
          }

          setRect({
            top, left, bottom, right,
            width: right - left,
            height: bottom - top,
            x: left, y: top,
            toJSON: () => {}
          } as DOMRect)
        } else {
           const fallback = document.getElementById('tour-first-thumbnail')
           if (fallback) setRect(fallback.getBoundingClientRect())
        }
      } else {
        const fresh = document.getElementById(dynamicTarget)
        if (fresh) setRect(fresh.getBoundingClientRect())
      }

      rafId = requestAnimationFrame(track)
    }

    rafId = requestAnimationFrame(track)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, dynamicTarget, targetId])

  // Initial Auto-Scroll
  useEffect(() => {
    if (!isActive || !targetId) return
    if (targetId === 'tour-first-two') {
      const el1 = document.getElementById('tour-first-thumbnail')
      if (el1) el1.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    } else if (targetId !== 'tour-advanced-tools-group') {
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [targetId, isActive])

  return rect
}

// ─────────────────────────────────────────────
// Smart tooltip placement — auto-detects best side
// and clamps to viewport so it never goes off-screen
// ─────────────────────────────────────────────
const TOOLTIP_GAP = 16
const TOOLTIP_W = 340
const TOOLTIP_EST_H = 340 // generous overestimate to ensure vertical clamping
const SCREEN_PAD = 12

function getTooltipPos(rect: DOMRect, preferSide: TourStep['preferSide'] = 'right'): React.CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const sides: Array<TourStep['preferSide']> = [preferSide, 'right', 'left', 'bottom', 'top']
  const tried = new Set<TourStep['preferSide']>()

  for (const side of sides) {
    if (tried.has(side)) continue
    tried.add(side)

    let left = 0
    let top = 0

    if (side === 'right') {
      left = rect.right + TOOLTIP_GAP
      top = rect.top + rect.height / 2 - TOOLTIP_EST_H / 2
      if (left + TOOLTIP_W > vw - SCREEN_PAD) continue
    } else if (side === 'left') {
      left = rect.left - TOOLTIP_GAP - TOOLTIP_W
      top = rect.top + rect.height / 2 - TOOLTIP_EST_H / 2
      if (left < SCREEN_PAD) continue
    } else if (side === 'bottom') {
      top = rect.bottom + TOOLTIP_GAP
      left = Math.min(rect.left, vw - TOOLTIP_W - SCREEN_PAD)
      if (top + TOOLTIP_EST_H > vh - SCREEN_PAD) continue
    } else if (side === 'top') {
      top = rect.top - TOOLTIP_GAP - TOOLTIP_EST_H
      left = Math.min(rect.left, vw - TOOLTIP_W - SCREEN_PAD)
      if (top < SCREEN_PAD) continue
    }

    // Clamp within viewport
    left = Math.max(SCREEN_PAD, Math.min(left, vw - TOOLTIP_W - SCREEN_PAD))
    top = Math.max(SCREEN_PAD, Math.min(top, vh - TOOLTIP_EST_H - SCREEN_PAD))

    return { top, left }
  }

  // Absolute fallback — centered on screen
  return {
    top: Math.max(SCREEN_PAD, vh / 2 - TOOLTIP_EST_H / 2),
    left: Math.max(SCREEN_PAD, vw / 2 - TOOLTIP_W / 2),
  }
}

// ─────────────────────────────────────────────
// Single-element spotlight — uses a massive box-shadow spread
// to darken everything OUTSIDE the cutout.
// One element = zero seams, zero lines, zero gaps ever.
// ─────────────────────────────────────────────
const OVERLAY_COLOR = 'rgba(2, 6, 23, 0.80)'

function SpotlightBox({ rect, pad }: { rect: DOMRect; pad: number }) {
  return (
    <motion.div
      className="fixed z-[1000] pointer-events-none rounded-2xl"
      animate={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{
        // The giant box-shadow IS the dark overlay. The div itself is the transparent cutout.
        boxShadow: `0 0 0 9999px ${OVERLAY_COLOR}`,
        borderRadius: 16,
      }}
    />
  )
}

// ─────────────────────────────────────────────
// Main Tour Component
// ─────────────────────────────────────────────
export function PagesTour() {
  const {
    isActive, currentStep, totalSteps,
    dontShowAgain, nextStep, prevStep, skipTour, setDontShowAgain
  } = usePagesTour()

  const { numPages } = useWorkspaceStore()
  
  const activeSteps = React.useMemo(() => getActiveTourSteps(numPages), [numPages])
  
  React.useEffect(() => {
    usePagesTour.setState({ totalSteps: activeSteps.length })
  }, [activeSteps.length])

  const step = activeSteps[currentStep]
  const rect = useSpotlightRect(step?.targetId || '', isActive)
  const prevStepRef = useRef(currentStep)

  // Delay rendering to allow CSS transitions / scroll to settle → smooth appearance
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (isActive) {
      setReady(false)
      const t = setTimeout(() => setReady(true), 80)
      return () => clearTimeout(t)
    } else {
      setReady(false)
    }
  }, [isActive])

  // Keep the last known rect so the spotlight never vanishes during step transitions
  const lastRectRef = useRef<DOMRect | null>(null)
  if (rect) lastRectRef.current = rect
  const displayRect = rect ?? lastRectRef.current

  const isLastStep = currentStep === totalSteps - 1

  // Run step onEnter / onLeave hooks
  useEffect(() => {
    if (!isActive) return
    const prevIdx = prevStepRef.current
    if (prevIdx !== currentStep) {
      activeSteps[prevIdx]?.onLeave?.()
      prevStepRef.current = currentStep
    }
    activeSteps[currentStep]?.onEnter?.()
  }, [currentStep, isActive, activeSteps])

  useEffect(() => {
    if (!isActive) activeSteps[prevStepRef.current]?.onLeave?.()
  }, [isActive, activeSteps])

  // ESC to close
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') skipTour() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, skipTour])

  const PAD = 10

  return createPortal(
    <AnimatePresence>
      {isActive && ready && (
        <>
          {/* ── Box-shadow spotlight: always mounted, glides between targets ── */}
          {displayRect && (
            <SpotlightBox key="spotlight-persistent" rect={displayRect} pad={PAD} />
          )}

          {/* ── Blue ring: always mounted, follows spotlight ── */}
          {displayRect && (
            <motion.div
              key="ring-persistent"
              animate={{
                top: displayRect.top - PAD - 2,
                left: displayRect.left - PAD - 2,
                width: displayRect.width + (PAD + 2) * 2,
                height: displayRect.height + (PAD + 2) * 2,
              }}
              initial={false}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed z-[1001] pointer-events-none"
              style={{
                borderRadius: 18,
                boxShadow:
                  '0 0 0 2px rgba(59,130,246,0.9), 0 0 0 6px rgba(59,130,246,0.18), 0 0 48px rgba(59,130,246,0.22)',
              }}
            />
          )}

          {/* ── Tooltip — only rendered once rect is known ── */}
          <AnimatePresence mode="wait">
            {rect && (
              <motion.div
                key={`tooltip-${currentStep}`}
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -8 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                className="fixed z-[1002] pointer-events-auto"
                style={{ width: TOOLTIP_W, ...getTooltipPos(rect, step?.preferSide) }}
              >
                {/* Card */}
                <div className="bg-white/96 dark:bg-[#0b1120]/98 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.4)] border border-slate-200/70 dark:border-blue-900/40 overflow-hidden backdrop-blur-2xl">

                  {/* Progress bar */}
                  <div className="h-[3px] bg-slate-100 dark:bg-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full"
                      initial={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Step counter + close */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-blue-500 dark:text-blue-400">
                        Step {currentStep + 1} of {totalSteps}
                      </span>
                      <button
                        onClick={skipTour}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white leading-snug mb-3">
                      {step?.title}
                    </h3>

                    {/* Body */}
                    <div className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {step?.description}
                    </div>

                    {/* Don't show again — last step only */}
                    {isLastStep && (
                      <button
                        onClick={() => setDontShowAgain(!dontShowAgain)}
                        className="flex items-center gap-2 mb-4 w-full text-left group"
                      >
                        <div className={cn(
                          'w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0',
                          dontShowAgain
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                        )}>
                          {dontShowAgain && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors select-none">
                          Don't show this tour again
                        </span>
                      </button>
                    )}

                    {/* Action row */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={skipTour}
                        className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium"
                      >
                        {isLastStep ? '' : 'Skip tour'}
                      </button>

                      <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                          <button
                            onClick={prevStep}
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back
                          </button>
                        )}
                        <button
                          onClick={nextStep}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
                        >
                          {isLastStep ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Finish
                            </>
                          ) : (
                            <>
                              Next
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Dot progress */}
                    <div className="flex justify-center gap-1.5 mt-4">
                      {Array.from({ length: totalSteps }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            width: i === currentStep ? 20 : 6,
                            background: i === currentStep
                              ? '#3b82f6'
                              : i < currentStep
                              ? '#93c5fd'
                              : 'rgba(148,163,184,0.4)',
                          }}
                          transition={{ duration: 0.3 }}
                          className="h-1.5 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
