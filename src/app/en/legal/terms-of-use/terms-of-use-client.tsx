"use client";

import { SUPPORTED_LANGUAGES, getLanguageFromPath } from "@/translations";
import { useCallback, useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

// Props for the client component
interface TermsOfUseClientProps {
  initialContent: string;
  initialLang: string;
}

// Props for the content display component
interface TermsOfUseContentProps {
  termsContent: string;
}

// Content display component
const TermsOfUseContent = ({ termsContent }: TermsOfUseContentProps) => {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div className="custom-markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            h4: ({ ...props }) => <h4 className="text-base font-semibold mt-3 mb-1 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent" {...props} />,
            p: ({ ...props }) => <p className="text-sm leading-relaxed text-muted-foreground mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-disc" {...props} />,
            ol: ({ ...props }) => <ol className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-decimal" {...props} />,
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
            strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          }}
        >
          {termsContent}
        </ReactMarkdown>
      </div>
    </article>
  );
};


export default function TermsOfUseClient({ initialContent, initialLang }: TermsOfUseClientProps) {
  const { i18n, t } = useTranslation();
  const pathname = usePathname();
  const [termsContent, setTermsContent] = useState<string>(initialContent);
  const [langPrefix, setLangPrefix] = useState(initialLang);
  const [isMounted, setIsMounted] = useState(false);


  const loadTerms = useCallback(async (lang: string) => {
    let processedContent = '';
    try {
      const filePath = `/terms-of-use${lang === 'de' ? '.de' : ''}.md`;
      const response = await fetch(filePath);


      if (!response.ok) {
        throw new Error(`Failed to load terms from ${filePath}`);
      }


      const content = await response.text();
      processedContent = content
        .replace(/^# .*$/m, '')
        .replace(/^Last updated on.*$/m, '')
        .replace(/^Zuletzt aktualisiert am.*$/m, '')
        .trim();


      setTermsContent(processedContent);
    } catch (error) {
      console.error('Error loading terms of use client-side:', error);
      setTermsContent(lang === 'de'
        ? 'Die Nutzungsbedingungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.'
        : 'Failed to load terms of use. Please try again later.');
    }
  }, []);


  const getUrlLanguage = useCallback(() => {
    if (!pathname) return initialLang;
    const pathLanguage = getLanguageFromPath(pathname);
    return pathLanguage || initialLang;
  }, [pathname, initialLang]);


  useEffect(() => {
    setIsMounted(true);


    if (i18n.language !== langPrefix) {
      i18n.changeLanguage(langPrefix);
    }

    document.title = t("Legal.termsOfUseTitle") + " | BillSplitter";


  }, [langPrefix, i18n, t]);


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
  }, [isMounted, loadTerms]);


  useEffect(() => {
    if (!isMounted) return;


    const urlLang = getUrlLanguage();


    if (urlLang !== langPrefix) {
      setLangPrefix(urlLang);
      loadTerms(urlLang);


      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    }
  }, [pathname, isMounted, langPrefix, i18n, loadTerms, getUrlLanguage]);


  const today = new Date();
  const formattedDate = today.toLocaleDateString(langPrefix === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });


  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
          {t("Legal.termsOfUseTitle", "Terms of Use")}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {`${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`}
        </p>
      </div>
      <TermsOfUseContent termsContent={termsContent} />
    </main>
  );
} 
