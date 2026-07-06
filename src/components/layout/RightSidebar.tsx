import { useState } from "react"
import { 
  SlidersHorizontal, 
  Trash2, 
  Copy, 
  Type, 
  Highlighter, 
  MessageSquare, 
  Square,
  ChevronDown,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  RotateCw,
  Info,
  Check
} from "lucide-react"
import { useWorkspaceStore, type Tool, type Annotation } from "@/store/useWorkspaceStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RightSidebar() {
  const { 
    annotations, 
    selectedAnnotationId, 
    updateAnnotation, 
    deleteAnnotation,
    duplicateAnnotation,
    bringForward,
    sendBackward,
    lockAnnotation,
    toggleVisibility,
    activeTool,
    toolDefaults,
    updateToolDefault,
    setActiveTool
  } = useWorkspaceStore()

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)
  const isToolMode = !selectedAnnotation && activeTool !== "pointer" && activeTool !== "hand"
  
  const showProperties = selectedAnnotation || isToolMode
  const activeType = selectedAnnotation ? selectedAnnotation.type : activeTool
  const props = (selectedAnnotation || toolDefaults[activeTool]) as Partial<Annotation>

  const handleChange = (key: keyof Annotation, value: any) => {
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { [key]: value })
    } else {
      updateToolDefault(activeTool, { [key]: value })
    }
  }

  // Feature flags
  const hasStroke = ['rectangle', 'oval', 'arrow', 'line', 'cloud', 'freedraw', 'signature'].includes(activeType)
  const hasFill = ['rectangle', 'oval', 'cloud'].includes(activeType)
  const hasFont = ['text'].includes(activeType)
  const hasCornerRadius = ['rectangle'].includes(activeType)
  const hasBorderStyle = ['rectangle', 'oval'].includes(activeType)
  const hasArrowHead = ['arrow'].includes(activeType)
  const hasDashStyle = ['arrow', 'line'].includes(activeType)
  const hasDensity = ['cloud'].includes(activeType)
  const hasAuthor = ['sticky_note'].includes(activeType)
  const hasColor = !['pointer', 'hand', 'eraser'].includes(activeType)
  const hasOpacity = !['pointer', 'hand', 'eraser'].includes(activeType)

  return (
    <aside className="w-[320px] h-full flex flex-col bg-white/70 dark:bg-[#1e293b]/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] z-20 pointer-events-auto overflow-hidden transition-colors duration-500">
      <div className="flex h-[60px] items-center justify-between border-b border-slate-200/60 dark:border-white/5 px-5 shrink-0 bg-white/40 dark:bg-slate-900/40 transition-colors duration-500">
        <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
          Properties
        </div>
        <button className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {!showProperties ? (
          <EmptyState onSelectTool={setActiveTool} />
        ) : (
          <div className="flex flex-col pb-8">
            {/* Header Area */}
            <div className="p-5 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      selectedAnnotation 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" 
                        : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                    )}>
                      {selectedAnnotation ? "Selected Object" : "Tool Settings"}
                    </span>
                    {selectedAnnotation?.locked && <Lock className="h-3 w-3 text-amber-500" />}
                    {selectedAnnotation?.hidden && <EyeOff className="h-3 w-3 text-slate-400" />}
                  </div>
                  <h4 className="text-lg font-bold capitalize text-slate-800 dark:text-slate-200">
                    {activeType.replace('_', ' ')}
                  </h4>
                </div>
              </div>
            </div>

            {/* General Section */}
            {selectedAnnotation && (
              <Accordion title="General" defaultOpen>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <NumberInput label="X" value={Math.round(props.x || 0)} onChange={(v) => handleChange("x", v)} />
                  <NumberInput label="Y" value={Math.round(props.y || 0)} onChange={(v) => handleChange("y", v)} />
                  {props.width !== undefined && <NumberInput label="W" value={Math.round(props.width || 0)} onChange={(v) => handleChange("width", v)} />}
                  {props.height !== undefined && <NumberInput label="H" value={Math.round(props.height || 0)} onChange={(v) => handleChange("height", v)} />}
                </div>
                <SliderControl label="Rotation" value={props.rotation || 0} min={-180} max={180} onChange={(v) => handleChange("rotation", v)} suffix="°" />
              </Accordion>
            )}

            {/* Eraser Specific Settings */}
            {activeType === "eraser" && !selectedAnnotation && (
              <Accordion title="Eraser Tool" defaultOpen>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Mode</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => useWorkspaceStore.getState().setEraserSettings({ mode: 'click' })}
                        className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${useWorkspaceStore.getState().eraserSettings.mode === 'click' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                      >
                        Single Click
                      </button>
                      <button 
                        onClick={() => useWorkspaceStore.getState().setEraserSettings({ mode: 'drag' })}
                        className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${useWorkspaceStore.getState().eraserSettings.mode === 'drag' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                      >
                        Brush Erase
                      </button>
                    </div>
                  </div>
                  
                  {useWorkspaceStore.getState().eraserSettings.mode === 'drag' && (
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Brush Size</label>
                      <div className="flex gap-1.5">
                        {[16, 24, 32, 48, 64].map((size) => (
                          <button
                            key={size}
                            onClick={() => useWorkspaceStore.getState().setEraserSettings({ brushSize: size })}
                            className={`flex-1 py-1.5 text-xs rounded-md border transition-colors flex items-center justify-center ${useWorkspaceStore.getState().eraserSettings.brushSize === size ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                          >
                            <div className="bg-current rounded-full" style={{ width: Math.min(size / 2, 14), height: Math.min(size / 2, 14) }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useWorkspaceStore.getState().eraserSettings.eraseLocked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {useWorkspaceStore.getState().eraserSettings.eraseLocked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Erase Locked Objects</span>
                      <input type="checkbox" className="hidden" checked={useWorkspaceStore.getState().eraserSettings.eraseLocked} onChange={(e) => useWorkspaceStore.getState().setEraserSettings({ eraseLocked: e.target.checked })} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useWorkspaceStore.getState().eraserSettings.highlightFirst ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {useWorkspaceStore.getState().eraserSettings.highlightFirst && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Highlight Before Delete</span>
                      <input type="checkbox" className="hidden" checked={useWorkspaceStore.getState().eraserSettings.highlightFirst} onChange={(e) => useWorkspaceStore.getState().setEraserSettings({ highlightFirst: e.target.checked })} />
                    </label>
                  </div>
                </div>
              </Accordion>
            )}
            
            {activeType === "eraser" && !selectedAnnotation && (
              <Accordion title="Danger Zone" defaultOpen>
                <div className="space-y-2 mb-2">
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2 h-9 text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete ALL annotations in the document?")) {
                        useWorkspaceStore.getState().clearAllAnnotations()
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete All Annotations
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-9 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-500 dark:hover:bg-amber-900/20"
                    onClick={() => {
                      if (confirm("Clear all annotations on this page?")) {
                        const state = useWorkspaceStore.getState()
                        const toDelete = state.annotations.filter(a => a.pageNumber === state.currentPage).map(a => a.id)
                        toDelete.forEach(id => state.deleteAnnotation(id))
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear Current Page
                  </Button>
                </div>
              </Accordion>
            )}

            {/* Appearance Section */}
            <Accordion title="Appearance" defaultOpen>
              {hasColor && props.color !== undefined && (
                <div className="mb-4">
                  <ColorPickerControl label="Stroke / Text Color" value={props.color} onChange={(v) => handleChange("color", v)} />
                </div>
              )}
              {hasFill && props.fillColor !== undefined && (
                <div className="mb-4">
                  <ColorPickerControl label="Fill Color" value={props.fillColor} onChange={(v) => handleChange("fillColor", v)} />
                </div>
              )}
              {hasStroke && props.strokeWidth !== undefined && (
                <div className="mb-4">
                  <SliderControl label="Stroke Width" value={props.strokeWidth} min={1} max={20} onChange={(v) => handleChange("strokeWidth", v)} suffix="px" />
                </div>
              )}
              {hasOpacity && props.opacity !== undefined && (
                <div className="mb-4">
                  <SliderControl label="Opacity" value={props.opacity} min={0.1} max={1} step={0.1} onChange={(v) => handleChange("opacity", v)} suffix="%" displayMultiplier={100} />
                </div>
              )}
              {hasDensity && (
                <div className="mb-4 space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cloud Shape</label>
                  <SegmentedControl 
                    options={['rectangle', 'circle']} 
                    value={props.cloudShape || 'rectangle'} 
                    onChange={(v) => handleChange("cloudShape", v)} 
                  />
                </div>
              )}
              {hasDensity && props.density !== undefined && (
                <div className="mb-2">
                  <SliderControl label="Cloud Density" value={props.density} min={1} max={10} onChange={(v) => handleChange("density", v)} suffix="" />
                </div>
              )}
            </Accordion>

            {/* Typography Section */}
            {hasFont && (
              <Accordion title="Typography" defaultOpen>
                <div className="mb-4">
                  <SelectControl label="Font Family" value={props.fontFamily || "Inter"} options={['Inter', 'Roboto', 'Arial', 'Times New Roman', 'Courier New']} onChange={(v) => handleChange("fontFamily", v)} />
                </div>
                <div className="mb-4">
                  <SliderControl label="Font Size" value={props.fontSize || 16} min={8} max={120} onChange={(v) => handleChange("fontSize", v)} suffix="pt" />
                </div>
                <div className="mb-2">
                  <SegmentedControl 
                    options={['left', 'center', 'right']} 
                    value={props.textAlign || 'left'} 
                    onChange={(v) => handleChange("textAlign", v)} 
                  />
                </div>
              </Accordion>
            )}

            {/* Effects & Advanced Section */}
            {(hasCornerRadius || hasDashStyle || hasArrowHead || hasDensity || hasBorderStyle) && (
              <Accordion title="Advanced Features" defaultOpen={false}>
                {hasCornerRadius && props.cornerRadius !== undefined && (
                  <div className="mb-4">
                    <SliderControl label="Corner Radius" value={props.cornerRadius} min={0} max={50} onChange={(v) => handleChange("cornerRadius", v)} suffix="px" />
                  </div>
                )}
                {hasBorderStyle && props.borderStyle !== undefined && (
                  <div className="mb-4">
                    <SelectControl label="Border Style" value={props.borderStyle} options={['solid', 'dashed', 'dotted']} onChange={(v) => handleChange("borderStyle", v)} />
                  </div>
                )}
                {hasArrowHead && props.arrowHead !== undefined && (
                  <div className="mb-4">
                    <SelectControl label="Arrow Head" value={props.arrowHead} options={['none', 'arrow', 'triangle', 'circle', 'square']} onChange={(v) => handleChange("arrowHead", v)} />
                  </div>
                )}
                {hasDashStyle && props.dashStyle !== undefined && (
                  <div className="mb-4">
                    <SelectControl label="Dash Style" value={props.dashStyle} options={['solid', 'dashed', 'dotted']} onChange={(v) => handleChange("dashStyle", v)} />
                  </div>
                )}
              </Accordion>
            )}

            {/* Author Section */}
            {hasAuthor && props.author !== undefined && (
              <Accordion title="Note Details" defaultOpen>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Author</label>
                  <input 
                    type="text" 
                    value={props.author} 
                    onChange={(e) => handleChange("author", e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </Accordion>
            )}

            {/* Actions Section */}
            {selectedAnnotation && (
              <Accordion title="Actions" defaultOpen>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <ActionButton icon={BringToFront} label="Forward" onClick={() => bringForward(selectedAnnotation.id)} />
                  <ActionButton icon={SendToBack} label="Backward" onClick={() => sendBackward(selectedAnnotation.id)} />
                  <ActionButton 
                    icon={selectedAnnotation.locked ? Unlock : Lock} 
                    label={selectedAnnotation.locked ? "Unlock" : "Lock"} 
                    onClick={() => lockAnnotation(selectedAnnotation.id)} 
                    active={selectedAnnotation.locked}
                  />
                  <ActionButton 
                    icon={selectedAnnotation.hidden ? Eye : EyeOff} 
                    label={selectedAnnotation.hidden ? "Show" : "Hide"} 
                    onClick={() => toggleVisibility(selectedAnnotation.id)} 
                    active={selectedAnnotation.hidden}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-9 text-xs bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => duplicateAnnotation(selectedAnnotation.id)}
                  >
                    <Copy className="h-3.5 w-3.5" /> Duplicate Annotation
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2 h-9 text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white"
                    onClick={() => deleteAnnotation(selectedAnnotation.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Annotation
                  </Button>
                </div>
              </Accordion>
            )}

            {/* Tool Default Settings Resetter */}
            {!selectedAnnotation && (
              <div className="p-5">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-snug">
                    Any changes made here will become the default style for all new {activeType.replace('_', ' ')}s.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

// --- Empty State ---

function EmptyState({ onSelectTool }: { onSelectTool: (tool: Tool) => void }) {
  return (
    <div className="flex flex-col min-h-full p-5 pb-8">
      <div className="flex flex-col items-center justify-center pt-8 pb-6">
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center group">
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <img src="/Glowing_app_icon.png" alt="No selection" className="w-28 h-28 object-contain drop-shadow-2xl z-10 hover:scale-105 transition-transform duration-500" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-2">Editor Ready</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-[200px] leading-relaxed">
          Select an object on the canvas or pick a tool from the toolbar to begin.
        </p>
      </div>

      <div className="mt-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          <div onClick={() => onSelectTool("text")}>
            <MiniToolCard icon={Type} title="Text" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
          </div>
          <div onClick={() => onSelectTool("highlight")}>
            <MiniToolCard icon={Highlighter} title="Highlight" color="text-yellow-600 dark:text-yellow-400" bg="bg-yellow-50 dark:bg-yellow-500/10" />
          </div>
          <div onClick={() => onSelectTool("sticky_note")}>
            <MiniToolCard icon={MessageSquare} title="Comment" color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-500/10" />
          </div>
          <div onClick={() => onSelectTool("rectangle")}>
            <MiniToolCard icon={Square} title="Shape" color="text-pink-600 dark:text-pink-400" bg="bg-pink-50 dark:bg-pink-500/10" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniToolCard({ icon: Icon, title, color, bg }: { icon: any, title: string, color: string, bg: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow-md group">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-300", bg, color)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{title}</span>
    </div>
  )
}

// --- UI Controls ---

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-slate-200/60 dark:border-white/5 last:border-0">
      <button 
        className="w-full flex items-center justify-between p-5 py-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

function ColorPickerControl({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const pickerValue = (value === 'transparent' || value.startsWith('rgb')) ? '#ffffff' : value
  
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800/50 px-2 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-inner border border-slate-200 dark:border-white/10">
          <input 
            type="color" 
            value={pickerValue} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
          />
        </div>
        <div className="flex-1 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg px-2 py-1.5 border border-slate-100 dark:border-white/5">
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">{value === 'transparent' ? 'None' : value}</span>
          <Button variant="ghost" size="sm" className="h-5 text-[9px] px-2 uppercase tracking-wider font-bold text-slate-400 hover:text-slate-800 dark:hover:text-white" onClick={() => onChange('transparent')}>Clear</Button>
        </div>
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step = 1, onChange, suffix, displayMultiplier = 1 }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
          {Math.round(value * displayMultiplier)}{suffix}
        </span>
      </div>
      <input 
        type="range" 
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
      />
    </div>
  )
}

function NumberInput({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
      />
    </div>
  )
}

function SelectControl({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-medium text-slate-800 dark:text-slate-200 capitalize appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        >
          {options.map(o => (
            <option key={o} value={o} className="dark:bg-slate-800">{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all capitalize",
            value === opt 
              ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, active }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all",
        active 
          ? "bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 shadow-inner" 
          : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  )
}
