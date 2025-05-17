"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full"
    | "prose";
  py?: string;
  px?: string;
  pt?: string;
  pb?: string;
  mt?: string;
  mb?: string;
  bg?: string;
  textAlignment?: "text-left" | "text-center" | "text-right";
  as?: React.ElementType;
  id?: string;
}

export function PageSection({
  children,
  className,
  maxWidth = "6xl",
  py,
  px = "6",
  pt,
  pb,
  mt,
  mb = "16",
  bg,
  textAlignment,
  as: Component = "section",
  id,
  ...props
}: PageSectionProps) {
  const maxWidthClass = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "w-full",
    prose: "max-w-prose",
  }[maxWidth];

  return (
    <Component
      id={id}
      className={cn(
        py ? `py-${py}` : "",
        px ? `px-${px}` : "",
        pt ? `pt-${pt}` : "",
        pb ? `pb-${pb}` : "",
        mt ? `mt-${mt}` : "",
        mb ? `mb-${mb}` : "",
        maxWidth !== "full" ? `${maxWidthClass} mx-auto` : "w-full",
        bg,
        textAlignment,
        "cursor-default",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
