// Utility function to generate consistent hreflang metadata for Next.js metadata
export function generateHreflangMetadata(currentLanguage: string) {
  // Site URL and supported languages
  const siteUrl = 'https://billsplitter.siempi.ch';
  const supportedLanguages = ['en', 'de'];
  
  // Ensure currentLanguage is one of the supported languages
  if (!supportedLanguages.includes(currentLanguage)) {
    currentLanguage = 'en'; // Default to English if invalid
  }
  
  // Create language map for alternates
  const languageMap: Record<string, string> = {};
  
  // Generate absolute URLs for all language versions
  supportedLanguages.forEach(lang => {
    // Always use absolute URLs for hreflang tags
    languageMap[lang] = `${siteUrl}/${lang}/`;
  });
  
  // Add x-default (pointing to English version)
  languageMap['x-default'] = `${siteUrl}/en/`;
  
  return {
    // Use absolute URL for canonical
    canonical: `${siteUrl}/${currentLanguage}/`,
    languages: languageMap
  };
}

// This version is for subpages
export function generateSubpageHreflangMetadata(currentLanguage: string, path: string) {
  // Site URL and supported languages
  const siteUrl = 'https://billsplitter.siempi.ch';
  const supportedLanguages = ['en', 'de'];
  
  // Ensure currentLanguage is one of the supported languages
  if (!supportedLanguages.includes(currentLanguage)) {
    currentLanguage = 'en'; // Default to English if invalid
  }
  
  // Normalize path - remove leading and trailing slashes
  let normalizedPath = path;
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.substring(0, normalizedPath.length - 1);
  }
  
  // Create language map for alternates
  const languageMap: Record<string, string> = {};
  
  // Generate absolute URLs for all language versions
  supportedLanguages.forEach(lang => {
    // Always use absolute URLs for hreflang tags
    languageMap[lang] = `${siteUrl}/${lang}/${normalizedPath}/`;
  });
  
  // Add x-default (pointing to English version)
  languageMap['x-default'] = `${siteUrl}/en/${normalizedPath}/`;
  
  return {
    // Use absolute URL for canonical
    canonical: `${siteUrl}/${currentLanguage}/${normalizedPath}/`,
    languages: languageMap
  };
} 
