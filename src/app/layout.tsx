import "./globals.css";

import { Inter } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import I18nProvider from "@/components/i18n-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Invoice Split Calculator",
  description: "Calculates proportional split of invoice amounts across fiscal years.",
};

export default function RootLayout({
  children,
  params: { locale = 'en' } // Still keep locale for potential future use, though i18next handles detection
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
         <SettingsProvider>
           <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
               <TooltipProvider>
                  {/* Wrap children with the i18n initializer */}
                  <I18nProvider>
                     {children}
                     <Toaster richColors /> {/* Use Sonner Toaster */}
                  </I18nProvider>
                </TooltipProvider>
           </ThemeProvider>
          </SettingsProvider>
      </body>
    </html>
  );
}
