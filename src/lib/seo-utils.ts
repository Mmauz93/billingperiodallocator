// Utility function to generate consistent hreflang metadata for Next.js metadata
export function generateHreflangMetadata(path: string) {
  // Site URL and supported languages
  const siteUrl = 'https://billsplitter.siempi.ch';
  const supportedLanguages = ['en', 'de'];
  
  // Process path to ensure it's in the correct format
  // Remove leading slash if present
  const processedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Create language map for alternates
  const languageMap: Record<string, string> = {};
  
  // Extract language code if present in the path
  let currentLang = 'en'; // Default language
  let pathWithoutLang = processedPath;
  
  const pathSegments = processedPath.split('/');
  if (pathSegments.length > 0 && supportedLanguages.includes(pathSegments[0])) {
    currentLang = pathSegments[0];
    pathWithoutLang = pathSegments.slice(1).join('/');
  }
  
  // Handle different cases for language-specific paths
  supportedLanguages.forEach(lang => {
    if (pathWithoutLang) {
      // For pages with content after the language code
      languageMap[lang] = formatUrl(`${siteUrl}/${lang}/${pathWithoutLang}/`);
    } else {
      // For language root pages like /en/ or /de/
      languageMap[lang] = formatUrl(`${siteUrl}/${lang}/`);
    }
  });
  
  // Add x-default (always pointing to English version of the same content)
  if (pathWithoutLang) {
    languageMap['x-default'] = formatUrl(`${siteUrl}/en/${pathWithoutLang}/`);
  } else {
    languageMap['x-default'] = formatUrl(`${siteUrl}/en/`);
  }
  
  // Generate canonical URL based on whether this is a language path or not
  let canonicalUrl;
  
  if (processedPath === '') {
    // Special case for site root
    canonicalUrl = formatUrl(`${siteUrl}/`);
  } else if (supportedLanguages.includes(pathSegments[0])) {
    // If path starts with language code, use full path as canonical
    canonicalUrl = formatUrl(`${siteUrl}/${processedPath}${processedPath.endsWith('/') ? '' : '/'}`);
  } else {
    // For non-language paths, prepend with current language
    canonicalUrl = formatUrl(`${siteUrl}/${currentLang}/${processedPath}${processedPath.endsWith('/') ? '' : '/'}`);
  }
  
  return {
    canonical: canonicalUrl,
    languages: languageMap
  };
}

// Helper function to ensure URL is properly formatted with no double slashes
function formatUrl(url: string): string {
  return url.replace(/:\/\//, '___PROTOCOL___')
          .replace(/\/\//g, '/')
          .replace(/___PROTOCOL___/, '://');
} 
