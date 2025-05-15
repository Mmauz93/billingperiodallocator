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
        className
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
        className
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
        className
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
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TypographyP({
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-base leading-relaxed", "[&:not(:first-child)]:mt-4", className)}
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

export function TypographyInlineCode({
  className,
  children,
  ...props
}: Omit<TypographyProps, "as">) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function TypographyBlockquote({
  className,
  children,
  ...props
}: Omit<TypographyProps, "as">) {
  return (
    <blockquote
      className={cn(
        "mt-6 border-l-2 pl-6 italic text-base leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function TypographyList({
  className,
  children,
  ...props
}: Omit<TypographyProps, "as">) {
  return (
    <ul
      className={cn("my-4 ml-6 list-disc text-base leading-relaxed [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export function TypographyLink({
  className,
  children,
  href,
  ...props
}: TypographyProps & { href?: string }) {
  return (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:text-primary/80", 
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </a>
  );
} 
