import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/language-service';

import { Metadata } from 'next';
import React from 'react';
import { getServerSideTranslator } from '@/lib/translation';

// Import TranslationOptions type for t function signature
interface TranslationOptions { // Re-define or import if global
  defaultValue?: string;
  values?: Record<string, string | number>;
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Validate language parameter
  const lang = (params.lang && SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage))
    ? params.lang as SupportedLanguage
    : 'en' as SupportedLanguage;
    
  const { t } = getServerSideTranslator(lang);
  const pageTitle = t("General.impressum", lang === 'de' ? "Impressum" : "Imprint");
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = 'legal/impressum/'; // Path specific to this page

  return {
    title: pageTitle + ' | BillSplitter',
    alternates: {
      canonical: `${siteUrl}/${lang}/${pagePath}`,
      languages: {
        'en': `${siteUrl}/en/${pagePath}`,
        'de': `${siteUrl}/de/${pagePath}`,
        'x-default': `${siteUrl}/en/${pagePath}`,
      },
    },
  };
}

interface ImpressumContentProps {
  lastUpdated: string;
  lang: string;
  t: (key: string, optionsOrDefaultValue?: TranslationOptions | string) => string;
}

// Keep ImpressumContent as a separate component for structure, but it's a Server Component part
function ImpressumContent({ lastUpdated, lang, t }: ImpressumContentProps) {
  const title = t("General.impressum", lang === 'de' ? "Impressum" : "Imprint");
    
  return (
    <article className="prose prose-lg dark:prose-invert cursor-default" aria-label="Legal information">
      <div className="text-center mb-10 cursor-default">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent cursor-default">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 cursor-default">{lastUpdated}</p>
      </div>
      
      <div className="space-y-8 cursor-default">
        <section className="cursor-default">
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default">
            {lang === 'de' ? 'Verantwortlich für diese Website' : 'Responsible for this website'}
          </h2>
          <p className="mb-6 text-sm leading-relaxed cursor-default">
            <strong>Siempi AG</strong><br />
            Mauro Miotti<br />
            Birkenstrasse 47<br />
            CH-6343 Rotkreuz<br />
            Switzerland<br />
            Email: <a href="mailto:info@siempi.ch" className="text-primary hover:underline cursor-pointer select-none">info@siempi.ch</a>
          </p>
        </section>
        
        <section className="border-t border-muted pt-6 cursor-default">
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent cursor-default">
            {lang === 'de' ? 'Handelsregister' : 'Commercial Register'}
          </h2>
          <p className="text-sm leading-relaxed cursor-default">
            {lang === 'de' ? 'Eingetragen im Handelsregister des Kantons Zug' : 'Registered in the Commercial Register of the Canton of Zug'}<br />
            UID: CHE-369.093.556<br />
            {lang === 'de' ? 'Handelsregisternummer' : 'Commercial Register Number'}: CH-170.3.042.725-7
          </p>
        </section>
      </div>
    </article>
  );
}

export default async function ImprintPage({ params }: { params: { lang: string }}) {
  // Validate language parameter
  const paramLang = (params.lang && SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage))
    ? params.lang as SupportedLanguage
    : 'en' as SupportedLanguage;
    
  const { t } = getServerSideTranslator(paramLang);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString(paramLang === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lastUpdatedDisplayString = `${t("Legal.lastUpdatedPrefix", "Last updated on")} ${formattedDate}`;
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16 cursor-default">
      <ImpressumContent 
        lastUpdated={lastUpdatedDisplayString}
        lang={paramLang}
        t={t} // Pass the server-side t function
      />
    </main>
  );
} 
