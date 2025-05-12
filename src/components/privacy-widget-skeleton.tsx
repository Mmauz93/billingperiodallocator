import React from 'react';

const PrivacyWidgetSkeleton: React.FC = () => {
  // Simple skeleton mimicking the accordion structure
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
      {/* Placeholder for "Welche Daten wir erfassen" title */}
      <div className="mb-6 h-7 w-2/5 animate-pulse rounded bg-muted/60"></div>
      
      {/* Skeleton items for accordion */}
      {skeletonItem}
      {skeletonItem}
      {skeletonItem}
      {skeletonItem}

      {/* Placeholder for "Welche Dienste wir nutzen" title */}
      <div className="mt-10 mb-6 h-7 w-2/5 animate-pulse rounded bg-muted/60"></div>
      
      {/* Skeleton item for service */}
      {skeletonItem}

    </div>
  );
};

export default PrivacyWidgetSkeleton; 
