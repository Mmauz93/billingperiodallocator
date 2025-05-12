import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define the supported languages
const supportedLanguages = ['en', 'de'];

// The default language to use when no match is found
const defaultLanguage = 'en';

// Define cookie name
const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Middleware that handles language routing according to SEO best practices:
 * 1. Check for language cookie
 * 2. Check Accept-Language header
 * 3. Root URL permanently redirects to language-specific URL
 * 4. Non-language paths get redirected to language-specific paths
 * 5. Sets language cookie on redirect
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip if language prefix exists
  const pathnameHasLanguage = supportedLanguages.some(
    (language) => pathname.startsWith(`/${language}/`) || pathname === `/${language}`
  );
  if (pathnameHasLanguage) return;

  // 2. Skip if static file, API route, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') 
  ) {
    return;
  }

  // 3. Determine preferred language
  let language = defaultLanguage;
  
  // 3a. Check cookie first
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue && supportedLanguages.includes(cookieValue)) {
    language = cookieValue;
  } else {
    // 3b. Check Accept-Language header if no valid cookie
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
  }

  // 4. Redirect logic
  let redirectUrl: URL;
  let statusCode: 301 | 302;

  if (pathname === '/') {
    redirectUrl = new URL(`/${language}/`, request.url);
    statusCode = 301; // Permanent for root
  } else {
    redirectUrl = new URL(`/${language}${pathname}`, request.url);
    statusCode = 302; // Temporary for other paths
  }

  const response = NextResponse.redirect(redirectUrl, statusCode);
  
  // 5. Set the language cookie on the response
  response.cookies.set(COOKIE_NAME, language, { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  });

  return response;
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    '/((?!_next|images|api|.*\\.).*)',
    '/'
  ],
}; 
