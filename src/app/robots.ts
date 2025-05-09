import { MetadataRoute } from 'next';

// Configure for static export
export const dynamic = 'force-static';

// Modern Next.js robots.ts generator that allows indexing of all important content
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',          // Allow all paths by default
        disallow: [
          '/api/',           // Disallow API routes
          '/_next/',         // Disallow Next.js internal files
          '/static/',        // Disallow static files
        ],
      },
    ],
    sitemap: 'https://billsplitter.siempi.ch/sitemap.xml',
    host: 'https://billsplitter.siempi.ch',
  };
} 
