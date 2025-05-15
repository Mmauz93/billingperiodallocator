import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  helperText?: string;
  error?: string;
  id?: string;
  onDoubleClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

function Input(
  { className, type, helperText, error, id, onDoubleClick, ...props }: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const errorId = error ? `${id}-error` : undefined;
  
  // Handle double click to select all text
  const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Call the target's select method to select all text
    e.currentTarget.select();
    
    // Also call any provided onDoubleClick handler (to maintain existing behavior)
    if (onDoubleClick) {
      onDoubleClick(e);
    }
  };

  return (
    <div className="w-full">
      <input
        id={id}
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={!!error}
        aria-describedby={errorId}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-sm",
          "selection:bg-primary selection:text-primary-foreground",
          error
            ? "border-destructive ring-destructive/40 focus-visible:ring-destructive"
            : "",
          className,
        )}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-muted-foreground mt-1 mb-3 pl-3">{helperText}</p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="form-error-message"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const ForwardedInput = React.forwardRef(Input);

export { ForwardedInput as Input };
