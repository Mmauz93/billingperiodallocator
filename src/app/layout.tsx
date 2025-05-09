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
        
        {/* Script to inject hreflang tags into every page */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function injectHreflangTags() {
                  const siteUrl = 'https://billsplitter.siempi.ch';
                  const supportedLanguages = ['en', 'de'];
                  
                  // Get current path and language
                  const path = window.location.pathname;
                  const pathSegments = path.split('/').filter(Boolean);
                  
                  let currentLang = pathSegments[0] || 'en';
                  if (!supportedLanguages.includes(currentLang)) {
                    currentLang = 'en';
                  }
                  
                  // Extract path without language prefix
                  let pathWithoutLang = '';
                  if (pathSegments.length > 1 && supportedLanguages.includes(pathSegments[0])) {
                    pathWithoutLang = '/' + pathSegments.slice(1).join('/');
                  }
                  
                  // Function to add link tags
                  function addLinkTag(rel, hreflang, href) {
                    // Check if tag already exists to avoid duplicates
                    const existingTags = document.querySelectorAll(\`link[rel="\${rel}"]\${hreflang ? \`[hreflang="\${hreflang}"]\` : ''}\`);
                    for (const tag of existingTags) {
                      if (tag.getAttribute('href') === href) {
                        return; // Tag already exists
                      }
                    }
                    
                    const link = document.createElement('link');
                    link.rel = rel;
                    if (hreflang) {
                      link.hreflang = hreflang;
                    }
                    link.href = href;
                    document.head.appendChild(link);
                  }
                  
                  // Generate URLs for all language versions
                  const urls = {};
                  supportedLanguages.forEach(lang => {
                    if (pathWithoutLang) {
                      urls[lang] = \`\${siteUrl}/\${lang}\${pathWithoutLang}/\`;
                    } else {
                      urls[lang] = \`\${siteUrl}/\${lang}/\`;
                    }
                  });
                  
                  // Add x-default (always pointing to English version)
                  if (pathWithoutLang) {
                    urls['x-default'] = \`\${siteUrl}/en\${pathWithoutLang}/\`;
                  } else {
                    urls['x-default'] = \`\${siteUrl}/en/\`;
                  }
                  
                  // Generate canonical URL
                  let canonicalUrl;
                  if (path === '/') {
                    canonicalUrl = \`\${siteUrl}/en/\`;
                  } else if (pathWithoutLang) {
                    canonicalUrl = \`\${siteUrl}/\${currentLang}\${pathWithoutLang}/\`;
                  } else {
                    canonicalUrl = \`\${siteUrl}/\${currentLang}/\`;
                  }
                  
                  // Add canonical tag
                  addLinkTag('canonical', null, canonicalUrl);
                  
                  // Add hreflang tags for all supported languages and x-default
                  Object.entries(urls).forEach(([lang, url]) => {
                    addLinkTag('alternate', lang, url);
                  });
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
