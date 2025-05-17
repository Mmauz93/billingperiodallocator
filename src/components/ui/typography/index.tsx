import React from "react";

export type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
} from "./heading";

export {
  TypographyP,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyLead,
} from "./text";

export {
  TypographyInlineCode,
  TypographyBlockquote,
  TypographyList,
  TypographyLink,
} from "./other";
