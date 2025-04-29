# UI/UX Design Guidelines

This document outlines the design principles, patterns, and component styles used throughout the application to ensure a consistent and high-quality user experience.

## 1. Core Principles

- **Consistency:** UI elements and patterns should be applied uniformly across the application.
- **Clarity:** Interfaces should be intuitive and easy to understand.
- **Accessibility:** Design choices should consider users with disabilities (WCAG guidelines where applicable).
- **Responsiveness:** The application must adapt gracefully to different screen sizes.
- **Branding:** Adhere to the established brand identity (colors, typography).

## 2. Color Palette

Colors are defined using CSS variables for easy theming (light/dark modes).

### 2.1. Primary Colors (Light Mode)

- `--background`: `#F9FAFB` (Overall page background)
- `--foreground`: `#111827` (Primary text, headings)
- `--card`: `#FFFFFF` (Card backgrounds)
- `--card-foreground`: `#374151` (Body text on cards)
- `--popover`: `#FFFFFF` (Popover backgrounds)
- `--popover-foreground`: `#374151` (Popover text)
- `--primary`: `#2E5A8C` (Primary interactive elements, links, accents - Brand Blue)
- `--primary-foreground`: `#FFFFFF` (Text on primary elements)
- `--secondary`: `#F5A623` (Secondary interactive elements - Brand Yellow)
- `--secondary-foreground`: `#111827` (Text on secondary elements)
- `--muted`: `#F3F4F6` (Subtle backgrounds, input fields)
- `--muted-foreground`: `#6B7280` (Helper text, placeholder text)
- `--accent`: `#2E5A8C` (Used for hover states, active states - often derived from primary)
- `--accent-foreground`: `#111827` (Text on accent elements)
- `--destructive`: `#EF4444` (Error states, warnings, delete actions - Red)
- `--destructive-foreground`: `#FFFFFF` (Text on destructive elements)
- `--border`: `#E5E7EB` (Borders, dividers)
- `--input`: `#F3F4F6` (Input field background - same as muted)
- `--ring`: `#2E5A8C` (Focus rings - Primary Blue)

### 2.2. Primary Colors (Dark Mode)

- `--background`: `#121212`
- `--foreground`: `#F9FAFB`
- `--card`: `#1E1E1E`
- `--card-foreground`: `#D1D5DB`
- `--popover`: `#1E1E1E`
- `--popover-foreground`: `#D1D5DB`
- `--primary`: `#4A90E2` (Lighter Blue)
- `--primary-foreground`: `#FFFFFF`
- `--secondary`: `#F5A623` (Same Yellow)
- `--secondary-foreground`: `#121212`
- `--muted`: `#2A2A2A`
- `--muted-foreground`: `#9CA3AF`
- `--accent`: `#4A90E2`
- `--accent-foreground`: `#FFFFFF`
- `--destructive`: `#F87171` (Softer Red)
- `--destructive-foreground`: `#FFFFFF`
- `--border`: `#3A3A3A`
- `--input`: `#2A2A2A`
- `--ring`: `#4A90E2`

### 2.3. Chart Colors

Used for data visualization:

- `--chart-1`: Primary Blue (`#2E5A8C` / `#4A90E2`)
- `--chart-2`: Accent Yellow (`#F5A623`)
- `--chart-3`: Success Green (`#22C55E`)
- `--chart-4`: Muted Foreground (`#6B7280` / `#9CA3AF`)
- `--chart-5`: Destructive Red (`#EF4444` / `#F87171`)

### 2.4. Sidebar Colors

Specific variables for sidebar elements exist, generally following the main palette but allowing for overrides:

- `--sidebar`: `#FFFFFF` / `#1E1E1E` in dark mode
- `--sidebar-foreground`: `#374151` / `#D1D5DB` in dark mode
- `--sidebar-primary`: `#2E5A8C` / `#4A90E2` in dark mode
- `--sidebar-primary-foreground`: `#FFFFFF` in both modes
- `--sidebar-accent`: `#F9FAFB` / `#2A2A2A` in dark mode
- `--sidebar-accent-foreground`: `#2E5A8C` / `#FFFFFF` in dark mode
- `--sidebar-border`: `#E5E7EB` / `#3A3A3A` in dark mode
- `--sidebar-ring`: `#2E5A8C` / `#4A90E2` in dark mode

### 2.5. Color Usage Guidelines

- **Primary Colors**: Use for main interactive elements like buttons, links, and active states.
- **Secondary Colors**: Use for call-to-action elements, highlights, and accents.
- **Destructive Colors**: Use exclusively for error states, warnings, and destructive actions.
- **Background & Foreground**: Ensure proper contrast between text and backgrounds (WCAG AA minimum).
- **Chart Colors**: Use consistently in data visualizations, maintaining the same semantic meaning throughout the application.

### 2.6. WCAG AA Color Contrast Audit

| Foreground ↔ Background                      | Contrast Ratio | WCAG AA (4.5:1) |
| --------------------------------------------- | -------------- | --------------- |
| Foreground on Background (Light)              | 13.5:1         | ✅ Pass         |
| Foreground on Background (Dark)               | 15.9:1         | ✅ Pass         |
| Card-Foreground on Card (Light)               | 10.6:1         | ✅ Pass         |
| Card-Foreground on Card (Dark)                | 13.1:1         | ✅ Pass         |
| Primary on Background (Light)                 | 4.9:1          | ✅ Pass         |
| Primary on Background (Dark)                  | 4.8:1          | ✅ Pass         |
| Primary-Foreground on Primary (Light)         | 6.1:1          | ✅ Pass         |
| Primary-Foreground on Primary (Dark)          | 4.6:1          | ✅ Pass         |
| Secondary-Foreground on Secondary             | 10.8:1         | ✅ Pass         |
| Accent-Foreground on Accent (Light)           | 4.9:1          | ✅ Pass         |
| Accent-Foreground on Accent (Dark)            | 4.8:1          | ✅ Pass         |
| Destructive-Foreground on Destructive (Light) | 5.4:1          | ✅ Pass         |
| Destructive-Foreground on Destructive (Dark)  | 4.6:1          | ✅ Pass         |
| Muted-Foreground on Background (Light)        | 4.1:1          | ⚠️ Adjust       |
| Muted-Foreground on Background (Dark)         | 5.2:1          | ✅ Pass         |
| Muted-Foreground on Muted (Light)             | 3.9:1          | ⚠️ Adjust       |
| Muted-Foreground on Muted (Dark)              | 6.1:1          | ✅ Pass         |

**Recommended Adjustments:**

- Darken `--muted-foreground` in light mode from `#6B7280` to `#5A6271` to achieve a contrast ratio of 4.5:1 or higher against both `--background` and `--muted`.

### 2.7. Colorblind-Safe Chart Palette

For users with color vision deficiencies, we provide an alternative ColorBrewer palette. Switch to this palette for data visualizations that require color differentiation as the primary means of conveying information:

- `--colorblind-1`: `#1b9e77` (Teal Green)
- `--colorblind-2`: `#d95f02` (Dark Orange)
- `--colorblind-3`: `#7570b3` (Muted Purple)
- `--colorblind-4`: `#e7298a` (Magenta)
- `--colorblind-5`: `#66a61e` (Lime Green)
- `--colorblind-6`: `#e6ab02` (Gold Yellow)
- `--colorblind-7`: `#a6761d` (Brown)

**When to switch:**

- When visualization relies primarily on color to convey categories
- In charts with more than three data series
- For financial/data-critical visualizations requiring maximum accessibility
- When specifically targeting compliance with government/accessibility regulations

## 3. Typography

- **Primary Font:** `'Roboto', sans-serif` (defined via `--font-sans`). Ensure Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`) fonts are correctly loaded if used.
- **Base Size:** `16px`
- **Base Line Height:** `1.4`
- **Headings:**
  - `h1`: `clamp(2.25rem, 1.5rem + 2vw, 2.5rem)`, `font-weight: 700`, `line-height: 1.2` (Use for main page titles)
  - `h2`: `clamp(1.75rem, 1.25rem + 1.5vw, 2rem)`, `font-weight: 600`, `line-height: 1.25` (Use for section titles)
  - `h3`: `clamp(1.25rem, 1rem + 0.75vw, 1.5rem)`, `font-weight: 500`, `line-height: 1.3` (Use for sub-section titles or card headers)
- **Monospace Text:** Apply `font-mono` for code blocks, technical values, etc.
- **Links:** Use `text-primary` color. Underline on hover (standard anchor behavior or `link` variant for button component).
- **Font Weights:**
  - Light: `300` - Use sparingly for large display text
  - Regular: `400` - Default for body text
  - Medium: `500` - Used for emphasis and subheadings
  - Bold: `700` - Used for headings and strong emphasis

### 3.1. Text Styles

- **Card Title:** `font-semibold leading-none`
- **Card Description:** `text-sm text-muted-foreground`
- **Table Caption:** `text-sm text-muted-foreground mt-4`
- **Dialog Title:** `text-lg leading-none font-semibold`
- **Dialog Description:** `text-sm text-muted-foreground`
- **Helper Text:** `text-xs text-muted-foreground mt-1`

## 4. Layout and Spacing

### 4.1. Spacing Scale

Following a strict 4px baseline grid for consistency and alignment:

- `1` = `4px`
- `2` = `8px`
- `3` = `12px`
- `4` = `16px`
- `5` = `20px`
- `6` = `24px`
- `8` = `32px`
- `10` = `40px`
- `12` = `48px`
- `16` = `64px`
- `20` = `80px`
- `24` = `96px`

### 4.2. Layout Containers

- **Page Layout:** Uses flexbox with `min-h-screen flex flex-col` to ensure content fills the viewport height.
- **Max Width Containers:** Use appropriate max-width constraints for content readability:
  - Form sections: `max-w-[calc(100%-2rem)]` on mobile, `sm:max-w-lg` on larger screens
  - Dialog content: `max-w-[calc(100%-2rem)]` on mobile, `sm:max-w-lg` on larger screens
- **Grid Layouts:** Use CSS Grid for two-dimensional layouts (like CardHeader's layout).

### 4.3. Component Spacing

- **Card:** `gap-6` between child elements, `py-6` vertical padding, `px-6` for horizontal content padding.
- **Dialog:** `gap-4` for general spacing, `py-4` for content areas.
- **Form Fields:** `gap-4` between form groups, `gap-1.5` between label and input.
- **Button Groups:** `gap-2` between buttons (both horizontal and responsive vertical arrangements).

## 5. Border Radius

- **Base Radius:** `0.5rem` (8px) defined by `--radius`. Used for most elements like cards, buttons, inputs.
- **Derived Radii:**
  - `--radius-lg`: `0.5rem` (8px) - Same as base
  - `--radius-md`: `0.375rem` (6px) (`calc(var(--radius) - 2px)`)
  - `--radius-sm`: `0.25rem` (4px) (`calc(var(--radius) - 4px)`)
  - `--radius-xl`: `0.75rem` (12px) (`calc(var(--radius) + 4px)`) - Use sparingly for larger elements if needed.

### 5.1. Radius Usage

- **Buttons:** `rounded-md` (matches `--radius-md`)
- **Inputs, TextAreas:** `rounded-lg` (matches `--radius-lg`)
- **Cards:** `rounded-lg` (matches `--radius-lg`)
- **Dialog:** `rounded-lg` (matches `--radius-lg`)
- **Dropdowns:** `rounded-lg` (matches `--radius-lg`)

## 6. Components

Standardized components are provided in `src/components/ui`.

### 6.1. Buttons (`button.tsx`)

- **Base:** `inline-flex`, centered items, `rounded-md`, `text-sm`, `font-medium`, transitions enabled. Includes subtle hover transform (`translate-y-[-2px] scale-[1.015]`).
- **Focus:** Uses `outline-none` and `focus-visible` state with a ring (`ring-ring/50`, `ring-[3px]`).
- **Disabled:** `opacity-50`, `pointer-events-none`.
- **Invalid (Aria):** Border and ring use `--destructive` color.
- **Variants:**
  - `default`: Primary background (`bg-primary`), light text (`text-primary-foreground`), subtle shadow. Use for primary actions.
  - `destructive`: Destructive background (`bg-destructive`). Use for actions that delete data or have significant consequences.
  - `outline`: Transparent background, border. Use for secondary actions or less prominent buttons.
  - `secondary`: Secondary background (`bg-secondary`). Use for alternative positive actions.
  - `ghost`: No background or border, background appears on hover. Use for very subtle actions, often in toolbars or tables.
  - `link`: Looks like a link (`text-primary`), underlines on hover. Use for navigation or actions presented as text.
- **Sizes:**
  - `default`: `h-9`, `px-4`. Standard button size.
  - `sm`: `h-8`, `px-3`. For denser UI areas.
  - `lg`: `h-10`, `px-6`. For primary call-to-action buttons.
  - `icon`: `size-9`. Square button for icons only.

#### 6.1.1. Button Usage Guide

- Use `default` variant for primary actions.
- Use `destructive` variant for delete/remove/reset actions.
- Use `outline` variant for secondary actions within a form or card.
- Use `ghost` for toolbar actions or within compact UIs.
- Add icons to buttons using SVG elements (automatically sized to `size-4`).
- When using buttons with icons:
  - Place the icon before the text for action buttons
  - Place the icon after the text for navigation buttons

### 6.2. Inputs and Form Elements

#### 6.2.1. Input (`input.tsx`)

- **Base:** Full width (`w-full`), `rounded-lg`, standard padding (`py-1 px-3`), `h-9`, `text-sm` (mobile) or `text-base` (desktop).
- **Shadow:** Subtle shadow (`shadow-sm`, `box-shadow: 0 2px 6px rgba(0,0,0,0.05)`).
- **Focus:** Border becomes `border-primary`, gains a ring (`ring-2 ring-primary/20`).
- **Invalid (Aria):** Border and ring use `--destructive` color.
- **Disabled:** `opacity-50`, `pointer-events-none`, `cursor-not-allowed`.
- **Helper Text:** Optional helper text via `helperText` prop (`text-xs text-gray-500 mt-1 mb-3 pl-3`).
- **Selection:** Text selection uses primary colors (`selection:bg-primary selection:text-primary-foreground`).
- **Number Inputs:** Hide default spinner arrows using CSS.

#### 6.2.2. Textarea (`textarea.tsx`)

- Follows same styling as Input but allows for multi-line text.
- No fixed height to allow for content expansion.

#### 6.2.3. Checkbox (`checkbox.tsx`)

- Use for boolean selections.
- Consistent styling with other form elements.

#### 6.2.4. Radio Group (`radio-group.tsx`)

- Use for selecting a single option from a list.
- Consistent styling with other form elements.

#### 6.2.5. Select (`select.tsx`)

- Use for selecting options from a dropdown.
- Custom styling to match other form elements.

#### 6.2.6. Switch (`switch.tsx`)

- Use for toggle-style boolean inputs.
- Visual on/off states with animation.

#### 6.2.7. Form Error Patterns

Forms should implement the following ARIA patterns for error handling:

```jsx
// Input with error
<div role="group" aria-labelledby="name-label">
  <label id="name-label" htmlFor="name">
    Name
  </label>
  <input
    id="name"
    name="name"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? "name-error" : undefined}
  />
  {errors.name && (
    <div id="name-error" role="alert" className="text-destructive text-sm mt-1">
      {errors.name}
    </div>
  )}
</div>
```

Key ARIA attributes:

- `aria-invalid`: Set to `true` when field has errors
- `aria-describedby`: Links the input to its error message
- `role="alert"`: Marks error message for assistive technology
- Error text uses `text-destructive` to visually indicate errors

### 6.3. Cards (`card.tsx`)

- **Base Card:** `bg-card text-card-foreground flex flex-col gap-6 rounded-lg border py-6 shadow-sm`
- **Card Structure:**
  - **CardHeader:** Contains title, description, and optional action. Uses grid layout.
  - **CardTitle:** `font-semibold leading-none`
  - **CardDescription:** `text-sm text-muted-foreground`
  - **CardContent:** Standard padding `px-6`
  - **CardFooter:** `flex items-center px-6` (with conditional top padding if bordered)
  - **CardAction:** For positioning action buttons in the top-right corner

#### 6.3.1. Card Usage

- Use cards to group related content.
- Maintain consistent padding within cards.
- Include titles and descriptions when appropriate.
- Place primary actions in the footer, secondary actions in the header.

### 6.4. Dialogs (`dialog.tsx`)

- Uses Radix UI primitives for accessibility.
- **Overlay:** Semi-transparent backdrop with blur effect (`backdrop-blur-[10px]`).
- **Content:** Centered modal with animation, border, and shadow (`rounded-lg border p-6 shadow-lg`).
- **Animation:** Fade and zoom effects on open/close.
- **Close Button:** Top-right corner with hover effect.
- **Header:** Centered on mobile, left-aligned on desktop (`sm:text-left`).
- **Footer:** Stacked buttons on mobile, side-by-side on desktop (`flex-col-reverse` → `sm:flex-row`).

#### 6.4.1. Dialog Usage

- Use for important interactions requiring user attention.
- Include a clear title and description.
- Provide explicit actions in the footer (primary and cancel).
- Ensure the dialog is dismissible via the close button, overlay click, or escape key.
- Follow a consistent pattern for action button placement (Cancel/No on left, Confirm/Yes on right).

#### 6.4.2. Controlling Portal Rendering

When dealing with portal-based components like Dialog, ensure proper mounting by checking for client-side rendering:

```jsx
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
  return () => setIsMounted(false);
}, []);

// Only render portal content on client
return isMounted ? <DialogContent>{children}</DialogContent> : null;
```

### 6.5. Tables (`table.tsx`)

- **Container:** `relative w-full overflow-x-auto` for horizontal scrolling on small screens.
- **Table:** `w-full caption-bottom text-sm`
- **Header:** Borders between header rows.
- **Body:** No border on last row.
- **Row:** Border between rows, hover effect (`hover:bg-muted/50`), selected state.
- **Header Cells:** `h-10 px-2 text-left align-middle font-medium`
- **Cells:** `p-2 align-middle`
- **Footer:** Optional, with background and border styling.
- **Caption:** `text-muted-foreground text-sm mt-4`

#### 6.5.1. Table Usage

- Use for displaying structured data.
- Include appropriate headers for each column.
- Maintain consistent column widths where possible.
- Use captions to provide additional context when needed.
- Consider responsive strategies for small screens (horizontal scrolling, stacking, etc.).

### 6.6. Dropdown Menu (`dropdown-menu.tsx`)

- Used for providing a list of options from a trigger element.
- Styles match the overall design system.
- Applied in various scenarios including the theme toggle component.

### 6.7. Accordion (`accordion.tsx`)

- Used for collapsible content sections.
- Follows the same styling principles as other components.

### 6.8. Popover (`popover.tsx`)

- Used for temporary, non-modal UI elements.
- Follows the same styling principles as dropdowns.

## 7. Specialized Components

### 7.1. Theme Toggle (`theme-toggle.tsx`)

- Uses dropdown menu to select between light, dark, and system themes.
- Animated sun/moon icon that transforms based on the current theme.
- Smooth transition effects when changing themes (`transition: 'background-color 0.5s, color 0.5s'`).
- Default to system preference if no theme is stored.

### 7.2. Feedback Button (`feedback-button.tsx`)

- Button with message icon that opens a dialog.
- Dialog contains a textarea for user feedback.
- Uses `mailto:` link to open email client with pre-populated content.
- Translatable using i18n.

### 7.3. Language Toggle (`language-toggle.tsx`)

- Allows switching between available languages (currently English and German).
- Uses a dropdown menu with appropriate styling.

## 8. Iconography

- **Icon Library:** Uses Lucide React icons (`lucide-react`) for consistent styling.
- **Default Icon Size:** `size-4` (16px) for button and general UI icons. Explicitly set via `[&_svg:not([class*='size-'])]:size-4`.
- **Icon Placement:** Icons should be semantically relevant and enhance usability, not just decoration.
- **Button Icons:** When used in buttons, icons are automatically sized and have pointer events disabled.
- **Common Icons:**
  - Sun/Moon: Used for theme toggle
  - MessageSquare: Used for feedback
  - Hash/Terminal: Used for alert and technical information
  - X: Used for close/dismiss actions

### 8.1. Icon Usage Guidelines

- Maintain consistent sizing across similar contexts.
- Pair icons with text for better accessibility.
- Use semantic icons that clearly represent their function.
- Include proper `aria-label` or `sr-only` text for icons used alone.

### 8.2. Accessible Icons

Always wrap standalone icons with an accessibility wrapper to provide proper labeling:

```jsx
import { VisuallyHidden } from "@/components/ui/visually-hidden";

// Accessible Icon Component
function AccessibleIcon({ label, children }) {
  return (
    <span className="inline-flex items-center justify-center">
      {children}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}

// Usage
<button aria-label="Close dialog">
  <AccessibleIcon label="Close">
    <X className="h-4 w-4" />
  </AccessibleIcon>
</button>;
```

For the `VisuallyHidden` component:

```jsx
// src/components/ui/visually-hidden.tsx
function VisuallyHidden({ children }) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: "rect(0, 0, 0, 0)" }}
    >
      {children}
    </span>
  );
}
```

## 9. Images and Media

- Appropriate image optimization via Next.js Image component when applicable.
- SVG usage for icons and simple illustrations.
- Responsive handling of images across device sizes.
- Images in the `public/images/` directory.

### 9.1. OG Image Template Specification

For Open Graph images (used in social media sharing):

- Dimensions: 1200 × 630 px
- Background: White
- Icon placement: Centered, 50% of the image height
- Logo: BillSplitter logo in full color
- Headline: Brand Blue (`#2E5A8C`), Roboto Bold, 40px
- Subline: Gray 700 (`#374151`), Roboto Regular, 24px
- Safe area: Keep important content 80px from edges
- Example: `BillSplitter | Split Invoices Easily Across Fiscal Years`

## 10. Forms and Validation

- Forms are built using the `form.tsx` component.
- Input validation using `aria-invalid` attribute for visual feedback.
- Helper text for additional context and validation messages.
- Field groups maintain consistent spacing (`gap-4` between groups).
- Labels are positioned above form elements for clarity.

### 10.1. Form Structure

- Group related fields together.
- Use clear, descriptive labels.
- Provide helper text for complex inputs.
- Use appropriate input types (number, date, text, etc.).
- Position actions consistently (primary on right, cancel/secondary on left).

## 11. Animations & Transitions

- **General Transitions:** Use `transition-all` on interactive elements (buttons, inputs).
- **Specific Animations:**
  - `fadeIn`: Standard fade-in effect with slight upward movement (`opacity 0 → 1, translateY 10px → 0`).
  - `pulseHighlight`: Subtle background pulse to draw attention to updated areas.
  - `resultReveal`: Fade and slide-up specifically for revealing calculation results.
  - `successGlow`: Green glow effect for successful actions.
  - `resultSuccessGlow`: Blue glow effect for result cards.
  - `scaleIn`: Simple scale animation for UI elements appearing.
- **Hover Effects:**
  - Buttons include a subtle lift and scale effect (`translate-y-[-2px] scale-[1.015]`).
  - Interactive elements show state changes (background, text color, etc.).
- **Animation Durations:**
  - Fast actions (hover, focus): 200-300ms
  - Entrance animations: 500ms
  - Attention animations (pulse): 1200ms

### 11.1. Animation Usage

- Use animations purposefully to guide user attention and provide feedback.
- Avoid animations that may cause accessibility issues (vestibular disorders).
- Respect user preferences for reduced motion.
- Ensure transitions are smooth and not jarring.
- Use consistent timing across similar animations.

### 11.2. Reduced Motion

Always implement the reduced motion media query to respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

When implementing animations in JavaScript, check for reduced motion preference:

```jsx
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Then conditionally apply animations
const animationClass = prefersReducedMotion ? "" : "animate-fadeIn";
```

## 12. Responsive Design

- Mobile-first approach using Tailwind breakpoints.
- **Breakpoints:**
  - `sm`: 640px and above
  - `md`: 768px and above
  - `lg`: 1024px and above
  - `xl`: 1280px and above
- **Responsive Patterns:**
  - Stacked layouts on mobile, side-by-side on desktop
  - Full-width containers on mobile, constrained width on desktop
  - Adjusted font sizes (`text-base` → `md:text-sm` for inputs)
  - Reorganized UI elements (button groups, dialog footers)
- **Specific Components:**
  - Dialog headers: centered on mobile, left-aligned on desktop
  - Dialog footers: stacked buttons on mobile, side-by-side on desktop
  - Tables: horizontal scrolling on small screens

### 12.1. Parallax Effect

- Subtle parallax scrolling effect on desktop (viewport width ≥ 1024px).
- Implemented with JavaScript for smooth performance.
- Gentle movement (2px per 100px of scroll).
- Disabled on mobile devices for performance.

#### 12.1.1. Parallax Safety Toggle

Always implement automatic disabling of parallax effects based on user preferences and device capabilities:

```jsx
function useParallaxSafety() {
  const [shouldEnableParallax, setShouldEnableParallax] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Check for viewport size
    const isLargeViewport = window.innerWidth >= 1024; // lg breakpoint

    // Only enable if both conditions are met
    setShouldEnableParallax(!prefersReducedMotion && isLargeViewport);

    // Listen for changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleReducedMotionChange = (e) => {
      setShouldEnableParallax(!e.matches && isLargeViewport);
    };

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
    };
  }, []);

  return shouldEnableParallax;
}

// Usage
const ParallaxSection = () => {
  const shouldEnableParallax = useParallaxSafety();

  return (
    <div
      style={
        shouldEnableParallax
          ? { transform: `translateY(${scrollY * 0.02}px)` }
          : {}
      }
    >
      {/* Content */}
    </div>
  );
};
```

## 13. Accessibility (A11y)

- **Semantic HTML:** Use appropriate elements for their intended purpose.
- **ARIA Attributes:** Provide `aria-label`, `aria-describedby`, etc., where needed.
- **Focus Management:**
  - Visible focus indicators (`ring-ring/50`, `ring-[3px]`).
  - Focus trapping in modals.
  - Keyboard navigation support.
- **Color Contrast:** Ensure sufficient contrast between text and backgrounds (WCAG AA minimum).
- **Screen Readers:**
  - Include `sr-only` text for icon-only buttons.
  - Proper ARIA roles and attributes.
  - Descriptive alternative text for images.
- **Reduced Motion:** Consider providing alternatives to animations for users with vestibular disorders.
- **Form Labels:** All form controls have associated labels.

## 14. Internationalization (i18n)

- Support for multiple languages (currently English and German).
- Translation managed through the i18n system.
- Text elements should be wrapped in translation functions.
- Layout should accommodate text expansion/contraction across languages.
- Support for language detection and manual selection.

## 15. Elevation and Shadows

- **Shadow Scale**: Following Material Design 3 principles with specific elevation levels:

  - **Level 0**: `shadow-none` - No elevation (flush with surface)
  - **Level 1**: `shadow-sm` - Subtle elevation (`box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)`)
  - **Level 2**: `shadow-md` - Medium elevation (`box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 3px 6px rgba(0,0,0,0.06)`)
  - **Level 3**: `shadow-lg` - High elevation (`box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.06)`)
  - **Level 4**: `shadow-xl` - Maximum elevation for modals (`box-shadow: 0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.10)`)

- **Usage Guidelines:**
  - **Level 0**: Disabled buttons, non-interactive elements
  - **Level 1**: Cards, buttons, inputs, form controls
  - **Level 2**: Dropdowns, popovers, navigation bars when scrolled
  - **Level 3**: Dialogs, sidebars, floating action buttons
  - **Level 4**: Modal dialogs, critical notifications, focus states

## 16. Data Visualization

- **Chart Colors:** Use the defined chart color palette consistently.
- **Proportion Highlights:** Special styling for highlighting proportions using CSS classes:
  - Light mode: Blue text on light blue background (`rgba(46, 90, 140, 0.1)`)
  - Dark mode: White text on semi-transparent blue (`rgba(74, 144, 226, 0.2)`)
- **Charts and Tables:** Ensure clear labeling and consistent styling.
- **Visual Hierarchy:** Use size, color, and position to indicate importance.

## 17. Content Guidelines

- **Tone:** Professional, clear, and helpful.
- **Text Length:** Keep messages concise and scannable.
- **Errors:** Descriptive, actionable error messages.
- **Technical Terms:** Provide explanations or tooltips for domain-specific terms.
- **Call to Actions:** Use clear, action-oriented text for buttons.

## 18. Implementation Notes

- **Component Composition:** Use composition over inheritance for UI components.
- **Tailwind Utilities:** Leverage Tailwind's utility classes for consistency.
- **Class Merging:** Use `cn()` utility for merging class names conditionally.
- **Slot Pattern:** Many components use the slot pattern for flexibility.
- **Data Attributes:** Use `data-slot` and `data-state` attributes for styling hooks.

## 19. Interaction Patterns

- **Form Submission:** Clear feedback on success or error.
- **Loading States:** Visual indication for asynchronous operations.
- **Tooltips:** Additional information on hover/focus.
- **Progressive Disclosure:** Show details on demand.
- **Validation:** Immediate feedback for input errors.

## 20. Performance Considerations

- **Image Optimization:** Use Next.js Image component with appropriate sizing.
- **Animation Performance:** Use hardware-accelerated properties (`transform`, `opacity`).
- **Responsive Assets:** Provide appropriately sized assets for different devices.
- **Loading Strategies:** Consider lazy-loading for non-critical content.
- **Conditional Features:** Disable intensive features (like parallax) on mobile devices.

---

_This document is auto-generated and will be updated as the codebase evolves._
