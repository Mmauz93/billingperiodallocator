import animate from "tailwindcss-animate";
import { colors } from "./src/design/tailwind-colors";
import { typography as customTypography } from "./src/design/tailwind-typography";
import { fontFamily } from "tailwindcss/defaultTheme";
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
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px'
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
      typography: customTypography,
    },
  },
  plugins: [
    animate, // Include the animation plugin
    radixVariants, // Custom Radix UI variants plugin
    // themeVars, // Custom Theme Variables plugin // REMOVED
    tailwindTypography, // Typography plugin for rich text content
  ],
};

export default tailwindConfig;
