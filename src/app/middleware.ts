import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define the supported languages
const supportedLanguages = ['en', 'de'];

// The default language to use when no match is found
const defaultLanguage = 'en';

/**
 * Middleware that handles language routing according to SEO best practices:
 * 1. Root URL permanently redirects to language-specific URL (properly signaling search engines)
 * 2. Non-language paths get redirected to language-specific paths
 * 3. Respects user language preferences from browser when possible
 * 4. Uses 301 redirects for root path to ensure search engines understand our URL structure
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Skip middleware for paths that already have language prefix
  const pathnameHasLanguage = supportedLanguages.some(
    (language) => pathname.startsWith(`/${language}/`) || pathname === `/${language}`
  );

  if (pathnameHasLanguage) return;

  // Skip middleware for static files, API routes, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Static files like favicon.ico, robots.txt, etc.
  ) {
    return;
  }

  // Determine preferred language - respect browser settings when possible
  let language = defaultLanguage;
  
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLanguage = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2).toLowerCase())
      .find(lang => supportedLanguages.includes(lang));
    
    if (preferredLanguage) {
      language = preferredLanguage;
    }
  }

  // Root path uses 301 (permanent) redirect for proper SEO signaling
  if (pathname === '/') {
    const url = new URL(`/${language}/`, request.url);
    return NextResponse.redirect(url, 301);
  }
  
  // All other paths use 302 redirects (temporary) to preserve SEO equity
  const url = new URL(`/${language}${pathname}`, request.url);
  return NextResponse.redirect(url, 302);
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    // Skip all internal paths (_next, images, files with extension)
    '/((?!_next|images|api|.*\\.).*)',
    // Run on root path
    '/'
  ],
}; 
