"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  let lang = "en";
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/de")) {
      lang = "de";
    }
  }

  const title =
    lang === "de" ? "Ein Fehler ist aufgetreten" : "An Error Occurred";
  const message =
    lang === "de"
      ? "Entschuldigung, etwas ist schiefgegangen. Bitte versuchen Sie es später erneut."
      : "Sorry, something went wrong. Please try again later.";
  const tryAgain = lang === "de" ? "Erneut versuchen" : "Try Again";
  const goHome = lang === "de" ? "Zur Startseite" : "Go to Homepage";

  return (
    <html lang={lang}>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center bg-background text-foreground">
          <h1 className="text-4xl font-bold text-destructive mb-6">{title}</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {tryAgain}
            </button>
            <a
              href={lang === "de" ? "/de/" : "/en/"}
              className="px-6 py-3 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {goHome}
            </a>
          </div>
          {error?.digest && (
            <p className="mt-8 text-xs text-muted-foreground">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
