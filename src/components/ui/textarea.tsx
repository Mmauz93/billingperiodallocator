import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: string;
}

function Textarea(
  { className, error, id, ...props }: TextareaProps,
  ref: React.Ref<HTMLTextAreaElement>,
) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <textarea
        id={id}
        ref={ref}
        data-slot="textarea"
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-sm",
          error
            ? "border-destructive ring-destructive/40 focus-visible:ring-destructive"
            : "",
          className,
        )}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-destructive mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const ForwardedTextarea = React.forwardRef(Textarea);

export { ForwardedTextarea as Textarea };
