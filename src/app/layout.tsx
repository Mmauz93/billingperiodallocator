// Root Layout (Server Component)

import "@/app/globals.css";

import ClientLayout from "@/components/client-layout";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { metadata } from "./layout.metadata";

// Re-export the metadata
export { metadata };

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* 
          Clean hreflang implementation following Google's official guidance:
          https://developers.google.com/search/docs/specialty/international/localized-versions
          
          This script:
          1. Adds proper self-reference for current page
          2. Adds alternate links to all language variants
          3. Removes canonical tag to different URLs (single source of truth)
          4. Correctly implements x-default pointing to root
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Configuration
                const siteUrl = 'https://billsplitter.siempi.ch';
                const supportedLanguages = ['en', 'de'];
                const defaultLanguage = 'en';
                
                function setupHreflangTags() {
                  // First remove any existing hreflang/canonical tags to avoid duplicates
                  removeExistingTags();
                  
                  // Get current path and determine page type
                  const { pathname } = window.location;
                  const pathSegments = pathname.split('/').filter(Boolean);
                  
                  // Determine current language from URL path
                  const currentLang = getLanguageFromPath(pathSegments);
                  
                  // Get clean path without language prefix for generating alternates
                  const pathWithoutLang = getPathWithoutLanguage(pathSegments, currentLang);
                  
                  // Handle root page specially (/), as it redirects to language pages
                  if (pathname === '/' || pathname === '') {
                    // Root page should redirect to default language, so we don't add hreflang tags
                    return;
                  }
                  
                  // For language pages, we set the correct hreflang implementation
                  // Set canonical to current URL (eliminate canonicalization conflicts)
                  addCanonicalTag(siteUrl + pathname);
                  
                  // Add self-reference in hreflang
                  addHreflangTag(currentLang, siteUrl + pathname);
                  
                  // Add references to other language versions
                  supportedLanguages.forEach(lang => {
                    if (lang !== currentLang) {
                      const alternateUrl = buildAlternateUrl(lang, pathWithoutLang);
                      addHreflangTag(lang, alternateUrl);
                    }
                  });
                  
                  // Add x-default (points to default language version)
                  const xDefaultUrl = buildAlternateUrl(defaultLanguage, pathWithoutLang);
                  addHreflangTag('x-default', xDefaultUrl);
                }
                
                function getLanguageFromPath(pathSegments) {
                  // Extract language from path or use default
                  const firstSegment = pathSegments[0] || '';
                  return supportedLanguages.includes(firstSegment) ? firstSegment : defaultLanguage;
                }
                
                function getPathWithoutLanguage(pathSegments, currentLang) {
                  // If first segment is a language code, remove it to get the rest of the path
                  if (pathSegments.length > 0 && pathSegments[0] === currentLang) {
                    return '/' + pathSegments.slice(1).join('/');
                  }
                  return '/' + pathSegments.join('/');
                }
                
                function buildAlternateUrl(lang, path) {
                  // Handle paths correctly - avoid double slashes
                  if (path === '/') {
                    return siteUrl + '/' + lang + '/';
                  }
                  return siteUrl + '/' + lang + path;
                }
                
                function removeExistingTags() {
                  // Remove all hreflang and canonical tags
                  document.querySelectorAll('link[rel="alternate"][hreflang], link[rel="canonical"]')
                    .forEach(el => el.parentNode?.removeChild(el));
                }
                
                function addHreflangTag(lang, url) {
                  const link = document.createElement('link');
                  link.rel = 'alternate';
                  link.hreflang = lang;
                  link.href = url;
                  document.head.appendChild(link);
                }
                
                function addCanonicalTag(url) {
                  const link = document.createElement('link');
                  link.rel = 'canonical';
                  link.href = url;
                  document.head.appendChild(link);
                }
                
                // Execute on page load and navigation
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', setupHreflangTags);
                } else {
                  setupHreflangTags();
                }
                
                // Handle SPA navigation
                window.addEventListener('popstate', setupHreflangTags);
                
                // Also handle programmatic navigation via history API
                const originalPushState = history.pushState;
                history.pushState = function() {
                  originalPushState.apply(this, arguments);
                  setupHreflangTags();
                };
              })();
            `,
          }}
        />
        
        {/* Prevent theme flickering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
                if (localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn(roboto.className, "bg-background antialiased")} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
