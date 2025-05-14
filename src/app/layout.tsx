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

        {/* Anti-flicker script to prevent content shifts during load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent scroll restoration jumping during page load
                if ('scrollRestoration' in history) {
                  // Disable automatic scroll restoration
                  history.scrollRestoration = 'manual';
                }

                // Store current scroll position on reload only
                let isReload = false;
                let scrollPos = { x: 0, y: 0 };

                // Check if this is a reload (not initial page load)
                try {
                  if (performance && performance.navigation && performance.navigation.type === 1) {
                    isReload = true;
                    scrollPos = { x: window.scrollX, y: window.scrollY };
                  }
                } catch (e) {
                  // Performance API might not be available in all browsers
                }

                // Add preload class to disable transitions
                document.documentElement.classList.add('loading');

                // Remove loading classes after content is ready
                window.addEventListener('load', function() {
                  // Small delay to ensure all resources are loaded
                  setTimeout(function() {
                    // Restore scroll position if this was a reload
                    if (isReload) {
                      window.scrollTo(scrollPos.x, scrollPos.y);
                    }

                    // Finally re-enable transitions by removing the class
                    setTimeout(function() {
                      document.documentElement.classList.remove('loading');
                      // Re-enable automatic scroll restoration for future navigations
                      if ('scrollRestoration' in history) {
                        history.scrollRestoration = 'auto';
                      }
                    }, 100); // Keep a small delay for class removal
                  }, 50); // Keep a small delay before attempting scroll restore & class removal
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
