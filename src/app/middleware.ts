import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/language-service";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Helper function to check if the path should be skipped by middleware
 */
function shouldSkipPath(pathname: string): boolean {
  // Skip if static file, API route, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return true;
  }

  // Skip if language prefix exists
  const pathnameHasLanguage = SUPPORTED_LANGUAGES.some(
    (language) =>
      pathname.startsWith(`/${language}/`) || pathname === `/${language}`,
  );
  
  return pathnameHasLanguage;
}

/**
 * Get the language from cookies, browser preference, or default
 */
function getLanguage(request: NextRequest): SupportedLanguage {
  // Check for language cookie
  const languageCookie = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  if (languageCookie && SUPPORTED_LANGUAGES.includes(languageCookie as SupportedLanguage)) {
    return languageCookie as SupportedLanguage;
  }

  // Check for Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    // Try to match preferred languages with our supported languages
    for (const language of acceptLanguage.split(",")) {
      const languageCode = language.split(";")[0].trim().substring(0, 2);
      if (SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
        return languageCode as SupportedLanguage;
      }
    }
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Middleware to handle internationalization
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for certain paths
  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  // Get language from cookies, Accept-Language header, or default
  const language = getLanguage(request);

  // Clone the URL and change it to include the language prefix
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${language}${pathname === "/" ? "" : pathname}`;

  // Redirect to the URL with language prefix
  return NextResponse.redirect(newUrl);
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: ["/((?!_next|images|api|.*\\.).*)", "/"],
};

