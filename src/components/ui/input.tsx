import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  helperText?: string;
}

function Input({ className, type, helperText, ...props }: InputProps) {
  return (
    <div className="w-full">
    <input
      type={type}
      data-slot="input"
      className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus:border-[#2E5A8C] focus:ring-[#2E5A8C]/20 focus:ring-2",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/40 dark:aria-invalid:ring-destructive/40",
        className
      )}
        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
      {...props}
    />
      {helperText && (
        <p className="text-xs text-gray-500 mt-1 mb-3 pl-3">{helperText}</p>
      )}
    </div>
  )
}

export { Input }
