'use client';

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import TranslationProvider from "@/components/translation-provider";
import dynamic from "next/dynamic";
import { getLanguageFromPath } from "@/lib/language-service";
import { usePathname } from "next/navigation";

const DynamicCookieConsentBanner = dynamic(() => 
  import("@/components/custom-cookie-banner").then(mod => mod.CustomCookieConsentBanner),
  { ssr: false }
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname() || '';
  
  // Get language from path using our centralized language service
  const pathLang = getLanguageFromPath(path);
  const lang = pathLang || 'en';
  
  // Check if we're on a privacy policy page - don't show cookie banner there
  const isPrivacyPolicyPage = path.includes('/legal/privacy-policy');
  
  return (
    <SettingsProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="theme" // Explicitly set storage key to match anti-flicker script
      >
        <TooltipProvider>
          <TranslationProvider>
            <div className="flex flex-col min-h-screen w-full overflow-y-auto">
              <Header />
              <main className="flex-grow w-full pt-16 pb-24">{children}</main>
              <Footer />
            </div>
            
            {/* Only show cookie banner if not on privacy policy page */}
            {!isPrivacyPolicyPage && (
              <DynamicCookieConsentBanner
                onAcceptAction={() => {
                  console.log("Global consent accepted");
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                onDeclineAction={() => console.log("Global consent declined")}
                consentCookieName="siempiBillSplitterConsent"
                onOpenPrivacyAction={() => {
                  window.location.href = `/${lang}/legal/privacy-policy`;
                }}
              />
            )}
          </TranslationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
} 
