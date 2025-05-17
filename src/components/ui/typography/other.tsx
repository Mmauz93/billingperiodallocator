import React from "react";
import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function TypographyInlineCode({
  className,
  children,
  ...props
}: Omit<TypographyProps, "as">) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className,
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
        className,
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
      className={cn(
        "my-4 ml-6 list-disc text-base leading-relaxed [&>li]:mt-2",
        className,
      )}
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
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </a>
  );
}
