import React from "react";

const PrivacyWidgetSkeleton: React.FC = () => {
  const skeletonItem = (
    <div className="mb-4 h-20 animate-pulse rounded-lg border bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-3/5 rounded bg-muted/60"></div>
        <div className="h-4 w-1/5 rounded bg-muted/60"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6 h-7 w-2/5 animate-pulse rounded bg-muted/60"></div>

      {skeletonItem}
      {skeletonItem}
      {skeletonItem}
      {skeletonItem}

      <div className="mt-10 mb-6 h-7 w-2/5 animate-pulse rounded bg-muted/60"></div>

      {skeletonItem}
    </div>
  );
};

export default PrivacyWidgetSkeleton;
