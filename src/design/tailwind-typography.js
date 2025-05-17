export const typography = ({ theme }) => ({
  DEFAULT: {
    css: {
      "--tw-prose-body": theme("colors.foreground"),
      "--tw-prose-headings": theme("colors.foreground"),
      "--tw-prose-links": "hsl(var(--primary))",
      "--tw-prose-bold": theme("colors.foreground"),
      color: "var(--tw-prose-body)",
      lineHeight: "1.5",
      a: {
        color: "var(--tw-prose-links)",
        "&:hover": {
          color: "hsl(var(--primary-foreground))",
          textDecoration: "underline",
        },
        textDecoration: "none",
      },
      h1: {
        color: "var(--tw-prose-headings)",
        fontWeight: "700",
      },
      h2: {
        color: "var(--tw-prose-headings)",
        fontWeight: "600",
      },
      h3: {
        color: "var(--tw-prose-headings)",
        fontWeight: "500",
      },
      code: {
        color: theme("colors.primary.DEFAULT"),
        fontWeight: "500",
      },
      "code::before": {
        content: '""',
      },
      "code::after": {
        content: '""',
      },
      img: {
        borderRadius: theme("borderRadius.lg"),
      },
    },
  },
  dark: {
    css: {
      "--tw-prose-body": theme("colors.foreground"),
      "--tw-prose-headings": theme("colors.foreground"),
      "--tw-prose-links": "hsl(var(--primary))",
    },
  },
});
