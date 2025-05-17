"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

// This component handles 404 errors with a better UX
export default function CustomNotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get current URL path to determine which language version we should go back to
    const path = window.location.pathname;
    const isGerman = path.includes("/de/");

    // Automatically redirect back to home after 3 seconds
    const timer = setTimeout(() => {
      router.push(isGerman ? "/de/" : "/en/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  // Don't show anything during SSR to avoid hydration mismatch
  if (!mounted) return null;

  // Determine language for the button text
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isGerman = currentPath.includes("/de/");
  const homeText = isGerman ? "Zurück zur Startseite" : "Back to Homepage";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      <h1 className="text-5xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">
        {isGerman ? "Seite nicht gefunden" : "Page Not Found"}
      </h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        {isGerman
          ? "Hoppla! Die Seite, die Sie suchen, existiert nicht."
          : "Oops! The page you're looking for doesn't exist."}
      </p>
      <Link
        href={isGerman ? "/de/" : "/en/"}
        className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {homeText}
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        {isGerman
          ? "Sie werden automatisch zur Startseite weitergeleitet..."
          : "You will be automatically redirected to the homepage..."}
      </p>
    </div>
  );
}
