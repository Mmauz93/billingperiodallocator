'use client';
// Root Layout remains a Server Component

import "@/app/globals.css";

import { CustomCookieConsentBanner } from "@/components/custom-cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import I18nProvider from "@/components/i18n-provider";
import { Roboto } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const consentCookieName = "siempiBillSplitterConsent";
  const pathname = usePathname();
  
  // Functions for the cookie banner
  const handleGlobalAcceptAction = () => {
    console.log("Global consent accepted");
    if (typeof window !== "undefined") {
      window.location.reload(); // Reload to ensure GA picks up the change
    }
  };

  const handleGlobalDeclineAction = () => {
    console.log("Global consent declined");
  };

  // Simple privacy policy link handler
  const handleOpenPrivacyAction = () => {
    console.log(t("ConsentBanner.learnMoreButton"));
    window.location.href = `/${currentLang}/legal/privacy-policy`;
  };

  // Get current language from URL or use default
  const getCurrentLanguage = () => {
    if (!pathname) return 'en';
    
    const segments = pathname.split('/');
    if (segments.length > 1 && ['en', 'de'].includes(segments[1])) {
      return segments[1];
    }
    
    return 'en'; // Default language
  };
  
  const currentLang = getCurrentLanguage();

  // Get the current URL for canonical link
  const getCanonicalUrl = () => {
    let currentPath = '/'; 
    if (typeof window !== 'undefined') {
      currentPath = window.location.pathname; // Path from browser URL
    } else if (pathname) { 
      currentPath = pathname; // Path from usePathname()
    }

    // Ensure trailing slash for non-root paths
    if (currentPath !== '/' && !currentPath.endsWith('/')) {
      currentPath += '/';
    }
    // Avoid double slash if original path was empty and slash was added
    if (currentPath === '//') currentPath = '/'; 
      
    return `https://billsplitter.siempi.ch${currentPath}`;
  };

  const siteUrl = "https://billsplitter.siempi.ch";
  const supportedLanguages = ["en", "de"]; 
  let alternateLinks: { href: string; hrefLang: string; }[] = [];
  let xDefaultHref: string = `${siteUrl}/en/`; // Default to English root

  if (pathname) { // Ensure pathname is available
    const pathSegments = pathname.split('/').filter(Boolean);
    let pageSpecificPath = '/'; // The part of the path after the language code

    if (pathSegments.length > 0 && supportedLanguages.includes(pathSegments[0])) {
      // Language segment exists, e.g., /en/foo -> pageSpecificPath = /foo/
      if (pathSegments.length > 1) {
        pageSpecificPath = '/' + pathSegments.slice(1).join('/') + '/';
      }
      // If only lang segment, e.g. /en -> pageSpecificPath remains '/' (correct for /en/)
    } else if (pathSegments.length > 0) {
      // No recognized language segment, but not root. e.g. /foo (should become /foo/)
      pageSpecificPath = '/' + pathSegments.join('/') + '/';
    } 
    // If pathname was '/' or empty, pageSpecificPath remains '/' (root)
    
    // Clean up potential double slashes if pageSpecificPath became '//'
    if (pageSpecificPath === '//') pageSpecificPath = '/';

    // Construct the part of the URL that comes after the language code, ensuring trailing slash for root
    const effectivePathSuffix = pageSpecificPath === '/' ? '/' : pageSpecificPath;

    alternateLinks = supportedLanguages.map(lang => ({
      href: `${siteUrl}/${lang}${effectivePathSuffix}`.replace(/\/\//g, '/'),
      hrefLang: lang,
    }));
    
    // xDefaultHref should consistently point to the English version of the current path.
    xDefaultHref = `${siteUrl}/en${effectivePathSuffix}`.replace(/\/\//g, '/');

  }

  return (
    <html lang={currentLang} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Canonical Link */}
        <link rel="canonical" href={getCanonicalUrl()} />

        {/* Hreflang Links */}
        {alternateLinks.map(link => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={xDefaultHref} />

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
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <I18nProvider>
                <div className="flex flex-col min-h-screen w-full">
                  <Header />
                  <main className="flex-grow w-full pt-16">{children}</main>
                  <Footer />
                </div>
              </I18nProvider>
            </TooltipProvider>
          </ThemeProvider>
        </SettingsProvider>
        
        <CustomCookieConsentBanner
          onAcceptAction={handleGlobalAcceptAction}
          onDeclineAction={handleGlobalDeclineAction}
          consentCookieName={consentCookieName}
          onOpenPrivacyAction={handleOpenPrivacyAction}
        />
      </body>
    </html>
  );
}
