// Root Layout (Server Component)

import "@/app/globals.css";

import ClientLayout from "@/components/client-layout";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { metadata } from "./layout.metadata";

// import { Inter } from "next/font/google"; // REMOVED Inter




// Re-export the metadata
export { metadata };

/* // REMOVED Inter font loading
const inter = Inter({
  subsets: ["latin"],
  display: "optional", 
  variable: "--font-inter",
});
*/

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

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://app.privacybee.io" />
        <link rel="dns-prefetch" href="https://app.privacybee.io" />

        {/* Theme initialization script - coordinated with next-themes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // This script ensures the theme is consistent during initial page load
                // It uses the same logic as next-themes to determine the initial theme
                // This prevents flash of incorrect theme (FOIT)
                
                try {
                  // Check for stored theme preference - using same key as ThemeProvider
                  let theme = localStorage.getItem('theme');
                  
                  // If theme is not explicitly set, check system preference
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  // Apply the theme immediately to prevent flash
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  // Fail safe: localStorage unavailable, use system preference
                  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDarkMode) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                }
              })();
            `,
          }}
        />

        {/* Minimal anti-flicker script - prevents transition animations during load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Add loading class to disable transitions during initial load
                document.documentElement.classList.add('loading');
                
                // Remove loading class once page is fully loaded
                window.addEventListener('load', function() {
                  // Small delay to ensure all styles are applied
                  setTimeout(function() {
                    document.documentElement.classList.remove('loading');
                    // Mark theme as initialized to enable transitions
                    document.documentElement.setAttribute('data-theme-initialized', 'true');
                  }, 100);
                });
              })();
            `,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ClientLayout>{children}</ClientLayout>
        <Script
          id="privacybee-widget"
          src="https://app.privacybee.io/widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
