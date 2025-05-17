/**
 * VisuallyHidden Component
 * 
 * Hides content visually but keeps it accessible to screen readers.
 */

import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  id?: string;
  as?: React.ElementType;
}

export function VisuallyHidden({ 
  children, 
  id,
  as: Component = 'span'
}: VisuallyHiddenProps) {
  return (
    <Component
      id={id}
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      }}
    >
      {children}
    </Component>
  );
}
