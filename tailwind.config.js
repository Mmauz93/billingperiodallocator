import animate from "tailwindcss-animate";
import { colors } from "./src/design/tailwind-colors";
import { typography as customTypography } from "./src/design/tailwind-typography";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import radixVariants from "./src/design/plugins/radix-variants";
import { spacing } from "./src/design/tailwind-spacing";
import tailwindTypography from "@tailwindcss/typography";

// import themeVars from "./src/design/plugins/theme-vars"; // REMOVED

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
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
    extend: {
      // Map CSS Variables to Tailwind theme keys
      colors: colors,
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
      spacing: spacing,
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
        // Migrated animations from src/styles/animations.css
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        staggeredFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseHighlight: {
          '0%': { backgroundColor: 'transparent' },
          '30%': { backgroundColor: 'var(--pulse-highlight-color)' },
          '100%': { backgroundColor: 'transparent' },
        },
        resultReveal: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        successGlow: {
          '0%, 100%': { boxShadow: '0 0 0 hsla(var(--success), 0)' },
          '50%': { boxShadow: '0 0 12px hsla(var(--success), 0.8)' },
        },
        resultSuccessGlow: {
          '0%, 100%': { boxShadow: '0 0 2px hsla(var(--primary), 0.1)' },
          '40%': { boxShadow: '0 0 15px hsla(var(--primary), 0.3)' },
        },
        darkResultSuccessGlow: {
          '0%, 100%': { boxShadow: '0 0 2px hsla(var(--ring), 0.1)' },
          '40%': { boxShadow: '0 0 15px hsla(var(--ring), 0.3)' },
        },
        scaleIn: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.03)' },
        },
      },
      animation: {
        // Define animations used by tailwindcss-animate
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Migrated animations from src/styles/animations.css
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        staggeredFadeIn: 'staggeredFadeIn 0.4s ease-out forwards',
        pulseHighlight: 'pulseHighlight 1.2s ease-out',
        resultReveal: 'resultReveal 0.4s ease-in-out forwards',
        successGlow: 'successGlow 1.5s ease-in-out',
        resultGlow: 'resultSuccessGlow 3s ease-out forwards',
        resultGlowDark: 'darkResultSuccessGlow 3s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
      typography: customTypography,
      zIndex: {
        // Explicit z-index variables to match CSS vars
        'negative': 'var(--z-negative)',
        'base': 'var(--z-base)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'toast': 'var(--z-toast)',
        'tooltip': 'var(--z-tooltip)',
        'max': 'var(--z-max)',
      }
    },
  },
  plugins: [
    animate, // Include the animation plugin
    radixVariants, // Custom Radix UI variants plugin
    // themeVars, // Custom Theme Variables plugin // REMOVED
    tailwindTypography, // Typography plugin for rich text content
    // Custom plugin to handle Radix popper content wrapper styling
    plugin(function({ addBase }) {
      addBase({
        '[data-radix-popper-content-wrapper]': {
          zIndex: 'var(--z-popover)',
          backgroundColor: 'inherit',
          opacity: '1 !important',
        },
        // Form validation styles from forms.css
        '[aria-invalid="true"], [data-invalid="true"]': {
          borderColor: 'hsl(var(--destructive))',
        },
        '[aria-invalid="true"] ~ svg, [aria-invalid="true"] + svg, [data-invalid="true"] ~ svg, [data-error="true"] svg, svg.text-destructive': {
          color: 'hsl(var(--destructive))',
        },
      });
    }),
  ],
};

export default tailwindConfig;
