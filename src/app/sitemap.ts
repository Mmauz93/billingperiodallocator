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
  const sitemap: MetadataRoute.Sitemap = [];
  
  // Add routes for each language
  languages.forEach(lang => {
    routes.forEach(route => {
      // Skip root route as it redirects to language route
      if (route === '/' && lang === 'de') {
        sitemap.push({
          url: `${siteUrl}/${lang}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 1.0,
        });
      } else if (route !== '/') {
        sitemap.push({
          url: `${siteUrl}/${lang}${route}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: route === '/app' ? 1.0 : 0.8,
        });
      }
    });
  });
  
  // Add English root as default
  sitemap.push({
    url: `${siteUrl}/en`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1.0,
  });

  return sitemap;
} 
