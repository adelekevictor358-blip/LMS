import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Minimal Shim for Select to avoid Radix UI dependency errors
// This uses standard HTML select under the hood for maximum stability

const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  
  // Pass props down to children
  return (
    <div className="relative w-full">
      {React.Children.map(children, child => {
        if (child.type.displayName === "SelectContent") {
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
      "flex h-12 w-full items-center justify-between rounded-xl border-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer",
      className
    )}
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
  >
    {children}
  </select>
)
SelectContent.displayName = "SelectContent"

const SelectItem = ({ value, children }) => (
  <option value={value} className="bg-white dark:bg-slate-900 font-bold p-4">
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

const SelectGroup = ({ children, label }) => (
  <optgroup label={label} className="text-purple-600 font-black text-xs uppercase bg-slate-100">
    {children}
  </optgroup>
)
SelectGroup.displayName = "SelectGroup"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup }
