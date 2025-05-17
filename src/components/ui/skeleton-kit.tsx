/**
 * Skeleton Kit - A composable system for creating consistent loading skeletons
 *
 * This module provides a set of reusable skeleton components that can be composed
 * to create complex loading states while maintaining consistent styling and animations.
 */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Base variants available for skeleton components
 */
export type SkeletonVariant = 
  | "text" 
  | "heading" 
  | "subheading" 
  | "input" 
  | "button" 
  | "card" 
  | "image" 
  | "avatar" 
  | "toggle";

/**
 * Base props for all skeleton components
 */
interface BaseSkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Text Skeleton - for paragraph text, labels, etc.
 */
export function TextSkeleton({
  className,
  variant = "text",
  width = "100%",
  height,
  animate = true,
  lines = 1,
  lastLineWidth = "75%",
}: BaseSkeletonProps & {
  lines?: number;
  lastLineWidth?: string | number;
}) {
  const getLineWidth = (index: number) => {
    if (lines === 1) return width;
    if (index === lines - 1 && lastLineWidth) return lastLineWidth;
    return "100%";
  };

  const getLineHeight = () => {
    if (height) return height;
    switch (variant) {
      case "heading": return "1.75rem"; // h1, h2
      case "subheading": return "1.25rem"; // h3, h4
      case "text": default: return "1rem"; // regular text
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            animate ? "animate-pulse" : "",
            variant === "heading" ? "h-7 rounded-md" : "rounded-sm",
            variant === "subheading" ? "h-5 rounded-sm" : "",
            variant === "text" ? "h-4 rounded-sm" : "",
            className
          )}
          style={{
            width: getLineWidth(i),
            height: getLineHeight(),
          }}
        />
      ))}
    </div>
  );
}

/**
 * Input Skeleton - for form inputs, textareas, etc.
 */
export function InputSkeleton({
  className,
  width = "100%",
  height = "2.5rem",
  animate = true,
  hasLabel = false,
  labelWidth = "40%",
}: BaseSkeletonProps & {
  hasLabel?: boolean;
  labelWidth?: string | number;
}) {
  return (
    <div className="space-y-2">
      {hasLabel && (
        <Skeleton
          className={cn(
            "h-4 rounded-sm",
            animate ? "animate-pulse" : "",
          )}
          style={{ width: labelWidth }}
        />
      )}
      <Skeleton
        className={cn(
          "rounded-md",
          animate ? "animate-pulse" : "",
          className
        )}
        style={{ width, height }}
      />
    </div>
  );
}

/**
 * Button Skeleton - for buttons and clickable elements
 */
export function ButtonSkeleton({
  className,
  width = "100%",
  height = "2.5rem",
  animate = true,
  variant = "button",
}: BaseSkeletonProps) {
  return (
    <Skeleton
      className={cn(
        "rounded-md",
        variant === "button" ? "bg-primary/40" : "bg-muted/60", 
        animate ? "animate-pulse" : "",
        className
      )}
      style={{ width, height }}
    />
  );
}

/**
 * Card Skeleton - for cards, panels, etc.
 */
export function CardSkeleton({
  className,
  width = "100%",
  height = "12rem",
  animate = true,
  hasBorder = true,
  hasHeader = false,
  hasFooter = false,
  children,
}: BaseSkeletonProps & {
  hasBorder?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted/40",
        hasBorder ? "border border-muted/30" : "",
        animate ? "animate-pulse" : "",
        className
      )}
      style={{ width, height }}
    >
      {hasHeader && (
        <div className="p-4 border-b border-muted/30">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {hasFooter && (
        <div className="p-4 border-t border-muted/30">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Toggle Skeleton - for switches, checkboxes, radio buttons
 */
export function ToggleSkeleton({
  className,
  width = "2.5rem",
  height = "1.5rem",
  animate = true,
  hasLabel = true,
  labelWidth = "60%",
}: BaseSkeletonProps & {
  hasLabel?: boolean;
  labelWidth?: string | number;
}) {
  return (
    <div className="flex items-center justify-between space-x-2">
      {hasLabel && (
        <div className="space-y-1">
          <Skeleton
            className={cn("h-4 rounded-sm", animate ? "animate-pulse" : "")}
            style={{ width: labelWidth }}
          />
          <Skeleton
            className={cn("h-3 rounded-sm", animate ? "animate-pulse" : "")}
            style={{ width: "calc(100% + 2rem)" }}
          />
        </div>
      )}
      <Skeleton
        className={cn(
          "rounded-full",
          animate ? "animate-pulse" : "",
          className
        )}
        style={{ width, height }}
      />
    </div>
  );
}

/**
 * Grid Skeleton - for grid layouts
 */
export function GridSkeleton({
  className,
  animate = true,
  columns = 2,
  rows = 1,
  gap = "1.5rem",
  children,
}: BaseSkeletonProps & {
  columns?: number;
  rows?: number;
  gap?: string | number;
  children?: React.ReactNode;
}) {
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  
  return (
    <div
      className={cn(
        "grid w-full",
        animate ? "animate-pulse" : "",
        className
      )}
      style={{
        gridTemplateColumns,
        gap,
      }}
    >
      {children || Array.from({ length: columns * rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Container for organizing multiple skeleton components
 */
export function SkeletonContainer({
  className,
  animate = true,
  spacing = "1.5rem",
  children,
}: BaseSkeletonProps & {
  spacing?: string | number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full",
        animate ? "animate-pulse" : "",
        className
      )}
      style={{ gap: spacing }}
    >
      {children}
    </div>
  );
}

export { Skeleton }; 
