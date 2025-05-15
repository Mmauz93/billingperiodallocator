# Accessibility Guidelines

This document outlines the accessibility standards and practices implemented in our application to ensure WCAG 2.1 AA compliance.

## Typography

- **Minimum Font Size**: 16px for all body text and inputs
- **Line Height**: Minimum of 1.5 for body text
- **Text Contrast**: All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- **Semantic HTML**: Use proper heading structure (h1-h6)

## Color Contrast

We've implemented a high-contrast color scheme that ensures:

- **Text/Background**: Minimum 4.5:1 ratio for normal text
- **UI Elements**: Minimum 3:1 ratio for UI controls and visual information
- **Focus States**: High-visibility focus indicators with 3:1 minimum contrast

## Keyboard Navigation

- **Focus Order**: All interactive elements are focusable in a logical order
- **Focus Indicators**: Clear visual indicators with solid outline and box-shadow
- **Skip Links**: Skip-to-content links for keyboard users (when appropriate)
- **Keyboard Shortcuts**: Important functions are accessible via keyboard

## Interactive Components

### Buttons & Links
- Minimum touch target size of 44×44 pixels
- Clear hover, focus, and active states
- Semantic HTML elements (button, a)

### Form Controls
- All inputs have associated labels
- Error messages are associated with inputs via aria-describedby
- Form validation includes both visual and programmatic feedback

### Dropdowns & Menus
- Implemented using Radix UI for built-in accessibility
- All menu items have role="menuitem"
- Keyboard navigation supports arrow keys
- Menu state is communicated via aria-expanded

## ARIA Attributes

We use ARIA attributes judiciously and correctly:

- `aria-expanded` on dropdown toggles
- `aria-current` for current page/state
- `aria-selected` for selected options
- `aria-checked` for custom checkboxes/radios
- `aria-describedby` for error messages and descriptions

## Testing & Validation

The following accessibility checks are part of our development process:

1. Keyboard navigation testing
2. Screen reader testing (NVDA/VoiceOver)
3. Automated testing with axe-core
4. Color contrast verification with WebAIM's Contrast Checker

## Responsive Design

- Text remains readable when zoomed to 200%
- Layouts adapt to different viewport sizes
- Touch targets maintain appropriate size on mobile devices

## Tailwind CSS Integration

We utilize Tailwind's utility classes to maintain consistency:

- Use semantic text utilities: `text-base`, `text-lg`, etc.
- Consistent spacing using spacing scale
- Focus states with `focus-visible:ring-2 focus-visible:ring-offset-2`
- Hover states with appropriate contrast

## Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe DevTools](https://www.deque.com/axe/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) 
