import { Metadata } from 'next';
import React from 'react';
import { getServerSideTranslator } from '@/lib/translation';

// Import TranslationOptions type for t function signature
interface TranslationOptions { // Re-define or import if global
  defaultValue?: string;
  values?: Record<string, string | number>;
}

export async function generateMetadata(/* { params }: { params: { lang: string } } */): Promise<Metadata> {
  const currentLang = 'de'; // For this specific /de/ page
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("General.impressum", "Impressum");
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = `legal/impressum/`;
  const canonicalUrl = `${siteUrl}/${currentLang}/${pagePath}`;

  return {
    title: pageTitle + ' | BillSplitter',
    alternates: {
      canonical: canonicalUrl,
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

function ImpressumContentServer({ lastUpdated, lang, t }: ImpressumContentProps) {
  const titleText = t("General.impressum", "Impressum");
    
  return (
    <article className="prose prose-lg dark:prose-invert" aria-label="Legal information">
      <div className="text-center mb-10">
        {/* Using consistent H1 styling from other refactored legal pages */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0284C7] to-[#0284C7]/80 bg-clip-text text-transparent">
          {titleText}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{lastUpdated}</p>
      </div>
      
      <div className="space-y-8">
        <section>
          {/* Using consistent H2 styling */}
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#0284C7]/90 to-[#0284C7]/70 bg-clip-text text-transparent">
            {lang === 'de' ? 'Verantwortlich für diese Website' : 'Responsible for this website'}
          </h2>
          <p className="mb-6 text-sm leading-relaxed">
            <strong>Siempi AG</strong><br />
            Mauro Miotti<br />
            Birkenstrasse 47<br />
            CH-6343 Rotkreuz<br />
            Schweiz<br />
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
}

export default async function ImprintPageDE(/* { params }: { params: { lang: string }} */) {
  const lang = 'de'; // Explicitly 'de' for this page
  const { t } = getServerSideTranslator(lang);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  const lastUpdatedDisplayString = `${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${formattedDate}`;
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <ImpressumContentServer 
        lastUpdated={lastUpdatedDisplayString}
        lang={lang}
        t={t}
      />
    </main>
  );
} 
