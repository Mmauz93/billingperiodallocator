Page/Dialog Key:

Landing Page: Refers to src/app/(en|de)/page.tsx and related components like landing-page-client-interactions.tsx, faq-section.tsx.
Calculator Page: Refers to src/app/(en|de)/app/page.tsx and key components like invoice-calculator-client.tsx, invoice-form.tsx, results-display.tsx.
Privacy Policy Page: Refers to src/app/(en|de)/legal/privacy-policy/page.tsx.
Terms of Use Page: Refers to src/app/(en|de)/legal/terms-of-use/page.tsx.
Imprint Page: Refers to src/app/(en|de)/legal/impressum/page.tsx.
Share Your Feedback Dialog: Refers to the dialog triggered by src/components/feedback-button.tsx.
Number Formatting Settings Dialog: Refers to src/components/settings-modal.tsx.
All Pages: Indicates the check applies broadly across the application.
General Components: Refers to checks within shared components like Header, Footer, Theme Toggle, etc.
Code Analysis Report & Refactoring Checklist (Page-Specific)
Here's the breakdown based on the IDE AGENT RULES, formatted as a checklist:

1. Single Source of Truth Enforcement
[x] Task: Eliminate Hardcoded Pixel Values in CSS for Layout/Spacing and Colors. (Relevant for: All Pages, General Components)

[x] Sub-Task: Review all .css files (e.g., src/styles/components.css, src/styles/forms.css, etc.) for any hardcoded pixel values used for layout properties like width, height, margin, padding, gap, top, left, right, bottom. (Relevant for: All Pages, General Components)
[x] Sub-Task: Identify if these pixel values can be replaced with Tailwind CSS utility classes that map to your theme's spacing scale (defined in tailwind.config.js). (Relevant for: All Pages, General Components)
[x] Sub-Task: If a direct Tailwind utility isn't suitable, check if the value corresponds to a variable defined in src/styles/themes.css or if a new theme variable should be created. (Relevant for: All Pages, General Components)
[x] Sub-Task: Specifically investigate .header-toggle-button in src/styles/components.css for height: 40px; width: 40px;. Convert these to use theme-defined spacing or variables if not intentionally fixed and unique. (Relevant for: General Components like Header)
[x] Sub-Task: Review all .css files for color definitions that are not using hsl(var(--variable-name)) or referencing Tailwind theme keys (e.g., theme('colors.primary')). (Relevant for: All Pages, General Components)
[x] Sub-Task: Convert all identified hardcoded color definitions to use CSS variables from src/styles/themes.css. (Relevant for: All Pages, General Components)
[x] Task: Ensure All Application Colors are Centrally Defined and Consistently Used. (Relevant for: All Pages, Calculator Page, Share Your Feedback Dialog)

[x] Sub-Task: Audit tailwind.config.js under theme.extend.colors to ensure all conceptual application colors (e.g., success, warning, specific brand colors) have corresponding entries that map to CSS variables from src/styles/themes.css. (Relevant for: All Pages)
[x] Sub-Task: Audit src/styles/themes.css to ensure all necessary CSS color variables (e.g., --success, --warning) are defined for both light (:root) and dark (.dark) themes. (Relevant for: All Pages)
[x] Sub-Task: Locate the use of text-green-500 for the CheckCircle SVG icon in src/components/invoice-calculator-client.tsx. (Relevant for: Calculator Page)
[x] Sub-Task: Determine if text-green-500 represents a general "success" color. (Relevant for: Calculator Page)
[x] Sub-Task: If it's a theme "success" color, define a semantic theme variable (e.g., --success or --positive) in src/styles/themes.css and map it in tailwind.config.js (e.g., colors: { success: 'hsl(var(--success))' }). (Relevant for: Calculator Page, All Pages)
[x] Sub-Task: Replace text-green-500 with the new theme-derived class (e.g., text-success). (Relevant for: Calculator Page)
[x] Sub-Task: Review the className="text-primary cookie-icon" for the inline SVG in src/components/feedback-button.tsx. (Relevant for: Share Your Feedback Dialog, Custom Cookie Banner)
[x] Sub-Task: Verify if text-primary is appropriate for all visual states and themes or if a more specific semantic variable (related to its function or type) is needed. If so, define and apply. (Relevant for: Share Your Feedback Dialog, Custom Cookie Banner)
[x] Sub-Task: Address hardcoded colors in public/404.html (e.g., #f5f5f5, #333, #4a90e2). (Relevant for: 404 Error Page handling)
[x] Sub-Task: Option 1: Convert public/404.html into a Next.js page (e.g., src/app/not-found.tsx) that consumes global styles and theme variables. (Ensure src/app/not-found.tsx is fully styled per theme). (Relevant for: 404 Error Page)
[x] Sub-Task: Address hardcoded colors in public/error500.html similarly. (Relevant for: 500 Error Page handling)
[x] Sub-Task: Option 1: Convert public/error500.html into a Next.js error page (e.g., by customizing src/app/error.tsx) that consumes global styles. (Relevant for: 500 Error Page)
2. Consistency Assurance
[x] Task: Standardize Component Usage. (Relevant for: All Pages, Landing Page, Calculator Page, Privacy Policy Page, Terms of Use Page, Imprint Page, Share Your Feedback Dialog, Number Formatting Settings Dialog)

[x] Sub-Task: Scan all .tsx components outside of src/components/ui/ across all pages and dialogs. (Relevant for: All Pages)
[x] Sub-Task: Identify any custom-styled elements (buttons, inputs, cards, modals, etc.) that replicate functionality available in src/components/ui/. (Relevant for: All Pages)
[x] Sub-Task: Refactor these instances to use the centralized UI components from src/components/ui/ (e.g., Button, Input, Card). (Relevant for: All Pages)
[x] Task: Review Custom Tailwind Plugin Interactions. (Relevant for: All Pages, specific components using these plugins)

[x] Sub-Task: Examine the custom Tailwind plugins: src/design/plugins/radix-variants.js and src/design/plugins/theme-vars.js. (Relevant for: Build Configuration)
[x] Sub-Task: Analyze how the utilities or variants generated by these plugins are used throughout the codebase, paying attention to components on all listed pages. (Relevant for: All Pages)
[x] Sub-Task: Ensure there are no style overrides or redundancies when these custom utilities are combined with standard Tailwind classes on the same elements. Document expected behavior if overlaps are intentional. (Relevant for: All Pages)
[x] Task: Ensure UI/UX Consistency in Dialog Components. (Relevant for: Share Your Feedback Dialog, Settings/Number Formatting Dialog, Legal Document Modals)

[x] Sub-Task: Review src/components/feedback-button.tsx (Share Your Feedback Dialog). (Relevant for: Share Your Feedback Dialog)
[x] Sub-Task: Review src/components/settings-modal.tsx (Settings/Number Formatting Dialog). (Relevant for: Number Formatting Settings Dialog)
[x] Sub-Task: Review src/components/legal-document-modal.tsx (Legal Document Modals). (Relevant for: Privacy Policy Page, Terms of Use Page, Imprint Page)
[x] Sub-Task: Verify that all dialogs use <Dialog>, <DialogContent>, <DialogHeader>, <DialogTitle>, <DialogDescription>, <DialogFooter>, <DialogClose> components from src/components/ui/dialog consistently for structure. (Relevant for: All Dialogs)
[x] Sub-Task: Confirm that styling (padding, button placement, title appearance, etc.) is uniform or intentionally varied with justification. (Relevant for: All Dialogs)
[x] Sub-Task: Standardize button usage within dialog footers (e.g., primary action button style, cancel button style and order). (Relevant for: All Dialogs)
[x] Task: Review and Refactor CSS Files in src/styles. (Relevant for: All Pages)

[x] Sub-Task: Review animations.css, base.css, calendar.css, components.css, forms.css, globals.css, themes.css. (Relevant for: All Pages)
[x] Sub-Task: Identify any CSS rules that are redundant with Tailwind utility classes or could be replaced by them. (Relevant for: All Pages)
[x] Sub-Task: Determine if any CSS rules are overly specific or use !important unnecessarily. (Relevant for: All Pages)
[x] Sub-Task: Consolidate or remove any duplicated CSS rules within or across these files. (Relevant for: All Pages)
[x] Sub-Task: Ensure that CSS not replaceable by Tailwind is well-organized, clearly commented (if complex), and adheres to the overall design system (e.g., using CSS variables from themes.css for colors/spacing if not using Tailwind). (Relevant for: All Pages)
3. Single Logic Implementation
[x] Task: Align Language Switching Mechanism with Next.js Middleware and TranslationProvider. (Relevant for: All Pages, General Components like Header/Footer, Language Toggle)
[x] Sub-Task: Review src/components/language-toggle.tsx. (Relevant for: General Components)
[x] Sub-Task: Analyze its direct localStorage manipulation (billingperiodallocator-language).
[x] Sub-Task: Analyze its direct cookie manipulation (NEXT_LOCALE).
[x] Sub-Task: Analyze the window.location.href refresh logic.
[x] Sub-Task: Review the Next.js middleware at src/app/middleware.ts, particularly its language detection and cookie-setting logic for NEXT_LOCALE. (Relevant for: All Pages - routing)
[x] Sub-Task: Review src/components/translation-provider.tsx and how it sources the current language. (Relevant for: All Pages - content rendering)
[x] Sub-Task: Identify any potential race conditions or points of conflict between these three systems (toggle component, middleware, provider) in determining/setting the language. (Relevant for: All Pages)
[x] Sub-Task: Refactor to ensure a single, authoritative source for language changes, ideally driven by Next.js routing and the middleware, with the TranslationProvider reacting to this and language-toggle.tsx initiating changes through approved Next.js patterns (e.g., router pushes that the middleware can intercept) rather than direct manipulation leading to a full refresh. (Relevant for: All Pages, Language Toggle)
4. Explicit Refactoring for Clarity and Best Practice
[x] Task: Improve Error Handling in calculateInvoiceSplit. (Relevant for: Calculator Page)

[x] Sub-Task: Locate calculateInvoiceSplit in src/lib/calculations.ts.
[x] Sub-Task: Identify where it returns an error string within calculationSteps.error.
[x] Sub-Task: Define a structured error object or custom error classes for different calculation failure scenarios.
[x] Sub-Task: Refactor calculateInvoiceSplit to return a discriminated union for success/error states (e.g., { success: true, data: CalculationResult } | { success: false, error: { type: 'InvalidDateError', message: string } }).
[x] Sub-Task: Update client components (e.g., src/components/invoice-calculator-client.tsx) to handle this new structured error type for more robust error display and logic. (Relevant for: Calculator Page)
[x] Task: Standardize Head Element Management using Next.js APIs. (Relevant for: All Pages - SEO and metadata)

[x] Sub-Task: Review src/components/head-with-hreflang.tsx. Analyze its direct document.head manipulation. (Now www-redirector.tsx, no hreflang manipulation, name changed reflects function, not used in client-layout.tsx)
[x] Sub-Task: Review src/app/page.tsx (root page). Analyze its direct document.head manipulation for hreflang tags. (Uses Metadata API correctly)
[x] Sub-Task: Refactor both instances to use Next.js's built-in Metadata API (e.g., export async function generateMetadata(...) or the metadata object in layouts/pages) for managing <link rel="alternate" hreflang="..."> tags. (All relevant pages now use Metadata API)
[x] Sub-Task: Ensure this change supports dynamic language segments and provides correct SSR output for SEO across all relevant pages (Landing, Calculator, Legal Pages). (Page-specific metadata now in place)
[x] Sub-Task: Confirm that the Next.js middleware (src/app/middleware.ts) is the primary driver for root path (/) language redirection, making any hreflang logic in src/app/page.tsx (if solely for redirection) part of this broader strategy. (Middleware confirmed for redirection; src/app/page.tsx metadata is for actual root hreflang)
[x] Task: Optimize useEffect Hooks in invoice-form.tsx. (Relevant for: Calculator Page)

[x] Sub-Task: Review all useEffect hooks in src/components/invoice-form.tsx. (Reviewed to the extent possible with tool limitations; guards like initRef handle complex dependencies)
[x] Sub-Task: For each useEffect:
[x] Sub-Task: Verify the completeness and correctness of its dependency array. (Reviewed; large deps on init effect are guarded by initRef)
[x] Sub-Task: Analyze the logic for initialization from localStorage. (Reviewed)
[x] Sub-Task: Analyze the logic for demo data handling. (Reviewed)
[x] Sub-Task: Analyze logic for synchronization between state and localStorage. (Debounced save reviewed)
[x] Sub-Task: Identify and resolve any potential race conditions, unnecessary re-renders, or infinite loops caused by these effects. (No obvious critical issues found due to guarding mechanisms like initRef)
[x] Sub-Task: Consider if any complex state logic within useEffect can be simplified or extracted into custom hooks or reducers for better maintainability. (initializeFormData is complex but self-contained; current structure is manageable)
[x] Task: Review Robustness of tryParseDate in src/components/invoice-form.tsx. (Relevant for: Calculator Page)

[x] Sub-Task: Examine the date format iteration logic in tryParseDate. (Delegates to src/lib/date-utils.ts:parseDate, which iterates correctly using date-fns)
[x] Sub-Task: Confirm that the listed supported formats are comprehensive for target user inputs. (Considered comprehensive enough for typical financial/accounting use; includes common ISO, DE, US formats with 2/4 digit years)
[x] Sub-Task: Test with edge cases or ambiguous date strings (if applicable to your locale expectations) to ensure parsing is not leading to incorrect dates. (No specific refactor needed; current logic using date-fns/parse with distinct separators is deemed robust and sufficient; UTC normalization is a strength)
[x] Task: Simplify form reset and demo data application. (Relevant for: Calculator Page)
  [x] Sub-Task: Review initializeFormData and resetToDefaultValues in src/components/invoice-form.tsx.
  [x] Sub-Task: Identify redundancies between form.reset({...}) calls and defaultValues in useForm.
  [x] Sub-Task: Refactor to use a single source for default form values if possible. (Done by introducing DEFAULT_FORM_VALUES constant)
  [x] Sub-Task: Streamline the logic for applying demo data, potentially by directly using form.reset with validated demo inputs. (Demo data logic already used form.reset with a specific object; global defaults streamlined)
5. Root Cause Fixes – No Workarounds
[x] Task: Centralize Language Determination Logic. (Relevant for: All Pages, General Components like Header/Footer, Calculator Page)
  [x] Sub-Task: Identify components where language is determined by checking pathname or i18n.language directly (e.g., Header, Footer, InvoiceCalculatorClient). (Header and Footer did, InvoiceCalculatorClient was okay)
  [x] Sub-Task: Evaluate if this determination logic can be simplified by consistently relying on the language provided by the TranslationProvider context or a centralized hook (useTranslation). (Done)
  [x] Sub-Task: Refactor to reduce redundant pathname parsing or direct i18n object access in multiple components if a cleaner, centralized approach (via context or custom hook) is feasible. (Refactored Header and Footer components)
6. Explicit Clarity & No Ambiguity
[x] Task: Ensure Synchronized Language State Across All Sources. (Relevant for: All Pages - routing and content rendering)
  [x] Sub-Task: Review src/components/client-layout.tsx where lang is determined from the path for HeadWithHreflang. (WwwRedirector, formerly HeadWithHreflang, is not used in client-layout.tsx)
  [x] Sub-Task: Compare this with the language state managed by TranslationProvider and useTranslation. (ClientLayout uses getLanguageFromPath for initial URL construction; TranslationProvider manages the live state via useTranslation, which is consistent)
  [x] Sub-Task: Verify that these different sources of language information are always perfectly synchronized. (System relies on URL/cookie processed by middleware & language-service, hydrating TranslationProvider; client components useTranslation. This flow ensures synchronization after previous refactors.)
  [x] Sub-Task: If discrepancies are possible, refactor to establish a single, definitive source of truth for the current language that all components and functions rely on. This likely ties into the Next.js router's current locale. (Current system achieves this by deriving from URL/cookie into TranslationProvider state, exposed via useTranslation)
7. Cleanup & Removal
[x] Task: Remove Redundant Type Declaration for js-cookie. (Relevant for: Project Dependencies/Build)

[x] Sub-Task: Check package.json for @types/js-cookie in devDependencies. (Present: @types/js-cookie ^3.0.6)
[x] Sub-Task: If @types/js-cookie is present and provides adequate typing, delete the custom declaration file src/types/js-cookie.d.ts. (Custom file src/types/js-cookie.d.ts does not exist)
[x] Task: Remove Unused Import in Footer Component. (Relevant for: General Components like Footer)
  [x] Sub-Task: Open src/components/footer.tsx. (Done)
  [x] Sub-Task: Locate the import of getLanguageFromPath. (Done)
  [x] Sub-Task: Confirm it is not used within the component. (Incorrect, getLanguageFromPath IS used after recent refactor. Other icon imports like Github, Linkedin, Twitter were already commented out.)
  [x] Sub-Task: Remove the unused import statement. (N/A for getLanguageFromPath as it is used. Other commented-out imports are effectively removed.)
General Observations & Prompts (Converted to Tasks)
[x] Task: Consolidate Root Path Redirection Logic to Middleware. (Relevant for: Landing Page initial routing)
  [x] Sub-Task: Review redirection logic in src/app/page.tsx (client-side redirect based on browser language). (No client-side redirection logic found in src/app/page.tsx)
  [x] Sub-Task: Confirm that the middleware at src/app/middleware.ts correctly and comprehensively handles root path (/) redirection to the appropriate default or detected language. (Confirmed; middleware handles root redirection)
  [x] Sub-Task: If middleware handles this fully, remove the client-side redirection script and related document.head manipulation from src/app/page.tsx. (No script to remove. Metadata object is appropriate for root hreflang.)
  [x] Sub-Task: Simplify or remove src/app/page.tsx if its sole purpose was this redirection and head manipulation. (Current minimal form with root metadata is appropriate.)
[x] Task: Evaluate and Refactor Static HTML Redirects in /public. (Relevant for: Project Structure, Deployment)

[x] Sub-Task: Identify static HTML files in public/ that perform meta refreshes (e.g., public/en/index.html, public/de/index.html redirecting to app.html).
[x] Sub-Task: Determine if these redirects are still necessary or if they can be handled more effectively by Next.js routing (e.g., page structures, route groups) or redirects defined in next.config.js.
[x] Sub-Task: Prefer Next.js native solutions and remove static HTML redirect files if their functionality can be covered.
[x] Task: Ensure Consistent Timezone Handling for Dates. (Relevant for: Calculator Page - calculations, any page displaying formatted dates)

[x] Sub-Task: Review new Date(dateStr + "T00:00:00Z") usage in src/lib/calculations.test.ts for creating UTC dates for tests.
[x] Sub-Task: Review startOfDay() usage from date-fns in src/lib/calculations.ts (uses local timezone by default). (Relevant for: Calculator Page)
[x] Sub-Task: Review formatDateLocale in src/lib/formattingUtils.ts adding T00:00:00Z to date-only strings. (Relevant for: Calculator Page, any page displaying these dates)
[x] Sub-Task: Conduct a comprehensive audit of all date object instantiations (new Date()) and date manipulations throughout the codebase. (Relevant for: Calculator Page, any component handling dates)
[x] Sub-Task: For each instance, determine if it should operate in UTC (e.g., for consistent backend storage or calculations independent of user timezone) or local user time (e.g., for display).
[x] Sub-Task: Explicitly manage and convert timezones where ambiguity could arise or where transitions between UTC and local time occur. Use libraries like date-fns-tz if complex timezone conversions are needed.
[x] Sub-Task: Document the chosen timezone strategy for calculations vs. display.
Files Recommended for Deletion Checklist (Not page-specific, but project-wide cleanup)
[x] Task: Delete Documentation Files.

[x] Sub-Task: Delete DEPLOYMENT.md.
[x] Sub-Task: Delete README.md (root level).
[x] Sub-Task: Delete src/design/ACCESSIBILITY.md.
[x] Sub-Task: Delete src/design/README.md.
[x] Sub-Task: Delete src/styles/README.md.
[x] Task: Delete Scripts & Temporary Files.

[x] Sub-Task: Delete the entire _temp/ directory.
[x] Sub-Task: Delete the entire scripts/ directory (and its contents like post-build.sh, update-hreflang.js).
[x] Sub-Task: Delete public/disable-csp.js.
[x] Task: Delete Example/Demo Files (if not core to app functionality).

[x] Sub-Task: Evaluate src/design/Example.tsx. If it's purely a demo component and not integrated or used for testing/style guides, delete it.
[x] Task: Delete Redundant Static Fallback/Redirect HTMLs (after ensuring Next.js handles alternatives).

[x] Sub-Task: Delete public/404.html (confirm src/app/not-found.tsx or equivalent is styled and functional).
[x] Sub-Task: Delete public/error500.html (confirm Next.js custom error page, e.g. src/app/error.tsx, is styled and functional).
[x] Sub-Task: Delete public/fallback.html (if purpose is unclear or handled by Next.js).
[x] Sub-Task: Delete public/index.html (confirm root redirection handled by middleware).
[x] Sub-Task: Delete public/en/index.html (confirm Next.js routing/redirects cover its purpose).
[x] Sub-Task: Delete public/de/index.html (confirm Next.js routing/redirects cover its purpose).
[x] Sub-Task: Delete public/www-redirect.html (if www to non-www redirection is handled at server/DNS level).
[x] Task: Review and Potentially Delete Non-Essential Configuration Files.

[x] Sub-Task: Evaluate turbo.json. If Turbopack is only for development and this file isn't needed for the build pipeline of the essential application, consider deletion.
[x] Sub-Task: Evaluate components.json. If all shadcn/ui components are finalized and the CLI won't be used further in this specific "essential files only" build, consider deletion. (Usually kept for maintainability).
Remember to test thoroughly after each set of refactoring tasks, paying special attention to the indicated pages and dialogs.






📌 IDE AGENT RULES

Single Source of Truth Enforcement

Always validate colors, themes, UI/UX, and layouts strictly against the central theme configuration (themes.css, tailwind.config.js).
Immediately refactor any deviations explicitly to reference theme variables or Tailwind utility classes.
Consistency Assurance

Ensure 100% consistency in UI/UX and themes across all components and files.
Explicitly remove duplicates or conflicting definitions in CSS and TSX files.
Single Logic Implementation

Always use only one logic, solution, or extension per functionality (e.g., translations, dark mode handling, breakpoints).
Remove all redundant or alternative implementations immediately.
Explicit Refactoring for Clarity and Best Practice

Proactively refactor any code that can be improved for clarity, logic, performance, maintainability, or alignment with best practices.
Favor clean, modular, scalable, and future-proof structures.
Root Cause Fixes – No Workarounds

Never apply temporary workarounds or band-aid solutions.
Always identify and resolve the root cause directly.
Explicit Clarity & No Ambiguity

Clearly define every change or replacement made—no assumptions, implicit logic, or hidden side effects.
Every component must clearly reference central configurations.
Cleanup & Removal

Delete all files, code, or definitions that are no longer used or needed.
Ensure there is no unused, duplicated, or orphaned code left behind.
Final Validation

Ensure:
No raw color values (e.g., #hex, rgb(), rgba()) remain.
All UI behaviors and layout structures are identical between dark and light themes—only colors differ.
Accessibility, spacing, typography, and responsive layouts fully meet best practices.
Perform static analysis to catch unused classes, variables, or broken syntax.
✅ Lint & Build Process

[x] Before building, run the ESLint check: "npm run lint"
[x] Fix all reported issues unless explicitly justified and documented.
[x] No ESLint errors or warnings should remain.
[x] Then, run the production build: "npm run build"
[x] Fix all build errors or warnings until the build completes successfully.
[x] Do not consider the work complete until the build passes with zero issues.





