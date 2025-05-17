You are my IDE agent and refactoring assistant. Your mission is to clean, modularize, and harden the codebase—skipping `/out`—with the following steps, file by file, starting from `tasks.md`:

1. **Comment Cleanup**  
   - Strip all comments except those containing `TODO`, `FIXME`, `IMPORTANT`, `NOTE`, or doc-style markers (`/**…*/`, `"""…"""`).

2. **File-Size Audit**  
   - Run:  
     find . -type f ! -path './out/*' | xargs wc -l | sort -n  
   - Mark any file over **200** lines for splitting.

3. **Splitting Oversized Files**  
   - Determine logical split points (classes, functions, components).  
   - Extract segments into new files and update imports.

4. **Duplicate-Logic Consolidation**  
   - Detect repeated code patterns and extract shared logic into common utilities once it appears ≥3 times.

5. **Logic Verification & SSOT**  
   - Execute static analysis checks to validate logic correctness and enforce a single source of truth.

6. **Progress Tracking**  
   - Update `tasks.md`: change `- [ ] path/to/file` to `- [x] path/to/file` immediately after fully processing each file.

7. **Verification & Commit**  
   - After every file modification, run the test suite.  
   - Commit each change to branch `cleanup/structural-refactor` and push a pull request summarizing all reports and diffs.


   
- [x] .gitignore
- [x] package-lock.json
- [x] package.json
- [x] next.config.ts
- [x] tsconfig.json
- [x] tailwind.config.js
- [x] next-env.d.ts
- [x] tailwind.config.js.bak
[ ] .browserslistrc
[ ] eslint.config.mjs
[ ] turbo.json
[ ] postcss.config.mjs
[ ] components.json
[ ] .gitlab-ci.yml
[ ] public/web.config
[ ] public/.htaccess
[ ] public/robots.txt
[ ] public/terms-of-use.de.md
[ ] public/terms-of-use.md
[ ] public/og-image.svg
[ ] public/feature-icon-1.svg
[ ] public/feature-icon-2.svg
[ ] public/feature-icon-3.svg
[ ] public/de/.htaccess
[ ] public/en/.htaccess
[ ] public/images/.htaccess
[ ] public/images/new-allocation-icon.svg
[ ] public/images/icon-privacy.svg
[ ] public/images/icon.svg
[ ] public/images/logo.svg
[ ] public/images/icon-deferred.svg
[ ] public/images/icon-expenses.svg
[ ] public/images/icon-no-login.svg
[ ] public/images/calculator-illustration.svg
[ ] public/images/icon-allocation.svg
[ ] src/translations.ts
[ ] src/components/header.tsx
[ ] src/components/footer.tsx
[ ] src/components/faq-section.tsx
[ ] src/components/page-section.tsx
[ ] src/components/custom-cookie-banner.tsx
[ ] src/components/theme-toggle.tsx
[ ] src/components/language-toggle.tsx
[ ] src/components/invoice-form.tsx
[ ] src/components/breadcrumb.tsx
[ ] src/components/privacy-widget-client-wrapper.tsx
[ ] src/components/feature-card.tsx
[ ] src/components/www-redirector.tsx
[ ] src/components/legal-document-modal.tsx
[ ] src/components/settings-modal.tsx
[ ] src/components/results-display.tsx
[ ] src/components/translation-provider.tsx
[ ] src/components/client-layout.tsx
[ ] src/components/invoice-calculator-client.tsx
[ ] src/components/force-dark-theme.tsx
[ ] src/components/theme-provider.tsx
[ ] src/components/feedback-button.tsx
[ ] src/components/landing-page-client-interactions.tsx
[ ] src/components/compliance-accordion.tsx
[ ] src/components/compliance-accordion-de.tsx
[ ] src/components/compliance-accordion-shared.tsx
[ ] src/components/loading.tsx
[ ] src/components/app-seo-content.tsx
[ ] src/components/privacy-widget-skeleton.tsx
[ ] src/components/ui/switch.tsx
[ ] src/components/ui/select.tsx
[ ] src/components/ui/dropdown-menu.tsx
[ ] src/components/ui/popover.tsx
[ ] src/components/ui/dialog.tsx
[ ] src/components/ui/button.tsx
[ ] src/components/ui/accordion.tsx
[ ] src/components/ui/input.tsx
[ ] src/components/ui/form.tsx
[ ] src/components/ui/typography.tsx
[ ] src/components/ui/calendar.tsx
[ ] src/components/ui/textarea.tsx
[ ] src/components/ui/tooltip.tsx
[ ] src/components/ui/visually-hidden.tsx
[ ] src/components/ui/table.tsx
[ ] src/components/ui/skeleton.tsx
[ ] src/components/ui/radio-group.tsx
[ ] src/components/ui/label.tsx
[ ] src/components/ui/checkbox.tsx
[ ] src/components/ui/card.tsx
[ ] src/components/ui/alert.tsx
[ ] src/components/ui/accessible-icon.tsx
[ ] src/design/plugins/radix-variants.js
[ ] src/app/error.tsx
[ ] src/app/page.tsx
[ ] src/app/globals.css
[ ] src/app/middleware.ts
[ ] src/app/layout.tsx
[ ] src/app/layout.metadata.ts
[ ] src/app/robots.ts
[ ] src/app/sitemap.ts
[ ] src/app/not-found.tsx
[ ] src/app/favicon.ico
[ ] src/app/[lang]/layout.tsx
[ ] src/app/en/page.tsx
[ ] src/app/en/layout.tsx
[ ] src/app/en/style-guide/page.tsx
[ ] src/app/en/legal/privacy-policy/page.tsx
[ ] src/app/en/legal/privacy-policy/layout.tsx
[ ] src/app/en/legal/terms-of-use/terms-of-use-client.tsx
[ ] src/app/en/legal/terms-of-use/page.tsx
[ ] src/app/en/legal/terms-of-use/layout.tsx
[ ] src/app/en/legal/impressum/page.tsx
[ ] src/app/en/legal/impressum/layout.tsx
[ ] src/app/en/app/page.tsx
[ ] src/app/en/app/layout.tsx
[ ] src/app/de/page.tsx
[ ] src/app/de/layout.tsx
[ ] src/app/de/app/page.tsx
[ ] src/app/de/app/layout.tsx
[ ] src/app/de/legal/impressum/page.tsx
[ ] src/app/de/legal/impressum/layout.tsx
[ ] src/app/de/legal/privacy-policy/page.tsx
[ ] src/app/de/legal/privacy-policy/layout.tsx
[ ] src/app/de/legal/terms-of-use/terms-of-use-client.tsx
[ ] src/app/de/legal/terms-of-use/page.tsx
[ ] src/app/de/legal/terms-of-use/layout.tsx
[ ] src/app/_not-found/page.tsx
[ ] src/styles/components.css
[ ] src/styles/forms.css
[ ] src/styles/base.css
[ ] src/styles/animations.css
[ ] src/styles/calendar.css
[ ] src/styles/globals.css
[ ] src/styles/themes.css
[ ] src/lib/calculations.ts
[ ] src/lib/date-utils.ts
[ ] src/lib/translation.ts
[ ] src/lib/language-service.ts
[ ] src/lib/errors.ts
[ ] src/lib/formattingUtils.ts
[ ] src/lib/calculations.test.ts
[ ] src/lib/seo-utils.ts
[ ] src/lib/i18n-noeval.ts
[ ] src/lib/utils.ts
[ ] src/lib/hooks/useParallaxSafety.ts
[ ] src/types/index.ts
[ ] src/messages/en.json
[ ] src/messages/de.json
[ ] src/context/settings-context.tsx
- [x] tasks.md
