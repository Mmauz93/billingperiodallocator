'use client';

import { CustomCookieConsentBanner } from "@/components/custom-cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import I18nProvider from "@/components/i18n-provider";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const lang = path?.split('/')[1] === 'de' ? 'de' : 'en';
  
  return (
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
            <CustomCookieConsentBanner
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
          </I18nProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
} 
