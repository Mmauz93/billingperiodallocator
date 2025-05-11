"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import React from "react";
// import ReactCountryFlag from "react-country-flag"; // Unused import
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{lastUpdated}</p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent">
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
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent">
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

export default function ImprintPage() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Get current URL language - this ensures we don't fight with the URL's language
  const getUrlLanguage = useCallback(() => {
    if (!pathname) return 'en';
    const pathSegments = pathname.split('/');
    return pathSegments.length > 1 && pathSegments[1] === 'de' ? 'de' : 'en';
  }, [pathname]);
  
  // Effect to handle mounting and language synchronization
  useEffect(() => {
    setMounted(true);
    const urlLang = getUrlLanguage();
    if (i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
    }
    document.title = t("General.impressum") + " | BillSplitter";
  }, [i18n, getUrlLanguage, t]); // getUrlLanguage is now memoized, added t

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Get current language from URL
  const currentLang = getUrlLanguage();
  const today = new Date();
  const formattedDate = today.toLocaleDateString(currentLang === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  // Construct the lastUpdated string manually
  const lastUpdatedDisplayString = `${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`;
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <NoSSR>
        <ImpressumContent 
          lastUpdated={lastUpdatedDisplayString} // Use the manually constructed string
          isMounted={mounted}
          lang={currentLang}
        />
      </NoSSR>
    </main>
  );
} 
