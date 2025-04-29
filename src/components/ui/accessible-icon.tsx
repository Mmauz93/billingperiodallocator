import * as React from "react";

import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface AccessibleIconProps {
  label: string;
  children: React.ReactNode;
}

/**
 * AccessibleIcon component wraps an icon and provides a visually hidden label for screen readers.
 */
function AccessibleIcon({ label, children }: AccessibleIconProps) {
  return (
    <span className="inline-flex items-center justify-center">
      {children}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}

export { AccessibleIcon };
