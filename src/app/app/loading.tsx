// loading.tsx - This file provides a skeleton UI while the page is loading
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl grow overflow-hidden w-full">
      <div className="text-center mb-8">
        <div className="h-9 bg-muted/60 rounded-md animate-pulse w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-2/3 mx-auto mb-2" />
        <div className="h-4 bg-muted/60 rounded-sm animate-pulse w-1/2 mx-auto" />
      </div>
      
      <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm mb-6">
        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
        <span>Loading calculator...</span>
      </div>
      
      <div className="mx-auto" style={{ maxWidth: "768px" }}>
        <div className="mb-12 shadow-md w-full h-[350px] bg-muted/30 rounded-lg animate-pulse transition-opacity" />
      </div>
    </div>
  );
} 
