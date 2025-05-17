You are my IDE agent and refactoring assistant. Your mission is to clean, modularize, and harden the codebase—skipping `/out`—with the following steps, processing files one by one in the order listed in `tasks.md`:

1. **Comment Cleanup**  
   - Strip all single-line (`//`, `#`, `--`) and block (`/*…*/`) comments **except** those containing `TODO`, `FIXME`, `IMPORTANT`, `NOTE`, or doc-style markers (`/**…*/`, `"""…"""`).

2. **File-Size Audit**  
   - Execute:  
     ```bash
     find . -type f ! -path './out/*' | xargs wc -l | sort -n
     ```  
   - Flag any file exceeding **200** lines (configurable threshold) for splitting.

3. **Splitting Oversized Files**  
   - Identify logical split points (classes, functions, UI components) to enforce Separation of Concerns.  
   - Extract each unit into a new file; update imports/exports accordingly.

4. **Duplicate-Logic Consolidation**  
   - Detect repeated code patterns (IDE clone detector or `grep`).  
   - Apply DRY/Rule of Three: once similar logic occurs in three places, extract it into a shared utility module.

5. **Logic Verification & SSOT**  
   - Run static analysis checks to validate logic correctness and ensure a single source of truth for shared configurations and utilities.

6. **Progress Tracking**  
   - In `tasks.md`, locate the entry for the current file (`- [ ] path/to/file`) and change it to `- [x] path/to/file` **immediately** after fully processing that file (comments cleaned, splits performed, duplicates resolved, logic verified).

7. **Final Commit**  
   - After **all** files are processed and the checklist is complete, commit **once** on branch `cleanup/structural-refactor` with a clear, atomic commit message summarizing the batch of changes.  
   - Push the branch and open a pull request for review.  


   
- [x] .gitignore
- [x] package-lock.json
- [x] package.json
- [x] next.config.ts
- [x] tsconfig.json
- [x] tailwind.config.js
- [x] next-env.d.ts
- [x] tailwind.config.js.bak
- [x] .browserslistrc
- [x] eslint.config.mjs
- [x] turbo.json
- [x] postcss.config.mjs
- [x] components.json
- [x] .gitlab-ci.yml
- [x] public/web.config
- [x] public/.htaccess
- [x] public/robots.txt
- [x] public/terms-of-use.de.md
- [x] public/terms-of-use.md
- [x] public/og-image.svg
- [x] public/feature-icon-1.svg
- [x] public/feature-icon-2.svg
- [x] public/feature-icon-3.svg
- [x] public/de/.htaccess
- [x] public/en/.htaccess
- [x] public/images/.htaccess
- [x] public/images/new-allocation-icon.svg
- [x] public/images/icon-privacy.svg
- [x] public/images/icon.svg
- [x] public/images/logo.svg
- [x] public/images/icon-deferred.svg
- [x] public/images/icon-expenses.svg
- [x] public/images/icon-no-login.svg
- [x] public/images/calculator-illustration.svg
- [x] public/images/icon-allocation.svg
- [x] src/translations.ts
- [x] src/components/header.tsx
- [x] src/components/footer.tsx
- [x] src/components/faq-section.tsx
- [x] src/components/page-section.tsx
- [x] src/components/custom-cookie-banner.tsx
- [x] src/components/cookie-banner-main-view.tsx
- [x] src/components/cookie-banner-options-view.tsx
- [x] src/components/theme-toggle.tsx
- [x] src/components/language-toggle.tsx
[x] src/components/invoice-form.tsx
[x] src/components/breadcrumb.tsx
[x] src/components/privacy-widget-client-wrapper.tsx
[x] src/components/feature-card.tsx
[x] src/components/www-redirector.tsx
[x] src/components/legal-document-modal.tsx
[x] src/components/settings-modal.tsx
[x] src/components/results-display.tsx
[x] src/components/translation-provider.tsx
[x] src/components/client-layout.tsx
[x] src/components/invoice-calculator-client.tsx
[x] src/components/force-dark-theme.tsx
[x] src/components/theme-provider.tsx
[x] src/components/feedback-button.tsx
[x] src/components/landing-page-client-interactions.tsx
[x] src/components/compliance-accordion.tsx
[x] src/components/compliance-accordion-de.tsx
[x] src/components/compliance-accordion-shared.tsx
[x] src/components/loading.tsx
[x] src/components/app-seo-content.tsx
[x] src/components/privacy-widget-skeleton.tsx
[x] src/components/ui/switch.tsx
[x] src/components/ui/select.tsx
[x] src/components/ui/dropdown-menu.tsx
[x] src/components/ui/popover.tsx
[x] src/components/ui/dialog.tsx
[x] src/components/ui/button.tsx
[x] src/components/ui/accordion.tsx
[x] src/components/ui/input.tsx
[x] src/components/ui/form.tsx
[x] src/components/ui/typography.tsx
[x] src/components/ui/calendar.tsx
[x] src/components/ui/textarea.tsx
[x] src/components/ui/tooltip.tsx
[x] src/components/ui/visually-hidden.tsx
[x] src/components/ui/table.tsx
[x] src/components/ui/skeleton.tsx
[x] src/components/ui/radio-group.tsx
[x] src/components/ui/label.tsx
[x] src/components/ui/checkbox.tsx
[x] src/components/ui/card.tsx
[x] src/components/ui/alert.tsx
[x] src/components/ui/accessible-icon.tsx
[x] src/design/plugins/radix-variants.js
[x] src/app/error.tsx
[x] src/app/page.tsx
[x] src/app/globals.css
[x] src/app/middleware.ts
[x] src/app/layout.tsx
[x] src/app/layout.metadata.ts
[x] src/app/robots.ts
[x] src/app/sitemap.ts
[x] src/app/not-found.tsx
[x] src/app/favicon.ico
[x] src/app/[lang]/layout.tsx
[x] src/app/en/page.tsx
[x] src/app/en/layout.tsx
[x] src/app/en/style-guide/page.tsx
[x] src/app/en/legal/privacy-policy/page.tsx
[x] src/app/en/legal/privacy-policy/layout.tsx
[x] src/app/en/legal/terms-of-use/terms-of-use-client.tsx
[x] src/app/en/legal/terms-of-use/page.tsx
[x] src/app/en/legal/terms-of-use/layout.tsx
[x] src/app/en/legal/impressum/page.tsx
[x] src/app/en/legal/impressum/layout.tsx
[x] src/app/en/app/page.tsx
[x] src/app/en/app/layout.tsx
[x] src/app/de/page.tsx
[x] src/app/de/layout.tsx
[x] src/app/de/app/page.tsx
[x] src/app/de/app/layout.tsx
[x] src/app/de/legal/impressum/page.tsx
[x] src/app/de/legal/impressum/layout.tsx
[x] src/app/de/legal/privacy-policy/page.tsx
[x] src/app/de/legal/privacy-policy/layout.tsx
[x] src/app/de/legal/terms-of-use/terms-of-use-client.tsx
[x] src/app/de/legal/terms-of-use/page.tsx
[x] src/app/de/legal/terms-of-use/layout.tsx
[x] src/app/_not-found/page.tsx
[x] src/styles/components.css
[x] src/styles/forms.css
[x] src/styles/base.css
[x] src/styles/animations.css
[x] src/styles/calendar.css
[x] src/styles/globals.css
[x] src/styles/themes.css
[x] src/lib/calculations.ts
[x] src/lib/date-utils.ts
[x] src/lib/translation.ts
[x] src/lib/language-service.ts
[x] src/lib/errors.ts
[x] src/lib/formattingUtils.ts
[x] src/lib/calculations.test.ts
[x] src/lib/seo-utils.ts
[x] src/lib/i18n-noeval.ts
[x] src/lib/utils.ts
[x] src/lib/hooks/use-modal-behavior.ts
[x] src/lib/hooks/useParallaxSafety.ts
[x] src/types/index.ts
[x] src/messages/en.json
[x] src/messages/de.json
[x] src/context/settings-context.tsx
- [x] tasks.md
