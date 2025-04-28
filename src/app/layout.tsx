// Root Layout remains a Server Component

import "./globals.css";

import { Metadata, Viewport } from 'next';

import I18nProvider from "@/components/i18n-provider";
import { Roboto } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap',
});

// Define metadataBase for absolute URLs
const siteUrl = 'https://billsplitter.siempi.ch';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BillSplitter | Invoice Split Calculator for Accurate Accounting Periods',
    template: '%s | BillSplitter',
  },
  description: "Easily split invoices across fiscal years or accounting periods. Instantly calculate ARAP and PRAP allocations — GDPR compliant, no registration required.",
  keywords: ['invoice allocation', 'split invoice', 'multi-year billing', 'fiscal year allocation', 'proportional calculation', 'accounting tool', 'budgeting tool', 'accrual accounting'],
  openGraph: {
    title: 'BillSplitter | Invoice Split Calculator',
    description: 'Split invoices into correct accounting periods. Fast, secure, and GDPR compliant.',
    url: siteUrl,
    siteName: 'BillSplitter',
    images: [
      {
        url: '/og-image.png', // Updated to correct path
        width: 1200,
        height: 630,
        alt: 'BillSplitter - Invoice Split Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
  alternates: {
    languages: {
      'en': `${siteUrl}/en`,
      'de': `${siteUrl}/de`,
    }
  }
};

// Optional: Add viewport settings
export const viewport: Viewport = {
  themeColor: '#2E5A8C',
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
        <link rel="alternate" hrefLang="de" href="https://billsplitter.siempi.ch/de/" />
        <link rel="alternate" hrefLang="en" href="https://billsplitter.siempi.ch/en/" />
      </head>
      <body className={`${roboto.className} min-h-screen flex flex-col`}>
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
