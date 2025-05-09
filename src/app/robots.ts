import { MetadataRoute } from 'next';

// Configure for static export
export const dynamic = 'force-static';

/**
 * Robots.txt configuration following best practices for multilingual SEO:
 * - Allows crawling of language-specific paths
 * - Allows crawling of the root URL (which redirects to the correct language)
 * - Prevents crawling of admin/internal routes
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',                  // Allow crawling of all public content
        disallow: [
          '/api/',                   // Prevent crawling of API routes
          '/_next/',                 // Prevent crawling of Next.js internals
          '/static/',                // Prevent crawling of static assets directory
        ],
      },
    ],
    sitemap: 'https://billsplitter.siempi.ch/sitemap.xml',
    host: 'https://billsplitter.siempi.ch',
  };
} 
