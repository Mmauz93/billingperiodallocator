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
        
        {/* Script to inject hreflang tags into every page - Updated to fix remaining SEO issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const siteUrl = 'https://billsplitter.siempi.ch';
                const supportedLanguages = ['en', 'de'];
                
                function injectHreflangTags() {
                  // Remove all existing hreflang and canonical tags to avoid duplication
                  clearExistingTags();
                  
                  // Determine current page type and add appropriate tags
                  const path = window.location.pathname;
                  
                  if (path === '/' || path === '') {
                    // Root page (/) special case
                    addTagsForRootPage();
                  } else {
                    // Language pages and subpages
                    addTagsForLanguagePage(path);
                  }
                }
                
                function clearExistingTags() {
                  // Remove all alternate/hreflang and canonical tags
                  const tagsToRemove = document.querySelectorAll('link[rel="alternate"][hreflang], link[rel="canonical"]');
                  tagsToRemove.forEach(tag => {
                    if (tag.parentNode) {
                      tag.parentNode.removeChild(tag);
                    }
                  });
                }
                
                function addTagsForRootPage() {
                  // Root page should have itself as canonical (SINGLE SOURCE OF TRUTH)
                  addLinkTag('canonical', null, siteUrl + '/');
                  
                  // Root page hreflang tags - in exact order required by SEO tool
                  addLinkTag('alternate', 'x-default', siteUrl + '/');
                  addLinkTag('alternate', 'de', siteUrl + '/de/');
                  addLinkTag('alternate', 'en', siteUrl + '/en/');
                }
                
                function addTagsForLanguagePage(path) {
                  // Determine current language from path
                  const pathSegments = path.split('/').filter(Boolean);
                  const currentLang = pathSegments[0] && supportedLanguages.includes(pathSegments[0]) 
                    ? pathSegments[0] 
                    : 'en';
                  
                  // Get path without language prefix
                  let pathWithoutLang = '';
                  if (pathSegments.length > 1 && supportedLanguages.includes(pathSegments[0])) {
                    pathWithoutLang = '/' + pathSegments.slice(1).join('/');
                  }
                  
                  // Canonical should always point to current page (SINGLE SOURCE OF TRUTH)
                  const currentPageUrl = siteUrl + '/' + currentLang + (pathWithoutLang || '/');
                  addLinkTag('canonical', null, currentPageUrl);
                  
                  // First add self-reference (current language)
                  addLinkTag('alternate', currentLang, currentPageUrl);
                  
                  // Then add references to other language versions
                  supportedLanguages.forEach(lang => {
                    if (lang !== currentLang) {
                      addLinkTag('alternate', lang, siteUrl + '/' + lang + (pathWithoutLang || '/'));
                    }
                  });
                  
                  // Always add x-default pointing to the root
                  addLinkTag('alternate', 'x-default', siteUrl + '/');
                }
                
                function addLinkTag(rel, hreflang, href) {
                  const link = document.createElement('link');
                  link.rel = rel;
                  if (hreflang) {
                    link.hreflang = hreflang;
                  }
                  link.href = href;
                  document.head.appendChild(link);
                }
                
                // Execute on page load
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', injectHreflangTags);
                } else {
                  injectHreflangTags();
                }
                
                // Also execute on navigation (for SPA behavior)
                window.addEventListener('popstate', injectHreflangTags);
                
                // For frameworks that use history.pushState
                const originalPushState = history.pushState;
                history.pushState = function() {
                  originalPushState.apply(this, arguments);
                  injectHreflangTags();
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
