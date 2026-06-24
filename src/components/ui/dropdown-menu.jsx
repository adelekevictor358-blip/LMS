"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Lightweight dropdown (no Radix dependency) styled with the design system.

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

const DropdownMenuTrigger = ({ children }) => {
  const { setOpen, open } = React.useContext(DropdownContext)
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, className, align = "end" }) => {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null

  return (
    <div className={cn(
      "absolute z-[100] mt-2 min-w-[14rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in",
      align === "end" ? "right-0" : "left-0",
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
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
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
  <div className={cn("px-3 py-2 text-xs font-medium text-muted-foreground", className)}>
    {children}
  </div>
)

const DropdownMenuSeparator = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-border", className)} />
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
