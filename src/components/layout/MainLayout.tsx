import { Navbar } from "./Navbar"
import { LeftSidebar } from "./LeftSidebar"
import { RightSidebar } from "./RightSidebar"
import { StatusBar } from "./StatusBar"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"

interface MainLayoutProps {
  children: React.ReactNode
  hasSidebar?: boolean
}

export function MainLayout({ children, hasSidebar = true }: MainLayoutProps) {
  const { isFullscreen } = useWorkspaceStore()

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-blue-500/30 transition-colors duration-500">
      {/* Premium Dark Gradient Background - Only visible in dark mode */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent_70%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,#3b0764,transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#1d4ed8,transparent_50%)] opacity-10"></div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Premium Light Gradient Background - Only visible in light mode */}
      <div className="absolute inset-0 pointer-events-none z-0 dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e2e8f0,transparent_70%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,#d8b4fe,transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#93c5fd,transparent_50%)] opacity-10"></div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {!isFullscreen && <Navbar />}
      
      <div className={cn("absolute inset-0 flex z-10 gap-4 pointer-events-none transition-all duration-500", isFullscreen ? "top-0 bottom-0 p-0" : "top-[88px] bottom-8 px-8")}>
        {hasSidebar && !isFullscreen && <LeftSidebar />}
        
        <main className={cn("relative flex-1 flex flex-col overflow-hidden z-0 pointer-events-auto", isFullscreen ? "rounded-none mb-0" : "rounded-2xl mb-[52px]")}>
          {isFullscreen && (
            <div className="absolute top-8 left-8 z-[9999] pointer-events-none opacity-30 drop-shadow-xl mix-blend-multiply grayscale">
              <Logo className="scale-125 origin-top-left !text-black" />
            </div>
          )}
          {children}
        </main>
        
        {hasSidebar && !isFullscreen && <RightSidebar />}
      </div>
      
      {!isFullscreen && <StatusBar />}
      <ToastProvider />
    </div>
  )
}
