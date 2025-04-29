"use client";

import { ReactNode, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { format } from "date-fns";
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
      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>{title}</h1>
        <p className="text-sm text-muted-foreground">{lastUpdated}</p>
        
        <div>
          <p>
            {lang === 'de' ? 'Verantwortlich für den Inhalt dieser Website:' : 'Responsible for the content of this website:'}
          </p>

          <h2>Siempi AG</h2>
          <p>
            Mauro Miotti
          </p>
          <p>
            Birkenstrasse 47<br />
            CH-6343 Rotkreuz<br />
            Switzerland
          </p>
          
          <p>
            Email: <a href="mailto:info@siempi.ch">info@siempi.ch</a>
          </p>
          
          <h3>{lang === 'de' ? 'Handelsregister' : 'Commercial Register'}</h3>
          <p>{lang === 'de' ? 'Eingetragen im Handelsregister des Kantons Zug' : 'Registered in the Commercial Register of the Canton of Zug'}</p>
          <p>UID: CHE-369.093.556</p>
          <p>{lang === 'de' ? 'Handelsregisternummer' : 'Commercial Register Number'}: CH-170.3.042.725-7</p>
        </div>
      </article>
    );
  }), 
  { ssr: false }
);

export default function ImprintPage() {
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
    <main className="container mx-auto py-10">
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
