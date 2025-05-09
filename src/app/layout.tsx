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

  // Get the current URL for canonical link - using absolute URL with language prefix
  const getCanonicalUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      // Remove trailing slash if present
      const path = url.pathname.endsWith('/') && url.pathname.length > 1 
        ? url.pathname.slice(0, -1) 
        : url.pathname;
      
      return `https://billsplitter.siempi.ch${path}`;
    }
    
    if (pathname) {
      // Remove trailing slash if present
      const path = pathname.endsWith('/') && pathname.length > 1 
        ? pathname.slice(0, -1) 
        : pathname;
      
      return `https://billsplitter.siempi.ch${path}`;
    }
    
    return `https://billsplitter.siempi.ch/${currentLang}`;
  };

  return (
    <html lang={currentLang} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="alternate"
          hrefLang="de"
          href="https://billsplitter.siempi.ch/de/"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://billsplitter.siempi.ch/en/"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://billsplitter.siempi.ch/en/"
        />
        {/* Canonical link to prevent duplicate HTTP/HTTPS indexing */}
        <link
          rel="canonical"
          href={getCanonicalUrl()}
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
