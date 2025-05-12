"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES, getLanguageFromPath } from "@/translations";

import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Define interface for component props
interface TermsOfUseContentProps {
  termsContent: string;
  isLoading: boolean;
}

// Use dynamic import with ssr: false to prevent SSR
const TermsOfUseContent = dynamic<TermsOfUseContentProps>(() => 
  Promise.resolve(({ termsContent, isLoading }: TermsOfUseContentProps) => {
    return (
      <article className="prose prose-lg dark:prose-invert">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="custom-markdown-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 {...props} className="text-2xl font-bold mt-12 mb-4 text-[#0284C7]" />,
                h2: ({ ...props }) => <h2 {...props} className="text-xl font-semibold mt-12 mb-4 text-[#0284C7]" />,
                h3: ({ ...props }) => <h3 {...props} className="text-lg font-medium mt-10 mb-3 text-[#0284C7]" />,
                p: ({ ...props }) => <p {...props} className="text-sm leading-relaxed text-muted-foreground mb-6" />,
                ul: ({ ...props }) => <ul {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-disc" />,
                ol: ({ ...props }) => <ol {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-decimal" />,
                li: ({ ...props }) => <li {...props} className="mb-2" />,
                a: ({ ...props }) => <a {...props} className="text-[#0284C7] hover:underline" />,
                strong: ({ ...props }) => <strong {...props} className="font-semibold" />,
              }}
            >  
              {termsContent}
            </ReactMarkdown>
          </div>
        )}
      </article>
    );
  }), 
  { ssr: false }
);

export default function TermsOfUsePageDE() {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  const [termsContent, setTermsContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [langPrefix, setLangPrefix] = useState("de");
  const [isMounted, setIsMounted] = useState(false);
  
  // Function to load terms content - Wrapped in useCallback
  const loadTerms = useCallback(async (lang: string) => {
    setIsLoading(true);
    try {
      const langSuffix = lang === 'de' ? '.de' : '';
      const response = await fetch(`/terms-of-use${langSuffix}.md`);
      if (!response.ok) throw new Error('Failed to load terms');
      const content = await response.text();
      const processedContent = content
        .replace(/^# .*$/m, '')
        .replace(/^Last updated on.*$/m, '')
        .replace(/^Zuletzt aktualisiert am.*$/m, '')
        .trim();
      setTermsContent(processedContent);
    } catch (error) {
      console.error('Error loading terms of use:', error);
      setTermsContent(lang === 'de' 
        ? 'Die Nutzungsbedingungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.' 
        : 'Failed to load terms of use. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setTermsContent]); // Stable dependencies
  
  // Get current URL language - Wrapped in useCallback
  const getUrlLanguage = useCallback(() => {
    if (!pathname) return 'de'; // Default or initial language
    return getLanguageFromPath(pathname) || 'de';
  }, [pathname]);
  
  // Effect 1: Handle initial mount and URL/language synchronization
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      // On the very first run when isMounted becomes true, 
      // we determine the initial language and trigger a load.
      const initialLang = getUrlLanguage();
      setLangPrefix(initialLang);
      loadTerms(initialLang); // Initial load
      if (i18n.language !== initialLang) {
        i18n.changeLanguage(initialLang);
      }
      document.title = t("Legal.termsOfUseTitle") + " | BillSplitter";
      return;
    }

    // Subsequent runs (e.g., due to pathname changing via getUrlLanguage, or t/i18n changing)
    const currentUrlLang = getUrlLanguage();

    if (currentUrlLang !== langPrefix) {
      // Language has changed based on URL
      setLangPrefix(currentUrlLang);
      loadTerms(currentUrlLang);
      if (i18n.language !== currentUrlLang) {
        i18n.changeLanguage(currentUrlLang);
      }
      // Title will be updated when `t` changes or in the next render if i18n didn't change
    }
    
    // Always ensure title is set with current `t`
    // This covers cases where `t` might change without a language change (e.g. HMR of translation files)
    // or after i18n.changeLanguage has resolved if it was async.
    document.title = t("Legal.termsOfUseTitle") + " | BillSplitter";

  }, [isMounted, getUrlLanguage, langPrefix, loadTerms, i18n, t]); // Dependencies
  
  // Effect 2: Listen for external language change events
  useEffect(() => {
    if (!isMounted) return;
    
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;
      
      // Only update if the new language is valid and different from the current state
      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang) && newLang !== langPrefix) {
        console.log(`[TermsOfUse] Language changed event detected: ${newLang}`);
        setLangPrefix(newLang); // Update state
        loadTerms(newLang); // Load new content
        // i18n is likely already updated by the component that fired the event, but sync just in case
        if (i18n.language !== newLang) {
          i18n.changeLanguage(newLang);
        }
      }
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    return () => document.removeEventListener('languageChanged', handleLanguageChanged);
  }, [isMounted, loadTerms, i18n, langPrefix]); // Added langPrefix dependency
  
  const formattedDate = new Date().toLocaleDateString(langPrefix === 'de' ? 'de-DE' : 'en-US', { // Use state langPrefix
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine H1 title based on mount state to avoid hydration mismatch
  const h1Title = isMounted ? t("Legal.termsOfUseTitle") : (langPrefix === 'de' ? "Nutzungsbedingungen" : "Terms of Use");
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#0284C7]">
          {h1Title}
        </h1>
        {isMounted && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} {formattedDate}
          </p>
        )}
      </div>
      <NoSSR>
        <TermsOfUseContent 
          termsContent={termsContent} 
          isLoading={isLoading}
        />
      </NoSSR>
    </main>
  );
} 
