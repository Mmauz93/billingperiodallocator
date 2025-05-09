import { MetadataRoute } from 'next';

// Configure for static export
export const dynamic = 'force-static';

// Modern Next.js robots.ts generator that prevents duplicate content
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/en/', '/de/'],     // Allow language-specific paths
        disallow: ['/$', '/api/'],   // Explicitly disallow the root path and API routes
      },
    ],
    sitemap: 'https://billsplitter.siempi.ch/sitemap.xml',
    host: 'https://billsplitter.siempi.ch',
  };
} 
