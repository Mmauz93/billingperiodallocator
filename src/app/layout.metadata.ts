import { Metadata } from 'next';

// Site URL for URL generation
const siteUrl = 'https://billsplitter.siempi.ch';

// Supported languages
const supportedLanguages = ['en', 'de'];

// Helper function to ensure URL is properly formatted with no double slashes
function formatUrl(url: string): string {
  return url.replace(/:\/\//, '___PROTOCOL___')
          .replace(/\/\//g, '/')
          .replace(/___PROTOCOL___/, '://');
}

// Generate language alternates map
const languageMap: Record<string, string> = {};

// Add root URL as canonical
const canonicalUrl = formatUrl(`${siteUrl}/`);

// Add entry for each supported language
supportedLanguages.forEach(lang => {
  // Format the URL correctly for each language root
  const url = formatUrl(`${siteUrl}/${lang}/`);
  languageMap[lang] = url;
});

// Add x-default (pointing to English version)
languageMap['x-default'] = formatUrl(`${siteUrl}/en/`);

// Export metadata for the root layout
export const metadata: Metadata = {
  title: 'BillSplitter – Split Invoices Across Fiscal Years',
  description: 'Split invoices across fiscal years with ease. Divide your invoices into monthly, quarterly, and yearly periods while complying with IFRS 15, HGB, and OR standards.',
  alternates: {
    canonical: canonicalUrl,
    languages: languageMap
  }
}; 
