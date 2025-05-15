import animate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";
import radixVariants from "./src/design/plugins/radix-variants";
import themeVars from "./src/design/plugins/theme-vars";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: ["class", '[data-theme="dark"]'], // Enable class and data-attribute for dark mode
  content: [
    "./pages/**/*.{ts,tsx}", // Include paths for Tailwind to scan
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      // Basic container setup
      center: true,
      padding: "2rem", // Default padding (can be overridden)
      screens: {
        "2xl": "1400px", // Max-width for the largest screen
      },
    },
    // Define consistent screen breakpoints
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px'
    },
    extend: {
      // Map CSS Variables to Tailwind theme keys
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cardMuted: {
          DEFAULT: "hsl(var(--card-muted))",
        },
        disabled: {
          DEFAULT: "hsl(var(--disabled))",
          foreground: "hsl(var(--disabled-foreground))",
        },
        // Add the colorblind palette
        colorblind: {
          1: "hsl(var(--colorblind-1))",
          2: "hsl(var(--colorblind-2))",
          3: "hsl(var(--colorblind-3))",
          4: "hsl(var(--colorblind-4))",
          5: "hsl(var(--colorblind-5))",
          6: "hsl(var(--colorblind-6))",
          7: "hsl(var(--colorblind-7))",
        },
        // Add the specific legal page primary color
        "legal-primary": "hsl(var(--legal-primary))",
        // Add sidebar colors if needed as utilities
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: {
            DEFAULT: "hsl(var(--sidebar-primary))",
            foreground: "hsl(var(--sidebar-primary-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--sidebar-accent))",
            foreground: "hsl(var(--sidebar-accent-foreground))",
          },
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        // Map border radius variables
        lg: "var(--radius-lg)", // 8px
        DEFAULT: "var(--radius)", // 8px ( maps to rounded-lg now)
        md: "var(--radius-md)", // 6px
        sm: "var(--radius-sm)", // 4px
        xl: "var(--radius-xl)", // 12px
      },
      fontFamily: {
        // Map font variables
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      spacing: {
        // Override spacing scale for 4px grid
        1: "4px", // gap-1, p-1, m-1 etc.
        2: "8px", // gap-2, p-2, m-2 etc.
        3: "12px", // gap-3, p-3, m-3 etc.
        4: "16px", // gap-4, p-4, m-4 etc.
        5: "20px", // gap-5, p-5, m-5 etc.
        6: "24px", // gap-6, p-6, m-6 etc.
        8: "32px", // gap-8, p-8, m-8 etc.
        10: "40px", // gap-10, p-10, m-10 etc.
        12: "48px", // gap-12, p-12, m-12 etc.
        16: "64px", // gap-16, p-16, m-16 etc.
        20: "80px", // gap-20, p-20, m-20 etc.
        24: "96px", // gap-24, p-24, m-24 etc.
        // Add h- (height) and w- (width) specific mappings if needed,
        // e.g., h-9 was 36px -> now maps to h-9 (which doesn't exist) or needs explicit mapping if required.
        // Standard h-10 = 40px, h-8 = 32px, h-12 = 48px align with the grid.
      },
      boxShadow: {
        // Define shadow scale based on guidelines
        sm: "var(--shadow-level-1)",
        DEFAULT: "var(--shadow-level-1)",
        md: "var(--shadow-level-2)",
        lg: "var(--shadow-level-3)",
        xl: "var(--shadow-level-4)",
        "2xl": "var(--shadow-level-5)",
        inner: "inset 0 2px 4px 0 hsla(var(--black), 0.05)",
        none: "none",
      },
      keyframes: {
        // Define animations used by tailwindcss-animate
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Add other keyframes from globals.css if you want to manage them here
        // e.g., fadeIn, pulseHighlight, etc.
        // Keep them in globals.css if preferred.
      },
      animation: {
        // Define animations used by tailwindcss-animate
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Add other animations from globals.css if needed
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': theme('colors.foreground'),
            color: 'var(--tw-prose-body)',
            lineHeight: '1.5',
            a: {
              color: 'var(--tw-prose-links)',
              '&:hover': {
                color: 'hsl(var(--primary-foreground))',
                textDecoration: 'underline',
              },
              textDecoration: 'none',
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '500',
            },
            code: {
              color: theme('colors.primary.DEFAULT'),
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            img: {
              borderRadius: theme('borderRadius.lg'),
            },
          },
        },
        dark: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-links': 'hsl(var(--primary))',
          },
        },
      }),
    },
  },
  plugins: [
    animate, // Include the animation plugin
    radixVariants, // Custom Radix UI variants plugin
    themeVars, // Custom Theme Variables plugin
    typography, // Typography plugin for rich text content
  ],
};

export default tailwindConfig;
