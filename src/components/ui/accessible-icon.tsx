/**
 * AccessibleIcon Component
 * 
 * Wraps an icon and provides a visually hidden label for screen readers.
 */

import React from 'react';
import { VisuallyHidden } from './visually-hidden';

interface AccessibleIconProps {
  children: React.ReactNode;
  label: string;
}

export function AccessibleIcon({ label, children }: AccessibleIconProps) {
  return (
    <span className="inline-flex items-center justify-center">
      {children}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
