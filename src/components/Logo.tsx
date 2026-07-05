import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const { resetWorkspace } = useWorkspaceStore()

  return (
    <div 
      className={cn("flex items-center select-none w-full max-w-[160px] transition-all duration-300 hover:opacity-80 cursor-pointer active:scale-95", className)}
      onClick={resetWorkspace}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          resetWorkspace()
        }
      }}
    >
      <img 
        src="/Viewix_light-sidebar_logo.png" 
        alt="Viewix Logo" 
        className="w-full h-auto block dark:hidden" 
      />
      <img 
        src="/Viewix_dark-sidebar_logo.png" 
        alt="Viewix Logo" 
        className="w-full h-auto hidden dark:block" 
      />
    </div>
  )
}
