# CSS Architecture

This document outlines the CSS architecture for the BillSplitter application.

## Structure

The CSS has been modularized into logical parts:

```
styles/
├── globals.css       # Imports all modular CSS files
├── base.css          # Resets, typography, html/body rules
├── themes.css        # SINGLE SOURCE OF TRUTH for theme variables
├── components.css    # Component-specific styling
├── forms.css         # Inputs, selects, validation styles
├── calendar.css      # Calendar and date picker styling
└── animations.css    # Keyframes and transitions
```

## ⚠️ IMPORTANT: Single Source of Truth ⚠️

`themes.css` is the SINGLE SOURCE OF TRUTH for all theme variables. Always:

1. Define color variables ONLY in themes.css
2. Use CSS variables from themes.css in all components and styles
3. NEVER override these variables in inline styles or other CSS files
4. Follow the UI/UX Documentation guide for design consistency

## Recent Refactoring Changes

The CSS codebase has undergone significant refactoring:

1. **Removed All `!important` Declarations**
   - Improved specificity through better selectors
   - Created consistent class hierarchy
   - Used more specific selectors when needed
   
2. **Consolidated Theme Management**
   - Removed custom useTheme.ts hook in favor of next-themes
   - Integrated theme toggling with next-themes library
   - Added appropriate ThemeProvider configuration
   - Improved theme initialization to prevent flashes

3. **Implemented Z-Index Scale**
   - Added z-index variables in themes.css (`--z-negative`, `--z-base`, `--z-dropdown`, etc.)
   - Used these variables consistently across all CSS files
   - Ensured proper layering of UI elements

4. **Enhanced Documentation**
   - Added comprehensive comments to all CSS files
   - Grouped related styles with descriptive comment blocks
   - Explained complex selectors and their purpose

5. **Form Error Handling**
   - Created a standardized `.form-error-message` class in globals.css
   - Updated all error displays to use this consistent approach

## CSS Documentation Style

All CSS files now follow a consistent documentation pattern:

```css
/*
 * SECTION NAME
 * Brief description of the purpose of this section
 * Any important details about the approach or implementation
 */

/* Individual rule description */
.selector {
  property: value;
}
```

This makes the purpose of complex selectors clear and helps maintain the codebase over time.

## Style Guide

Visit `/en/style-guide` to see all UI components and theme variables in action. This page is a visual reference to ensure consistency.

## Best Practices

1. **Follow the Single Responsibility Principle**
   - Keep each CSS file focused on a specific concern
   - Do not add button styles to `calendar.css`, etc.

2. **Use CSS Variables**
   - Always use theme variables for colors, spacing, etc.
   - Reference them with `var(--variable-name)` or `hsl(var(--variable-name))` for HSL values

3. **Avoid `!important`**
   - NEVER use `!important` declarations
   - Use proper selector specificity instead
   - Group related style rules together

4. **Use Tailwind Classes First**
   - Prefer Tailwind utility classes when possible
   - Only use custom CSS for complex or repeated patterns

5. **Custom Variants**
   - Use the custom Radix UI variants for component states:
     ```jsx
     <button className="radix-hover:bg-primary radix-hover:text-white">...</button>
     ```

6. **Theme Utilities**
   - Use the provided theme utilities for direct CSS variable access:
     ```jsx
     <div className="bg-theme-background text-theme-foreground">...</div>
     ```

## Theme Tokens

Theme tokens are defined in `styles/themes.css` (CSS variables for styling).

**NEVER** override these variables in other CSS files or inline styles.

## Component Specific Styles

When adding component-specific styles:

1. First, try to use Tailwind utility classes
2. If the pattern is repeated, consider using a Tailwind plugin or Theme utility
3. For complex components, add styles to the appropriate CSS module
4. Always reference colors using the theme variables, never hardcode colors

## Z-Index Scale

We use a consistent z-index scale defined in `themes.css`:

```css
:root {
  --z-negative: -1;     /* Below normal content */
  --z-base: 0;          /* Normal content */
  --z-overlay: 10;      /* Overlays on content */
  --z-dropdown: 20;     /* Dropdowns and menus */
  --z-sticky: 30;       /* Sticky headers/footers */
  --z-fixed: 40;        /* Fixed position elements */
  --z-tooltip: 50;      /* Tooltips */
  --z-popover: 60;      /* Popovers and dialogs */
  --z-modal: 70;        /* Modal dialogs */
  --z-toast: 80;        /* Toast notifications */
  --z-max: 9999;        /* Maximum (rarely used) */
}
```

Always use these variables for z-index values to ensure proper layering.

## Avoiding Common Styling Issues

1. **Inline Styles**
   - Avoid using inline styles that override theme variables: `style={{ color: '#0284C7' }}`
   - Instead use: `className="text-primary"`

2. **Inconsistent Button Styling**
   - Always use the standard button classes
   - For primary: `className="bg-primary text-primary-foreground"`  
   - For secondary: `className="bg-secondary text-secondary-foreground"`

3. **Shadow System**
   - Use the shadow classes defined in the theme:
   - `className="card-level-1"` through `"card-level-5"`

4. **Responsive Design**
   - Ensure components look good on all screen sizes
   - Test on mobile, tablet, and desktop viewports

## Tailwind Plugins

Custom Tailwind plugins are in `src/design/plugins/`:

- `radix-variants.js` - Adds variants for Radix UI states
- `theme-vars.js` - Generates utility classes for theme variables

## Theme Toggling

For client-side theme toggling, use the `useTheme` hook from next-themes:

```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button onClick={toggleTheme}>
      Toggle theme (currently: {theme})
    </button>
  );
}
```

## Accessibility

All styles have been updated to ensure WCAG AA compliance:

1. Sufficient color contrast (minimum 4.5:1 for normal text, 3:1 for large text)
2. Visible focus states for all interactive elements
3. Proper text sizing and spacing
4. Color is never used as the only means of conveying information

## Form Error Handling

All form errors now use a consistent approach:

1. A standard `.form-error-message` class for styling error messages
2. Consistent error icons and colors
3. Clear validation feedback for users

# Styling Guide

This directory contains the CSS files that define the styling for the application.

## File Structure

- `themes.css`: Defines the color variables for light and dark modes.
- `base.css`: Base styles, resets, and typography.
- `components.css`: Component-specific styling.
- `calendar.css`: Calendar and date picker styling.
- `forms.css`: Form elements styling.

## Styling Approach

Our application uses a combination of:

1. **CSS Variables**: Defined in `themes.css` as the single source of truth for colors and other theme values.
2. **Tailwind CSS**: For utility-based styling. Configured in `tailwind.config.js` to use our CSS variables.
3. **Component-specific CSS**: For styles that can't be easily achieved with Tailwind.

## Best Practices

### Color Usage

- **Always use CSS variables for colors**, never hardcoded hex values or RGB colors.
- Access color variables using HSL: `hsl(var(--primary))` or through Tailwind: `bg-primary`
- Ensure all colors are accessible with sufficient contrast (WCAG AA minimum).

### CSS Specificity

- Avoid using `!important` declarations. They break the natural cascade and make styles difficult to maintain.
- Instead, use more specific selectors or adjust the CSS structure.
- If you need to override a style, consider:
  - Adding more specificity to your selector
  - Adjusting the order of CSS rules
  - Examining why the style needs to be overridden in the first place

### Responsive Design

- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for responsive styling.
- Test on different viewport sizes regularly.

### Dark Mode

- Use `.dark` class as a parent selector for dark-mode-specific styles.
- Prefer to use the theme variables which automatically adjust for dark mode.
- Test all components in both light and dark mode.

### Performance

- Minimize deeply nested selectors.
- Group related styles together.
- Consider the performance impact of very complex selectors.

## Theme Variables

Theme variables are defined in `themes.css` and provide a consistent way to apply colors across the application. These variables are used by Tailwind through the `tailwind.config.js` file.

Example usage:

```css
/* Direct CSS usage */
.my-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Or in Tailwind classes */
<div class="bg-primary text-primary-foreground">...</div>
``` 
