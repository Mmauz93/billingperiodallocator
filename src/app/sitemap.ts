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

  routes.forEach(route => {
    // Determine the page-specific path (e.g., /app/ or /legal/impressum/)
    // For the root route '/', pageSpecificPath will be effectively empty or handled by being just the language code.
    let pageSpecificPath = route;
    if (route !== '/' && !route.endsWith('/')) {
      pageSpecificPath = `${route}/`;
    }
    if (route === '/') { // For the site's conceptual root, which maps to language roots
        pageSpecificPath = '/'; // Represents the part after the language code, which is nothing for /en/ or /de/
    }

    // Generate entries for each language
    languages.forEach(lang => {
      // Safely replace double slashes only in the path, not in the protocol
      const fixUrlSlashes = (url: string) => {
        return url.replace(/:\/\//, '___PROTOCOL___')
                 .replace(/\/\//g, '/')
                 .replace(/___PROTOCOL___/, '://');
      };
      
      const url = fixUrlSlashes(`${siteUrl}/${lang}${pageSpecificPath === '/' ? '/' : pageSpecificPath}`);
      
      const alternates: { [key: string]: string } = {};
      languages.forEach(altLang => {
        alternates[altLang] = fixUrlSlashes(`${siteUrl}/${altLang}${pageSpecificPath === '/' ? '/' : pageSpecificPath}`);
      });
      // x-default should point to the default language version of the current path
      // Assuming 'en' is the default language for x-default determination here for simplicity, can be refined
      alternates['x-default'] = fixUrlSlashes(`${siteUrl}/en${pageSpecificPath === '/' ? '/' : pageSpecificPath}`);

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: (route === '/' || route === '/app') ? 1.0 : 0.8,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Deduplicate entries based on URL (though logic should ideally produce unique URLs per language variant)
  const uniqueSitemap = Array.from(new Map(sitemapEntries.map(item => [item.url, item])).values());

  return uniqueSitemap;
} 
