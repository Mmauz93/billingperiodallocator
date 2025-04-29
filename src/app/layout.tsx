// Root Layout remains a Server Component

import "@/app/globals.css";

import { Metadata, Viewport } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import I18nProvider from "@/components/i18n-provider";
import { Roboto } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Define metadataBase for absolute URLs
const siteUrl = "https://billsplitter.siempi.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BillSplitter | Split Invoices Easily Across Fiscal Years",
    template: "%s | BillSplitter",
  },
  description:
    "Use BillSplitter to split invoices across fiscal periods. Automate prepaid expenses and deferred revenue allocation — simple, accurate, fast. No login required.",
  keywords: [
    "invoice allocation",
    "split invoice",
    "multi-year billing",
    "fiscal year allocation",
    "proportional calculation",
    "accounting tool",
    "budgeting tool",
    "accrual accounting",
    "deferred revenue",
    "prepaid expenses",
  ],
  openGraph: {
    title: "BillSplitter | Invoice Split Calculator",
    description:
      "Split invoices into correct accounting periods. Fast, secure, and GDPR compliant.",
    url: siteUrl,
    siteName: "BillSplitter",
    images: [
      {
        url: "/og-image.png", // Updated to correct path
        width: 1200,
        height: 630,
        alt: "BillSplitter - Invoice Split Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/images/icon.svg",
    shortcut: "/images/icon.svg",
    apple: "/images/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    languages: {
      en: `${siteUrl}/en`,
      de: `${siteUrl}/de`,
    },
  },
};

// Optional: Add viewport settings
export const viewport: Viewport = {
  themeColor: "#2E5A8C",
};

export default function RootLayout({
  children,
  params: { locale = "en" }, // Still keep locale for potential future use, though i18next handles detection
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content={viewport.toString()} />
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
      </head>
      <body className={cn(roboto.className, "bg-background")} suppressHydrationWarning>
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <I18nProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 pt-16">{children}</main>
                  <Footer />
                </div>
              </I18nProvider>
            </TooltipProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
