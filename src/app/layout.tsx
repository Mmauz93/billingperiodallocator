// Root Layout remains a Server Component
import "./globals.css";

import { Metadata, Viewport } from 'next';

import I18nProvider from "@/components/i18n-provider";
import { Inter } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

// Define metadataBase for absolute URLs
const siteUrl = 'https://billsplitter.siempi.ch';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Multi-Year Invoice Split Calculator | Siempi',
    template: '%s | Invoice Splitter',
  },
  description: "Easily allocate multi-year invoice totals across individual fiscal years or periods. Accurate proportional calculation for accounting and budgeting.",
  keywords: ['invoice allocation', 'split invoice', 'multi-year billing', 'fiscal year allocation', 'proportional calculation', 'accounting tool', 'budgeting tool', 'accrual accounting'],
  openGraph: {
    title: 'Multi-Year Invoice Split Calculator | Siempi',
    description: 'Allocate multi-year invoice amounts accurately across fiscal periods.',
    url: siteUrl,
    siteName: 'Siempi Invoice Splitter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Siempi Invoice Split Calculator Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Optional: Add viewport settings
export const viewport: Viewport = {
  themeColor: 'black',
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
      <head>
        <meta name="viewport" content={viewport.toString()} />
      </head>
      <body className={`${inter.className} pb-28`}>
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

          {/* ConsentManager rendering removed - logic is now in InvoiceCalculatorClient */}
      </body>
    </html>
  );
}
