'use client';

import { TypographyH1, TypographyH2, TypographyLink, TypographyList, TypographyP } from '@/components/ui/typography';

import React from 'react';
import { useTheme } from 'next-themes';

/**
 * Example component demonstrating usage of the design system
 * 
 * This component shows:
 * 1. Using CSS variables via Tailwind classes
 * 2. Using the theme hook for toggling
 * 3. Using the custom Tailwind utilities
 */
export const DesignSystemExample = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  // Check if the resolved theme is dark
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className="bg-theme-background min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-theme-foreground">
          Design System Example
        </h1>
        
        {/* Theme information */}
        <div className="bg-theme-card p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2 text-theme-card-foreground">
            Current Theme
          </h2>
          <p className="text-theme-muted-foreground mb-4">
            The application is currently using the <span className="font-medium">{theme}</span> theme.
            Effective mode: <span className="font-medium">{isDark ? 'Dark' : 'Light'}</span>
          </p>
          <p className="text-theme-muted-foreground mb-4">
            Primary color: <code className="bg-theme-muted px-2 py-1 rounded text-sm">hsl(var(--primary))</code>
          </p>
          
          <button 
            onClick={toggleTheme}
            className="btn-theme-primary px-4 py-2 rounded-md transition-all duration-200"
          >
            Toggle Theme
          </button>
        </div>
        
        {/* Custom variant examples */}
        <div className="bg-theme-card p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-theme-card-foreground">
            Radix UI Variants
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 rounded-md border border-theme-border radix-hover:bg-primary radix-hover:text-primary-foreground radix-hover:border-primary">
              Hover me
            </button>
            
            <button className="px-4 py-2 rounded-md border border-theme-border radix-active:bg-primary radix-active:text-primary-foreground">
              Active me
            </button>
            
            <select className="px-4 py-2 rounded-md border border-theme-border">
              <option value="1">Option with radix-selected variant</option>
              <option value="2">Another option</option>
            </select>
          </div>
        </div>
        
        {/* Calendar styles example */}
        <div className="bg-theme-card p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-theme-card-foreground">
            Calendar Button Style
          </h2>
          
          <button 
            aria-label="Pick a date"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-theme-border"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
        
        {/* Animation examples */}
        <div className="bg-theme-card p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-theme-card-foreground">
            Animation Classes
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="animate-fadeIn p-4 bg-theme-accent text-theme-accent-foreground rounded-md">
              Fade In Animation
            </div>
            
            <div className="pulse-highlight p-4 text-theme-foreground rounded-md">
              Pulse Highlight Animation
            </div>
            
            <div className="animate-result-reveal p-4 bg-theme-primary text-theme-primary-foreground rounded-md">
              Result Reveal Animation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example component showcasing accessible design patterns
 * 
 * This component demonstrates how to implement proper accessibility using
 * our design system components, typography, and color contrast guidelines.
 */
export default function AccessibilityExample() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <header>
        <TypographyH1>Accessibility Best Practices</TypographyH1>
        <TypographyP className="text-muted-foreground">
          This example demonstrates proper accessibility implementation including semantic HTML,
          keyboard navigation, color contrast, and ARIA attributes.
        </TypographyP>
      </header>

      <section className="space-y-4" aria-labelledby="typography-section">
        <TypographyH2 id="typography-section">1. Semantic Typography</TypographyH2>
        <TypographyP>
          Always use semantic HTML elements with proper heading hierarchy. Our typography
          components ensure consistent text sizing while maintaining semantic markup.
        </TypographyP>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card">
          <div>
            <h3 className="text-lg font-medium mb-2">Before</h3>
            <div className="border rounded-md p-3 bg-secondary">
              <code className="block whitespace-pre-wrap text-sm font-mono">
{`<div className="text-2xl font-bold">Title</div>
<div className="text-lg">Subtitle</div>
<div>Regular text</div>`}
              </code>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">After</h3>
            <div className="border rounded-md p-3 bg-secondary">
              <code className="block whitespace-pre-wrap text-sm font-mono">
{`<TypographyH1>Title</TypographyH1>
<TypographyH2>Subtitle</TypographyH2>
<TypographyP>Regular text</TypographyP>`}
              </code>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="color-contrast-section">
        <TypographyH2 id="color-contrast-section">2. Color Contrast</TypographyH2>
        <TypographyP>
          All colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
          We&apos;ve improved contrast ratios throughout the application.
        </TypographyP>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-primary">
            <span className="text-primary-foreground font-medium">
              Primary + Primary Foreground (Enhanced)
            </span>
          </div>
          <div className="border rounded-lg p-4 bg-secondary">
            <span className="text-secondary-foreground font-medium">
              Secondary + Secondary Foreground (Enhanced)
            </span>
          </div>
          <div className="border rounded-lg p-4 bg-muted">
            <span className="text-muted-foreground font-medium">
              Muted + Muted Foreground (Enhanced)
            </span>
          </div>
          <div className="border rounded-lg p-4 bg-destructive">
            <span className="text-destructive-foreground font-medium">
              Destructive + Destructive Foreground
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="keyboard-nav-section">
        <TypographyH2 id="keyboard-nav-section">3. Keyboard Navigation</TypographyH2>
        <TypographyP>
          All interactive elements must be focusable and have clear focus indicators.
          Try tabbing through these elements:
        </TypographyP>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
            Secondary Button
          </button>
          <TypographyLink href="#">Accessible Link</TypographyLink>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="aria-attributes-section">
        <TypographyH2 id="aria-attributes-section">4. ARIA Attributes</TypographyH2>
        <TypographyP>
          Use ARIA attributes to enhance semantic HTML when needed. All sections on this page
          have proper aria-labelledby attributes.
        </TypographyP>
        <div className="border rounded-lg p-4 bg-card">
          <div role="alert" aria-live="assertive" className="border border-destructive bg-destructive/10 p-3 rounded-md text-destructive">
            This is an example alert with role=&quot;alert&quot; and aria-live=&quot;assertive&quot;
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="touch-targets-section">
        <TypographyH2 id="touch-targets-section">5. Touch Targets</TypographyH2>
        <TypographyP>
          All interactive elements have a minimum size of 44x44 pixels for touch accessibility:
        </TypographyP>
        <div className="flex flex-wrap gap-4">
          <button className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-primary text-primary-foreground rounded-md px-4">
            44×44px
          </button>
          <a href="#" className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-secondary text-secondary-foreground rounded-md px-4">
            Link Button
          </a>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="checklist-section">
        <TypographyH2 id="checklist-section">Accessibility Checklist</TypographyH2>
        <TypographyP>
          Use this checklist for all new components and features:
        </TypographyP>
        <TypographyList>
          <li>Semantic HTML elements used appropriately</li>
          <li>Color contrast meets WCAG AA guidelines (4.5:1)</li>
          <li>All interactive elements are keyboard accessible</li>
          <li>Focus indicators are clearly visible</li>
          <li>Touch targets are at least 44×44 pixels</li>
          <li>ARIA attributes used correctly when needed</li>
          <li>Text uses consistent size utilities (text-base, text-lg)</li>
          <li>All images have alt text</li>
        </TypographyList>
      </section>
    </div>
  );
} 
