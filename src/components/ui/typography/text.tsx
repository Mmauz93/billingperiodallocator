import React from "react";
import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function TypographyP({
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-base leading-relaxed",
        "[&:not(:first-child)]:mt-4",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyLarge({
  as: Component = "div",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-lg font-medium leading-relaxed", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographySmall({
  as: Component = "small",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-sm font-medium leading-normal", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyMuted({
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-sm text-muted-foreground leading-normal", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyLead({
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-xl text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
