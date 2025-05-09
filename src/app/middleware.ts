import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define the supported languages
const supportedLanguages = ['en', 'de'];

// The default language to use when no match is found
const defaultLanguage = 'en';

/**
 * Middleware that handles language routing according to SEO best practices:
 * 1. Root URL serves the default language content without redirect
 * 2. Non-language paths get redirected to language-specific paths
 * 3. Respects user language preferences from browser
 * 4. Preserves direct access to all language versions for SEO
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Check if the pathname already includes a language prefix
  const pathnameHasLanguage = supportedLanguages.some(
    (language) => pathname.startsWith(`/${language}/`) || pathname === `/${language}`
  );

  // If the pathname already has a language prefix, we don't need to do anything
  if (pathnameHasLanguage) return;

  // If the user is accessing static files or API routes, skip language handling
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Static files like favicon.ico, robots.txt, etc.
  ) {
    return;
  }

  // Get preferred language from Accept-Language header or use default
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

  // For the root path (/), rewrite to default language without redirect
  if (pathname === '/') {
    return NextResponse.rewrite(new URL(`/${language}`, request.url));
  }
  
  // Handle legal pages and all other non-language paths
  // Always redirect to language-specific versions to ensure consistent URLs
  const url = new URL(`/${language}${pathname}`, request.url);
  return NextResponse.redirect(url);
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Skip all internal paths (_next, images, files with extension)
    '/((?!_next|images|api|.*\\.).*)',
    // Run on root path
    '/'
  ],
}; 
