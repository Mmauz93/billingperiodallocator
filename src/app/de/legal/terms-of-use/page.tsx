"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { SUPPORTED_LANGUAGES, getLanguageFromPath } from "@/i18n-client";

import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

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
                h1: ({ ...props }) => <h1 {...props} className="text-2xl font-bold mt-12 mb-4 text-primary" />,
                h2: ({ ...props }) => <h2 {...props} className="text-xl font-semibold mt-12 mb-4 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent" />,
                h3: ({ ...props }) => <h3 {...props} className="text-lg font-medium mt-10 mb-3 text-primary" />,
                p: ({ ...props }) => <p {...props} className="text-sm leading-relaxed text-muted-foreground mb-6" />,
                ul: ({ ...props }) => <ul {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-disc" />,
                ol: ({ ...props }) => <ol {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-decimal" />,
                li: ({ ...props }) => <li {...props} className="mb-2" />,
                a: ({ ...props }) => <a {...props} className="text-primary hover:underline" />,
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
  
  // Function to load terms content - MOVED AND WRAPPED IN useCallback
  const loadTerms = useCallback(async (lang: string) => {
    setIsLoading(true);
    try {
      // Determine file path based on language
      const langSuffix = lang === 'de' ? '.de' : '';
      const response = await fetch(`/terms-of-use${langSuffix}.md`);
      
      if (!response.ok) {
        throw new Error('Failed to load terms');
      }
      
      const content = await response.text();
      // Remove the first heading and date line to avoid duplication
      const processedContent = content
        .replace(/^# .*$/m, '') // Remove the first heading
        .replace(/^Last updated on.*$/m, '') // Remove the date line for English
        .replace(/^Zuletzt aktualisiert am.*$/m, '') // Remove the date line for German
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
  }, [setIsLoading, setTermsContent]); // Dependencies for useCallback
  
  // Get current URL language - this ensures we don't fight with the URL's language
  const getUrlLanguage = useCallback(() => {
    if (!pathname) return 'de';
    const pathLanguage = getLanguageFromPath(pathname);
    return pathLanguage || 'de';
  }, [pathname]); // Added pathname as a dependency
  
  // First effect to handle mounting only
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    } else {
      // Set language prefix from URL
      const urlLang = getUrlLanguage();
      setLangPrefix(urlLang);
      
      // Sync i18n with URL language
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
      
      // Load terms based on current language
      loadTerms(urlLang);
    }
  }, [isMounted, getUrlLanguage, i18n, loadTerms]); // Adjusted dependencies
  
  // Listen for language change events from the language toggler
  useEffect(() => {
    if (!isMounted) return;
    
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language || customEvent.detail;
      
      if (newLang && typeof newLang === 'string' && SUPPORTED_LANGUAGES.includes(newLang)) {
        setLangPrefix(newLang);
        loadTerms(newLang);
      }
    };
    
    document.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [isMounted, loadTerms]); // loadTerms is now stable
  
  // Effect for pathname changes
  useEffect(() => {
    if (!isMounted) return;
    
    const urlLang = getUrlLanguage();
    
    // If URL language doesn't match current language prefix, update
    if (urlLang !== langPrefix) {
      setLangPrefix(urlLang);
      loadTerms(urlLang);
      
      // Sync i18n with URL
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    }
  }, [pathname, isMounted, langPrefix, i18n, getUrlLanguage, loadTerms]); // Adjusted dependencies
  
  const formattedDate = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
          {t("Legal.termsOfUseTitle", "Nutzungsbedingungen")}
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
