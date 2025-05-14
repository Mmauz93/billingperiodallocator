// Root Layout (Server Component)

import "@/app/globals.css";

import ClientLayout from "@/components/client-layout";
import { Roboto } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { metadata } from "./layout.metadata";

// Re-export the metadata
export { metadata };

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
  // const isDevelopment = process.env.NODE_ENV === 'development'; // Removed
  // console.log(`[Layout.tsx] NODE_ENV: ${process.env.NODE_ENV}, isDevelopment: ${isDevelopment}`); // Removed

  // Base CSP directives - Removed
  // let scriptSrc = "'self' 'unsafe-inline' https://app.privacybee.io https://www.googletagmanager.com"; // Removed
  
  // /** // Removed block comment
  //  * Content Security Policy (CSP) Configuration
  //  * 
  //  * This is the single source of truth for the application's CSP.
  //  * - 'unsafe-eval' is added *unconditionally* due to webpack runtime needs.
  //  * - In production, we maintain strict CSP for security
  //  * - Each external domain has a clear purpose commented
  //  */
  // // Add 'unsafe-eval' unconditionally for webpack runtime (`new Function('return this')()`). // Removed
  // scriptSrc += " 'unsafe-eval'";  // Removed
  
  // // Log the reason for adding unsafe-eval - Removed
  // if (isDevelopment) { // Removed
  //   console.log("[Layout.tsx] Development mode: 'unsafe-eval' added to script-src for CSP (HMR/Fast Refresh/Webpack Runtime)."); // Removed
  // } else { // Removed
  //   // Production maintains strict CSP except for the required 'unsafe-eval'. // Removed
  //   console.log("[Layout.tsx] Production mode: 'unsafe-eval' added to script-src for CSP (Required for Webpack Runtime)."); // Removed
  // } // Removed

  // // Define img-src including the flag CDN and any analytics pixels // Removed
  // const imgSrc = "'self' data: blob: https://cdn.jsdelivr.net";  // Removed

  // // Define connect-src with all necessary API endpoints // Removed
  // const connectSrc = [ // Removed
  //   "'self'",                        // Main application // Removed
  //   "ws: localhost:*",               // WebSocket for development // Removed
  //   "http://localhost:*",            // Local development // Removed
  //   "https://app.privacybee.io",     // Privacy management // Removed
  //   "https://www.google-analytics.com" // Analytics // Removed
  // ].join(" "); // Removed

  // // Build the final CSP as a single string with clear formatting // Removed
  // const cspContent = [ // Removed
  //   "default-src 'self'",  // Removed
  //   `script-src ${scriptSrc}`, // Removed
  //   "style-src 'self' 'unsafe-inline' https://app.privacybee.io", // Removed
  //   `img-src ${imgSrc}`, // Removed
  //   "font-src 'self' data:", // Removed
  //   `connect-src ${connectSrc}`, // Removed
  //   "worker-src 'self' blob:", // Removed
  //   "frame-src 'self'", // Removed
  //   "manifest-src 'self'", // Removed
  //   "object-src 'none'", // Removed
  //   "base-uri 'self'", // Removed
  //   "form-action 'self'" // Removed
  // ].join("; "); // Removed
  
  // // console.log("[Layout.tsx] Applying CSP:"); // Combined logging above // Removed
  // // console.log(cspContent); // Removed

  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Removed meta tag for CSP - Now handled in next.config.mjs */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Script to defer non-critical CSS - Temporarily commented out to prevent FOUC */}
        {/*
        <script
          id="defer-non-critical-css"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Target stylesheets loaded by Next.js from the /_next/static/css/ directory
                const mainStylesheets = document.querySelectorAll('head > link[rel="stylesheet"][href^="/_next/static/css/"]');
                mainStylesheets.forEach(link => {
                  // Apply deferral to all stylesheets matched by the selector
                  // The original check for data-n-g or data-n-href might have been too restrictive
                    link.rel = 'preload';
                    link.as = 'style';
                    link.onload = () => {
                      link.onload = null;
                      link.rel = 'stylesheet';
                    };
                });
              })();
            `,
          }}
        />
        */}
        
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
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          roboto.className
        )}
      >
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
