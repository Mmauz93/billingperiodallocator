"use client";

import { ReactNode, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { redirect } from 'next/navigation';
import { useTranslation } from "react-i18next";

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Define interface for component props
interface ImpressumContentProps {
  lastUpdated: string;
  isMounted: boolean;
  lang: string;
}

// Use dynamic import with ssr: false to prevent SSR
const ImpressumContent = dynamic<ImpressumContentProps>(() => 
  Promise.resolve(({ lastUpdated, isMounted, lang }: ImpressumContentProps) => {
    const { t } = useTranslation();
    const title = isMounted ? t("General.impressum") : (lang === 'de' ? "Impressum" : "Imprint");
    
    return (
      <article className="prose prose-lg dark:prose-invert" aria-label="Legal information">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{lastUpdated}</p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent">
              {lang === 'de' ? 'Verantwortlich für diese Website' : 'Responsible for this website'}
            </h2>
            <p className="mb-6 text-sm leading-relaxed">
              <strong>Siempi AG</strong><br />
              Mauro Miotti<br />
              Birkenstrasse 47<br />
              CH-6343 Rotkreuz<br />
              Switzerland<br />
              Email: <a href="mailto:info@siempi.ch" className="text-primary hover:underline">info@siempi.ch</a>
            </p>
          </section>
          
          <section className="border-t border-muted pt-6">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent">
              {lang === 'de' ? 'Handelsregister' : 'Commercial Register'}
            </h2>
            <p className="text-sm leading-relaxed">
              {lang === 'de' ? 'Eingetragen im Handelsregister des Kantons Zug' : 'Registered in the Commercial Register of the Canton of Zug'}<br />
              UID: CHE-369.093.556<br />
              {lang === 'de' ? 'Handelsregisternummer' : 'Commercial Register Number'}: CH-170.3.042.725-7
            </p>
          </section>
        </div>
      </article>
    );
  }), 
  { ssr: false }
);

// Server component that redirects to language-specific version
export default function ImpressumRedirect() {
  // Redirects to default language version (English)
  redirect('/en/legal/impressum');
}

export function ImprintPage() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState("");
  const [lang, setLang] = useState("en");
  
  useEffect(() => {
    setMounted(true);
    setLang(i18n.language.startsWith('de') ? 'de' : 'en');
    setLastUpdatedText(t("General.lastUpdated", { date: format(new Date("2024-04-29"), "yyyy-MM-dd") }));
  }, [t, i18n.language]);
  
  return (
    <main className="container mx-auto max-w-2xl px-6 py-16">
      <NoSSR>
        <ImpressumContent 
          lastUpdated={lastUpdatedText || "Last Updated: 2024-04-29"}
          isMounted={mounted}
          lang={lang}
        />
      </NoSSR>
    </main>
  );
} 
