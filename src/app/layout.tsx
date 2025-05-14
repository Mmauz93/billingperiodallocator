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
  return (
    <html className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Theme detection - must run early */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Clean up any previous theme classes to prevent conflicts
                  document.documentElement.classList.remove('light', 'dark', 'force-dark-active');
                  
                  // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
                  if (localStorage.getItem('theme') === 'dark' || 
                     (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.style.colorScheme = 'light';
                  }
                  
                  // Set data attribute that can be used for syncing components
                  document.documentElement.setAttribute('data-theme-initialized', 'true');
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
        
        {/* Anti-flicker script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Add loading class to prevent flicker during initialization
                document.documentElement.classList.add('loading');
                
                // Remove loading class after load
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    document.documentElement.classList.remove('loading');
                  }, 50);
                });
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
