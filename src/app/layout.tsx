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
        
        {/* Script to inject hreflang tags into every page - Updated to match SEO requirements exactly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function injectHreflangTags() {
                  const siteUrl = 'https://billsplitter.siempi.ch';
                  const supportedLanguages = ['en', 'de'];
                  
                  // Get current path and language
                  const path = window.location.pathname;
                  
                  // Special handling for the exact URLs required by SEO tool
                  if (path === '/') {
                    // Root page (/) requires special hreflang setup
                    addHreflangForRootPage();
                  } else if (path === '/en/' || path === '/en') {
                    // English page (/en/) requires specific format
                    addHreflangForEnglishPage();
                  } else if (path === '/de/' || path === '/de') {
                    // German page (/de/) requires specific format
                    addHreflangForGermanPage();
                  } else {
                    // For other subpages, use standard format
                    addHreflangForSubpages();
                  }
                }

                // Clear existing hreflang tags to prevent duplicates
                function clearExistingHreflangTags() {
                  const existingTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
                  existingTags.forEach(tag => tag.parentNode.removeChild(tag));
                  
                  const canonicalTag = document.querySelector('link[rel="canonical"]');
                  if (canonicalTag) {
                    canonicalTag.parentNode.removeChild(canonicalTag);
                  }
                }
                
                // Function to add link tags
                function addLinkTag(rel, hreflang, href) {
                  const link = document.createElement('link');
                  link.rel = rel;
                  if (hreflang) {
                    link.hreflang = hreflang;
                  }
                  link.href = href;
                  document.head.appendChild(link);
                }
                
                // Root page (/) specific implementation - matches SEO tool requirements exactly
                function addHreflangForRootPage() {
                  clearExistingHreflangTags();
                  
                  // Canonical points to root
                  addLinkTag('canonical', null, 'https://billsplitter.siempi.ch/');
                  
                  // Exactly match the SEO tool requirements
                  addLinkTag('alternate', 'x-default', 'https://billsplitter.siempi.ch/');
                  addLinkTag('alternate', 'de', 'https://billsplitter.siempi.ch/de/');
                  addLinkTag('alternate', 'en', 'https://billsplitter.siempi.ch/en/');
                }
                
                // English page (/en/) specific implementation
                function addHreflangForEnglishPage() {
                  clearExistingHreflangTags();
                  
                  // Canonical points to English
                  addLinkTag('canonical', null, 'https://billsplitter.siempi.ch/en/');
                  
                  // Exactly match the SEO tool requirements
                  addLinkTag('alternate', 'en', 'https://billsplitter.siempi.ch/en/');
                  addLinkTag('alternate', 'de', 'https://billsplitter.siempi.ch/de/');
                  addLinkTag('alternate', 'x-default', 'https://billsplitter.siempi.ch/');
                }
                
                // German page (/de/) specific implementation
                function addHreflangForGermanPage() {
                  clearExistingHreflangTags();
                  
                  // Canonical points to German
                  addLinkTag('canonical', null, 'https://billsplitter.siempi.ch/de/');
                  
                  // Exactly match the SEO tool requirements
                  addLinkTag('alternate', 'de', 'https://billsplitter.siempi.ch/de/');
                  addLinkTag('alternate', 'en', 'https://billsplitter.siempi.ch/en/');
                  addLinkTag('alternate', 'x-default', 'https://billsplitter.siempi.ch/');
                }
                
                // Handle all other subpages
                function addHreflangForSubpages() {
                  const siteUrl = 'https://billsplitter.siempi.ch';
                  const supportedLanguages = ['en', 'de'];
                  const path = window.location.pathname;
                  const pathSegments = path.split('/').filter(Boolean);
                  
                  // Extract current language and path
                  let currentLang = pathSegments[0] || 'en';
                  if (!supportedLanguages.includes(currentLang)) {
                    currentLang = 'en';
                  }
                  
                  // Extract path without language prefix
                  let pathWithoutLang = '';
                  if (pathSegments.length > 1 && supportedLanguages.includes(pathSegments[0])) {
                    pathWithoutLang = '/' + pathSegments.slice(1).join('/');
                  }
                  
                  clearExistingHreflangTags();
                  
                  // Set canonical URL for current page
                  const canonicalUrl = \`\${siteUrl}/\${currentLang}\${pathWithoutLang}/\`;
                  addLinkTag('canonical', null, canonicalUrl);
                  
                  // Add hreflang for current language (self-reference)
                  addLinkTag('alternate', currentLang, canonicalUrl);
                  
                  // Add hreflang for other languages
                  supportedLanguages.forEach(lang => {
                    if (lang !== currentLang) {
                      addLinkTag('alternate', lang, \`\${siteUrl}/\${lang}\${pathWithoutLang}/\`);
                    }
                  });
                  
                  // Add x-default (pointing to root)
                  addLinkTag('alternate', 'x-default', \`\${siteUrl}/\`);
                }
                
                // Run on page load
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', injectHreflangTags);
                } else {
                  injectHreflangTags();
                }
                
                // Run again after any navigation (for SPA behavior)
                window.addEventListener('popstate', injectHreflangTags);
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
