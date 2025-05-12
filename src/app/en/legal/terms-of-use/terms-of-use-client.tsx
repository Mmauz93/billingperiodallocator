"use client";

import { useCallback, useEffect, useState } from "react"; // Keep ReactNode? No, remove.
import { usePathname } from "next/navigation"; // Removed useRouter
import { useTranslation } from "@/translations";
import { SUPPORTED_LANGUAGES, getLanguageFromPath } from "@/translations"; // Need this too

// Re-add ReactMarkdown related imports here if TermsOfUseContent is also moved (or keep it in page.tsx and pass down)
// Let's keep TermsOfUseContent in page.tsx for now and pass it down if needed, simplifies imports
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Props for the client component
interface TermsOfUseClientProps {
  initialContent: string;
  initialLang: string;
}

// Props for the content display component (can be defined here or passed)
interface TermsOfUseContentProps {
  termsContent: string;
}

// Content display component (copied from page.tsx)
// Needs ReactMarkdown and remarkGfm imports
const TermsOfUseContent = ({ termsContent }: TermsOfUseContentProps) => {
  return (
    <article className="prose prose-lg dark:prose-invert">
      <div className="custom-markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 {...props} className="text-2xl font-bold mt-12 mb-4 text-primary" />,
            h2: ({ ...props }) => <h2 {...props} className="text-xl font-semibold mt-12 mb-4 bg-gradient-to-r from-legal-primary/90 to-legal-primary/70 bg-clip-text text-transparent" />,
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
  }, [setTermsContent]);


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


    let script = document.querySelector<HTMLScriptElement>('script[src="https://app.privacybee.io/widget.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = "https://app.privacybee.io/widget.js";
      script.defer = true;
      document.head.appendChild(script);
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
  }, [pathname, isMounted, langPrefix, i18n, getUrlLanguage, loadTerms]);


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
