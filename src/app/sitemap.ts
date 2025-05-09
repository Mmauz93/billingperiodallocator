import { MetadataRoute } from 'next';

// Configure this route for static export
export const dynamic = 'force-static';

// Site URL for sitemap generation
const siteUrl = 'https://billsplitter.siempi.ch';

// Define supported languages
const languages = ['en', 'de'];

// Define routes for sitemap
const routes = [
  '/',       // Landing page
  '/app',    // Application
  '/legal/impressum',
  '/legal/privacy-policy',
  '/legal/terms-of-use',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Only generate entries for all language+route combinations
  // We're removing the root URL entry to prevent duplicate content issues
  routes.forEach(route => {
    // Process path to ensure proper formatting
    const processedRoute = route.startsWith('/') ? route.substring(1) : route;
    
    // Generate entries for each language
    languages.forEach(lang => {
      // Build the URL for this language+route combination
      const url = formatUrl(`${siteUrl}/${lang}/${processedRoute}/`);
      
      // Build language alternates map for hreflang tags
      const langAlternates: Record<string, string> = {};
      
      // Add entry for each language, ensuring each page references ALL language variants
      languages.forEach(altLang => {
        langAlternates[altLang] = formatUrl(`${siteUrl}/${altLang}/${processedRoute}/`);
      });
      
      // Add x-default, pointing to English version
      langAlternates['x-default'] = formatUrl(`${siteUrl}/en/${processedRoute}/`);

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '/app' || route === '/' ? 1.0 : 0.8,
        alternates: {
          languages: langAlternates,
        },
      });
    });
  });

  return sitemapEntries;
}

// Helper function to ensure URL is properly formatted with no double slashes
function formatUrl(url: string): string {
  return url.replace(/:\/\//, '___PROTOCOL___')
          .replace(/\/\//g, '/')
          .replace(/___PROTOCOL___/, '://');
} 
