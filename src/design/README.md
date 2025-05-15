# Design System

This directory contains the BillSplitter design system implementation. It provides a structured approach to maintaining consistent styling, components, and theming across the application.

## Directory Structure

```
design/
└── plugins/
    ├── radix-variants.js  # Tailwind plugin for Radix UI state variants
    └── theme-vars.js      # Tailwind plugin for theme variable utilities
```

## Recent Refactoring Changes

The design system has undergone significant refactoring:

1. **Consolidated Theme Management**
   - Removed custom useTheme.ts hook in favor of next-themes
   - Using the built-in capabilities of next-themes exclusively
   - Improved theme initialization to prevent flashes during page load

2. **Implemented Z-Index Scale**
   - Added consistent z-index variables in themes.css
   - Created a logical layering system for UI elements
   - Prevents z-index wars and overlay conflicts

3. **Enhanced Documentation**
   - Improved commenting throughout the CSS files
   - Added clear section headers to group related styles
   - Documented complex selectors and component interactions

## Usage

### Theme Variables

All theme variables are defined in `src/styles/themes.css` as CSS variables. These are the single source of truth for all theme-related values.

```css
:root {
  --primary: 201 98% 35%;
  --primary-foreground: 0 0% 100%;
  /* ... other variables */
}

.dark {
  --primary: 201 98% 40%;
  --primary-foreground: 0 0% 100%;
  /* ... dark mode overrides */
}
```

### Theme Management

For theme management, we use the `next-themes` library. This provides a `useTheme` hook that handles theme switching, system preferences, and persistent storage:

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Z-Index Scale

We use a standardized z-index scale to ensure proper layering of UI elements:

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

Always use these variables for z-index values to maintain a consistent stacking order.

### Tailwind Theme Extension

Our theme variables are mapped to Tailwind's theme system in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        // ... other colors
      },
      // ... other theme extensions
    }
  }
}
```

### Custom Plugins

We use custom Tailwind plugins to extend functionality:

1. **Radix UI Variants**: Adds variants for Radix UI component states:
   - `radix-hover:bg-primary` - Applies when a Radix component is hovered
   - `radix-active:text-white` - Applies when a Radix component is active
   - `radix-selected:bg-primary` - Applies when a Radix component is selected

2. **Theme Variables**: Adds direct CSS variable access utilities:
   - `bg-theme-primary` - Sets background-color to `var(--primary)`
   - `text-theme-foreground` - Sets color to `var(--foreground)`

## Best Practices

1. **Always use theme variables** - Never hardcode colors or other design values
2. **Always use Tailwind utilities first** - Only use custom CSS for complex patterns
3. **Follow the component library patterns** - See `src/components/ui/` for examples
4. **Maintain consistency across themes** - Ensure all components work in light and dark modes
5. **Never use !important** - Use proper selector specificity instead
6. **Use the z-index scale** - For consistent layering of UI elements

## Relationship to UI Components

This design system provides the foundation for the UI component library in `src/components/ui/`. The UI components should:

1. Use the theme tokens and variables from this design system
2. Utilize the Tailwind plugins and utilities
3. Maintain consistency with the design principles defined here 

## Accessibility

See `ACCESSIBILITY.md` for detailed accessibility guidelines. Key points:

1. Ensure sufficient color contrast (WCAG AA minimum)
2. Provide clear focus indicators
3. Use semantic HTML
4. Test with keyboard navigation 
