export function Logo() {
  return (
    <div className="flex items-center select-none w-full max-w-[160px] transition-opacity duration-300 hover:opacity-90">
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
