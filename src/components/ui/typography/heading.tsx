import React from "react";
import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function TypographyH1({
  as: Component = "h1",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-3xl font-bold leading-tight tracking-tighter md:text-4xl",
        "scroll-m-20",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyH2({
  as: Component = "h2",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight md:text-3xl",
        "scroll-m-20 border-b pb-2 first:mt-0",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyH3({
  as: Component = "h3",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-xl font-semibold leading-tight md:text-2xl",
        "scroll-m-20",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyH4({
  as: Component = "h4",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-lg font-semibold leading-snug md:text-xl",
        "scroll-m-20",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
