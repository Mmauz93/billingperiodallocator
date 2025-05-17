/**
 * Language Service - Single source of truth for language management
 * This service centralizes all language-related logic in one place
 */

// Language-related constants
export const SUPPORTED_LANGUAGES = ["en", "de"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const LANGUAGE_COOKIE_NAME = "NEXT_LOCALE";
export const LANGUAGE_STORAGE_KEY = "billingperiodallocator-language";

// Store the current language in memory
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * Detect user's preferred language based on different sources
 * Order of precedence:
 * 1. URL path language segment
 * 2. Cookie
 * 3. Local storage
 * 4. Browser language
 * 5. Default language (en)
 */
export function detectLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    // Server-side - can't detect much, will rely on Next.js params
    return currentLanguage;
  }

  // Client-side detection (hydration phase)

  // 1. First priority: Get language from URL path
  const pathSegments = window.location.pathname.split("/");
  const urlLang =
    pathSegments.length > 1 &&
    SUPPORTED_LANGUAGES.includes(pathSegments[1] as SupportedLanguage)
      ? (pathSegments[1] as SupportedLanguage)
      : null;

  // 2. Second priority: Check cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };
  const cookieLang = getCookie(LANGUAGE_COOKIE_NAME);

  // 3. Third priority: Check localStorage
  const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  // 4. Fourth priority: Check browser language
  const browserLang =
    navigator.language &&
    SUPPORTED_LANGUAGES.includes(
      navigator.language.substring(0, 2).toLowerCase() as SupportedLanguage,
    )
      ? (navigator.language.substring(0, 2).toLowerCase() as SupportedLanguage)
      : null;

  // Use best source available
  const detectedLang =
    (urlLang && SUPPORTED_LANGUAGES.includes(urlLang) ? urlLang : null) ||
    (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang as SupportedLanguage)
      ? (cookieLang as SupportedLanguage)
      : null) ||
    (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)
      ? (storedLang as SupportedLanguage)
      : null) ||
    (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)
      ? browserLang
      : null) ||
    DEFAULT_LANGUAGE;

  // Update storage if URL language differs
  if (urlLang && storedLang !== urlLang) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, urlLang);
  }

  return detectedLang;
}

/**
 * Initialize the language service (call once during app startup)
 */
export function initializeLanguage(initialLanguage?: SupportedLanguage): void {
  // Set the initial language if provided (usually from URL/server)
  if (initialLanguage && SUPPORTED_LANGUAGES.includes(initialLanguage)) {
    currentLanguage = initialLanguage;
  } else {
    // Otherwise detect from available sources
    currentLanguage = detectLanguage();
  }

  // Set html attributes for accessibility and styling
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLanguage;
    document.documentElement.setAttribute("data-lang", currentLanguage);
    document.documentElement.classList.add(`lang-${currentLanguage}`);
  }
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  // Force detection if not yet initialized
  if (!currentLanguage) {
    currentLanguage = detectLanguage();
  }
  return currentLanguage;
}

/**
 * Set a cookie for language persistence
 */
export function setLanguageCookie(
  lang: SupportedLanguage,
  days: number = 365,
): void {
  if (typeof document === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}${expires}; path=/; SameSite=Lax`;

  // Also set application-specific cookie for backward compatibility
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${lang}${expires}; path=/; SameSite=Lax`;
}

/**
 * Change the language and update all storage locations
 */
export function changeLanguage(
  lang: SupportedLanguage,
  options: { navigate?: boolean } = {},
): boolean {
  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    console.warn(`Attempted to change to unsupported language: ${lang}`);
    return false;
  }

  // Skip if same language
  if (lang === currentLanguage) return false;

  // Update in-memory value
  currentLanguage = lang;

  // Client-side updates
  if (typeof window !== "undefined") {
    // Update storage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    setLanguageCookie(lang);

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);

    // Remove old language classes and add new one
    SUPPORTED_LANGUAGES.forEach((l) => {
      document.documentElement.classList.remove(`lang-${l}`);
    });
    document.documentElement.classList.add(`lang-${lang}`);

    // Notify components via custom event
    const event = new CustomEvent("languageChanged", {
      detail: { language: lang },
    });
    document.dispatchEvent(event);

    // Handle navigation if requested
    if (options.navigate) {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/");

      if (
        pathSegments.length > 1 &&
        SUPPORTED_LANGUAGES.includes(pathSegments[1] as SupportedLanguage)
      ) {
        // Replace language segment in URL
        pathSegments[1] = lang;
        const newPath = pathSegments.join("/");
        window.location.href = newPath;
      } else {
        // Add language segment if missing
        window.location.href = `/${lang}${pathname}`;
      }
    }
  }

  return true;
}

/**
 * Extract language from URL path
 */
export function getLanguageFromPath(path: string): SupportedLanguage | null {
  if (!path) return null;

  const segments = path.split("/");
  if (
    segments.length > 1 &&
    SUPPORTED_LANGUAGES.includes(segments[1] as SupportedLanguage)
  ) {
    return segments[1] as SupportedLanguage;
  }

  return null;
}

/**
 * Generate a URL with the specified language
 */
export function getLanguageUrl(lang: SupportedLanguage, path: string): string {
  if (!path) return `/${lang}/`;

  // Extract current path without language
  const segments = path.split("/");
  const currentLang =
    segments.length > 1 &&
    SUPPORTED_LANGUAGES.includes(segments[1] as SupportedLanguage)
      ? segments[1]
      : null;

  if (currentLang) {
    // Replace language in path
    segments[1] = lang;
    return segments.join("/");
  } else {
    // Add language to path
    return `/${lang}${path}`;
  }
}

// Initialize language detection on import (server-side)
// Client-side will initialize via Provider
if (typeof window === "undefined") {
  initializeLanguage();
}
