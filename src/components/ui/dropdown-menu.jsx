"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Institutional Mock Dropdown
 * Bypasses heavy Radix dependency while maintaining premium aesthetics.
 */

const DropdownContext = React.createContext(null)

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={containerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild }) => {
  const { setOpen, open } = React.useContext(DropdownContext)
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, className }) => {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null

  return (
    <div className={cn(
      "absolute right-0 mt-4 z-[100] min-w-[16rem] overflow-hidden rounded-[32px] border border-slate-200 bg-white p-2 text-slate-950 shadow-5xl animate-in zoom-in-95 duration-200 dark:border-white/5 dark:bg-slate-900 dark:text-slate-50",
      className
    )}>
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ children, className, onClick }) => {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <div 
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-2xl px-4 py-3 text-sm font-black italic uppercase tracking-widest outline-none transition-colors hover:bg-slate-50 dark:hover:bg-white/5",
        className
      )}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

const DropdownMenuLabel = ({ children, className }) => (
  <div className={cn("px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 italic", className)}>
    {children}
  </div>
)

const DropdownMenuSeparator = ({ className }) => (
  <div className={cn("-mx-2 my-2 h-px bg-slate-100 dark:bg-white/5", className)} />
)

const DropdownMenuGroup = ({ children }) => <div>{children}</div>
const DropdownMenuPortal = ({ children }) => <>{children}</>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal
}
