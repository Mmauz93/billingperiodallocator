"use client";

import React, { useEffect } from "react";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service";

import { ForceDarkTheme } from "@/components/force-dark-theme";
import ReactMarkdown from "react-markdown";
import { ThemeProvider } from "next-themes";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/translations";

interface TermsOfUseClientProps {
  initialContent: string;
  initialLang: string;
  lastUpdatedDate: string;
}

const TermsOfUseContent = ({ termsContent }: { termsContent: string }) => {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none cursor-default">
      <div className="custom-markdown-container cursor-default">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => (
              <h1
                className="text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-xl font-semibold mt-6 mb-3 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3
                className="text-lg font-semibold mt-4 mb-2 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default"
                {...props}
              />
            ),
            h4: ({ ...props }) => (
              <h4
                className="text-base font-semibold mt-3 mb-1 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default"
                {...props}
              />
            ),
            p: ({ ...props }) => (
              <p
                className="text-sm leading-relaxed text-muted-foreground mb-4 cursor-default"
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul
                className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-disc cursor-default"
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className="text-sm leading-relaxed text-muted-foreground mb-4 pl-5 list-decimal cursor-default"
                {...props}
              />
            ),
            li: ({ ...props }) => (
              <li className="mb-1 cursor-default" {...props} />
            ),
            a: ({ ...props }) => (
              <a
                className="text-primary hover:underline cursor-pointer select-none"
                {...props}
              />
            ),
            strong: ({ ...props }) => (
              <strong
                className="font-semibold text-foreground cursor-default"
                {...props}
              />
            ),
          }}
        >
          {termsContent}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default function TermsOfUseClientDE({
  initialContent,
  initialLang,
  lastUpdatedDate,
}: TermsOfUseClientProps) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const validLang =
      initialLang &&
      SUPPORTED_LANGUAGES.includes(initialLang as SupportedLanguage)
        ? (initialLang as SupportedLanguage)
        : ("de" as SupportedLanguage);

    if (i18n.language !== validLang) {
      i18n.changeLanguage(validLang);
    }
  }, [initialLang, i18n]);

  return (
    <ForceDarkTheme>
      <ThemeProvider attribute="class" forcedTheme="dark">
        <main className="container mx-auto max-w-3xl px-6 py-16 dark bg-background cursor-default">
          <div className="mb-10 text-center cursor-default">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent cursor-default">
              {t("Legal.termsOfUseTitle", "Nutzungsbedingungen")}
            </h1>
            {lastUpdatedDate && (
              <p className="text-sm text-muted-foreground mt-2 cursor-default">
                {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${lastUpdatedDate}`}
              </p>
            )}
          </div>
          <TermsOfUseContent termsContent={initialContent} />
        </main>
      </ThemeProvider>
    </ForceDarkTheme>
  );
}
