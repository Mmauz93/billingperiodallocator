"use client";

export function InvoiceFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Date fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/5" />
          <div className="h-10 bg-muted/60 rounded-md animate-pulse w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/5" />
          <div className="h-10 bg-muted/60 rounded-md animate-pulse w-full" />
        </div>
      </div>

      {/* Include End Date toggle */}
      <div className="h-20 bg-muted/40 rounded-lg animate-pulse border border-muted/30 p-4 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-40" />
          <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-56" />
        </div>
        <div className="h-6 w-12 bg-muted/60 rounded-full animate-pulse" />
      </div>

      {/* Split Period dropdown */}
      <div className="h-20 bg-muted/40 rounded-lg animate-pulse border border-muted/30 p-4 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-32" />
          <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-64" />
        </div>
        <div className="h-10 w-28 bg-muted/60 rounded-md animate-pulse" />
      </div>

      {/* Amounts section */}
      <div className="rounded-lg border border-muted/30 p-6 shadow-xs space-y-4 bg-muted/10">
        <div className="h-5 bg-muted/60 rounded-sm animate-pulse w-1/4" />
        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-3/5 mb-4" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 bg-muted/60 rounded-sm animate-pulse w-8" />
            <div className="flex gap-2">
              <div className="h-10 bg-muted/60 rounded-md animate-pulse flex-grow" />
              <div className="h-10 w-10 bg-muted/60 rounded-md animate-pulse opacity-0" />
            </div>
          </div>
        </div>
        <div className="h-8 bg-muted/60 rounded-md animate-pulse w-40 mt-6" />
      </div>

      {/* Calculate button */}
      <div className="h-11 bg-primary/40 rounded-md animate-pulse w-full" />
    </div>
  );
}
