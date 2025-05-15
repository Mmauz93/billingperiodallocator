/**
 * Custom Tailwind plugin to generate utility classes for CSS variables
 * Creates utility classes for theme tokens that map directly to CSS variables
 */

import plugin from 'tailwindcss/plugin';

export default plugin(({ addUtilities }) => {
  // Background colors based on theme variables
  addUtilities({
    '.bg-theme-background': { backgroundColor: 'var(--background)' },
    '.bg-theme-card': { backgroundColor: 'var(--card)' },
    '.bg-theme-card-muted': { backgroundColor: 'var(--card-muted)' },
    '.bg-theme-popover': { backgroundColor: 'var(--popover)' },
    '.bg-theme-primary': { backgroundColor: 'hsl(var(--primary))' },
    '.bg-theme-secondary': { backgroundColor: 'var(--secondary)' },
    '.bg-theme-muted': { backgroundColor: 'hsl(var(--muted))' },
    '.bg-theme-accent': { backgroundColor: 'hsl(var(--accent))' },
    '.bg-theme-destructive': { backgroundColor: 'hsl(var(--destructive))' },
    '.bg-theme-disabled': { backgroundColor: 'var(--disabled)' },
  });

  // Text colors based on theme variables
  addUtilities({
    '.text-theme-foreground': { color: 'hsl(var(--foreground))' },
    '.text-theme-card-foreground': { color: 'hsl(var(--card-foreground))' },
    '.text-theme-popover-foreground': { color: 'hsl(var(--popover-foreground))' },
    '.text-theme-primary-foreground': { color: 'hsl(var(--primary-foreground))' },
    '.text-theme-secondary-foreground': { color: 'hsl(var(--secondary-foreground))' },
    '.text-theme-muted-foreground': { color: 'hsl(var(--muted-foreground))' },
    '.text-theme-accent-foreground': { color: 'hsl(var(--accent-foreground))' },
    '.text-theme-destructive-foreground': { color: 'hsl(var(--destructive-foreground))' },
    '.text-theme-disabled-foreground': { color: 'var(--disabled-foreground)' },
  });

  // Border colors based on theme variables
  addUtilities({
    '.border-theme-border': { borderColor: 'hsl(var(--border))' },
    '.border-theme-input': { borderColor: 'hsl(var(--input))' },
    '.border-theme-primary': { borderColor: 'hsl(var(--primary))' },
    '.border-theme-destructive': { borderColor: 'hsl(var(--destructive))' },
  });

  // Ring/outline colors based on theme variables
  addUtilities({
    '.ring-theme-ring': { boxShadow: '0 0 0 2px hsl(var(--ring))' },
    '.ring-theme-primary': { boxShadow: '0 0 0 2px hsl(var(--primary))' },
    '.ring-theme-destructive': { boxShadow: '0 0 0 2px hsl(var(--destructive))' },
  });

  // Combined background/text utilities for common component patterns
  addUtilities({
    '.btn-theme-primary': { 
      backgroundColor: 'hsl(var(--primary))', 
      color: 'hsl(var(--primary-foreground))' 
    },
    '.btn-theme-secondary': { 
      backgroundColor: 'var(--secondary)', 
      color: 'hsl(var(--secondary-foreground))' 
    },
    '.btn-theme-destructive': { 
      backgroundColor: 'hsl(var(--destructive))', 
      color: 'hsl(var(--destructive-foreground))' 
    },
    '.btn-theme-disabled': { 
      backgroundColor: 'var(--disabled)', 
      color: 'var(--disabled-foreground)',
      cursor: 'not-allowed'
    },
  });
}); 
