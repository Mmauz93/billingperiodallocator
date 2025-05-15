const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Enable class-based dark mode
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
    extend: {
      // Map CSS Variables to Tailwind theme keys
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--background)",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
          DEFAULT: "var(--popover)",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "hsl(var(--card-foreground))",
        },
        cardMuted: {
          DEFAULT: "var(--card-muted)",
        },
        disabled: {
          DEFAULT: "var(--disabled)",
          foreground: "var(--disabled-foreground)",
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
        sm: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)", // Level 1
        DEFAULT: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)", // Default shadow (maps to shadow) - Level 1
        md: "0 2px 4px rgba(0,0,0,0.05), 0 3px 6px rgba(0,0,0,0.06)", // Level 2
        lg: "0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.06)", // Level 3
        xl: "0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.10)", // Level 4
        "2xl":
          "0 24px 48px rgba(0, 0, 0, 0.12), 0 48px 96px rgba(0, 0, 0, 0.1)", // Optional Level 5 if needed
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
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
    },
  },
  plugins: [require("tailwindcss-animate")], // Include the animation plugin
};
