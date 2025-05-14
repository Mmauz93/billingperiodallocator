"use client";

import React, { useEffect } from "react"; // Keep useEffect for document.title if needed, or remove if handled by metadata

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/translations";

// Props for the client component
interface TermsOfUseClientProps {
  initialContent: string;
  initialLang: string;
  lastUpdatedDate: string; // Date string directly from server
}

// Content display component (can remain as is or be merged)
const TermsOfUseContent = ({ termsContent }: { termsContent: string }) => {
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

export default function TermsOfUseClient({ initialContent, initialLang, lastUpdatedDate }: TermsOfUseClientProps) {
  const { t, i18n } = useTranslation(); // Still needed for "Last updated on" prefix and main title

  // Set language context for translations if it mismatches initialLang, primarily for client-side consistency
  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang);
    }
    // document.title is handled by generateMetadata in the server component
  }, [initialLang, i18n]);

  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
          {t("Legal.termsOfUseTitle", "Terms of Use")}
        </h1>
        {lastUpdatedDate && (
          <p className="text-sm text-muted-foreground mt-2">
            {`${t("Legal.lastUpdatedPrefix", "Last updated on")} ${lastUpdatedDate}`}
          </p>
        )}
      </div>
      <TermsOfUseContent termsContent={initialContent} />
    </main>
  );
} 
