"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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
    // Use translated title directly, fallback to static if not mounted or t not ready
    const titleText = isMounted && t ? t("General.impressum") : (lang === 'de' ? "Impressum" : "Imprint");
    
    return (
      <article className="prose prose-lg dark:prose-invert" aria-label="Legal information">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0284C7]">
            {titleText}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{lastUpdated}</p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-[#0284C7]">
              {lang === 'de' ? 'Verantwortlich für diese Website' : 'Responsible for this website'}
            </h2>
            <p className="mb-6 text-sm leading-relaxed">
              <strong>Siempi AG</strong><br />
              Mauro Miotti<br />
              Birkenstrasse 47<br />
              CH-6343 Rotkreuz<br />
              Switzerland<br />
              Email: <a href="mailto:info@siempi.ch" className="text-[#0284C7] hover:underline">info@siempi.ch</a>
            </p>
          </section>
          
          <section className="border-t border-muted pt-6">
            <h2 className="text-xl font-semibold mb-2 text-[#0284C7]">
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
  
  const getUrlLanguage = useCallback(() => {
    if (!pathname) return 'de';
    const pathSegments = pathname.split('/');
    // Ensure correct language detection for /de path
    return pathSegments.length > 1 && pathSegments[1] === 'de' ? 'de' : (pathSegments.length > 1 && pathSegments[1] === 'en' ? 'en' : 'de');
  }, [pathname]);
  
  useEffect(() => {
    setMounted(true);
    const urlLang = getUrlLanguage();
    if (i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
    }
    document.title = t("General.impressum") + " | BillSplitter";
  }, [i18n, getUrlLanguage, t]); // getUrlLanguage is memoized, added t to dependencies
  
  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-16 min-h-[500px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const currentLang = getUrlLanguage();
  const today = new Date();
  // Format date for German locale
  const formattedDate = today.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  // Construct the lastUpdated string manually using a German prefix
  const lastUpdatedDisplayString = `${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`;
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16"> {/* Standardized max-width */}
      <NoSSR>
        <ImpressumContent 
          lastUpdated={lastUpdatedDisplayString}
          isMounted={mounted}
          lang={currentLang}
        />
      </NoSSR>
    </main>
  );
} 
