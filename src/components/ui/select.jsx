import * as React from "react"
import { cn } from "@/lib/utils"

// Minimal shim for Select built on a native <select> for maximum stability.
// Styled with design-system tokens so it matches the rest of the portal.

const Select = ({ children, value, onValueChange }) => {
  return (
    <div className="relative w-full">
      {React.Children.map(children, child => {
        if (child?.type?.displayName === "SelectContent") {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  )
}

const SelectTrigger = ({ className, children }) => (
  <div className={cn("hidden", className)}>{children}</div>
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, value, onValueChange, className }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={cn(
      "flex h-11 w-full cursor-pointer appearance-none items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.85rem center',
      backgroundSize: '1.1em',
      paddingRight: '2.5rem',
    }}
  >
    {children}
  </select>
)
SelectContent.displayName = "SelectContent"

const SelectItem = ({ value, children }) => (
  <option value={value} className="bg-popover font-normal text-popover-foreground">
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

const SelectGroup = ({ children, label }) => (
  <optgroup label={label} className="bg-popover text-xs font-semibold text-muted-foreground">
    {children}
  </optgroup>
)
SelectGroup.displayName = "SelectGroup"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup }
