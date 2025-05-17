"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'prose';
  py?: string; // Tailwind py- value, e.g., '16', '20'
  px?: string; // Tailwind px- value, e.g., '4', '6'
  pt?: string;
  pb?: string;
  mt?: string;
  mb?: string; // Tailwind mb- value, e.g., '10', '16'
  bg?: string; // Tailwind background color class, e.g., 'bg-background', 'bg-card'
  textAlignment?: 'text-left' | 'text-center' | 'text-right';
  as?: React.ElementType; // Allow rendering as different elements e.g. section, div, header
  id?: string;
}

export function PageSection({
  children,
  className,
  maxWidth = '6xl', // Default max width
  py,
  px = '6', // Default horizontal padding if no specific px is given by user
  pt,
  pb,
  mt,
  mb = '16', // Default bottom margin
  bg,
  textAlignment,
  as: Component = 'section', // Default to <section>
  id,
  ...props
}: PageSectionProps) {
  const maxWidthClass = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'w-full', // For full width sections that still might use common padding
    prose: 'max-w-prose',
  }[maxWidth];

  return (
    <Component
      id={id}
      className={cn(
        py ? `py-${py}` : '',
        px ? `px-${px}` : '', // Apply px if provided
        pt ? `pt-${pt}` : '',
        pb ? `pb-${pb}` : '',
        mt ? `mt-${mt}` : '',
        mb ? `mb-${mb}` : '',
        maxWidth !== 'full' ? `${maxWidthClass} mx-auto` : 'w-full', // Apply mx-auto if not full width
        bg,
        textAlignment,
        "cursor-default", // Added as it was common in landing page sections
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 
