"use client";

import { ReactNode, useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Define interface for component props
interface TermsOfUseContentProps {
  termsContent: string;
  isLoading: boolean;
  langPrefix: string;
}

// Use dynamic import with ssr: false to prevent SSR
const TermsOfUseContent = dynamic<TermsOfUseContentProps>(() => 
  Promise.resolve(({ termsContent, isLoading, langPrefix }: TermsOfUseContentProps) => {
    const { t } = useTranslation();
    
    return (
      <article className="prose prose-lg dark:prose-invert">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {!isLoading ? (langPrefix === 'de' ? 'Nutzungsbedingungen' : 'Terms of Use') : 'Terms of Use'}
        </h1>
          <p className="text-sm text-muted-foreground mt-2">
          {t('Legal.lastUpdated', 'Last updated on')} {new Date().toLocaleDateString(
            langPrefix === 'de' ? 'de-DE' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </p>
        </div>
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

export default function TermsOfUsePage() {
  const { i18n } = useTranslation();
  const [termsContent, setTermsContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [langPrefix, setLangPrefix] = useState("en");
  
  useEffect(() => {
    // Set language prefix
    setLangPrefix(i18n.language.startsWith('de') ? 'de' : 'en');
    
    // Add PrivacyBee script
    let script = document.querySelector<HTMLScriptElement>('script[src="https://app.privacybee.io/widget.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = "https://app.privacybee.io/widget.js";
      script.defer = true;
      document.head.appendChild(script);
    }

    async function loadTerms() {
      setIsLoading(true);
      try {
        // Determine file path based on language
        const langSuffix = i18n.language.startsWith('de') ? '.de' : '';
        const response = await fetch(`/terms-of-use${langSuffix}.md`);
        
        if (!response.ok) {
          throw new Error('Failed to load terms');
        }
        
        const content = await response.text();
        setTermsContent(content);
      } catch (error) {
        console.error('Error loading terms of use:', error);
        setTermsContent('Failed to load terms of use. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTerms();
  }, [i18n.language]);
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <NoSSR>
        <TermsOfUseContent 
          termsContent={termsContent} 
          isLoading={isLoading} 
          langPrefix={langPrefix} 
        />
      </NoSSR>
    </main>
  );
} 
