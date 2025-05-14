'use client';

import { Footer } from "@/components/footer";
import HeadWithHreflang from "@/components/head-with-hreflang";
import { Header } from "@/components/header";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import TranslationProvider from "@/components/translation-provider";
import dynamic from "next/dynamic";
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
  const lang = path.split('/')[1] === 'de' ? 'de' : 'en';
  
  return (
    <SettingsProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <TranslationProvider>
            <HeadWithHreflang currentPath={path} currentLanguage={lang} />
            
            <div className="flex flex-col min-h-screen w-full overflow-y-auto">
              <Header />
              <main className="flex-grow w-full pt-16 pb-24">{children}</main>
              <Footer />
            </div>
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
          </TranslationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
} 
