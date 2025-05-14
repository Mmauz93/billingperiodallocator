import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown'; // For direct rendering or to pass to a minimal client component
import fs from 'fs/promises';
import { getServerSideTranslator } from '@/lib/translation';
import path from 'path';
import process from 'process';
import remarkGfm from 'remark-gfm';

// Assuming a minimal client component for markdown display if needed, or render directly.
// For simplicity in this step, we'll set it up to render markdown directly.
// If TermsOfUseClientDE is needed, it would be structured like the refactored EN version.

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const currentLang = params.lang || 'de';
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("Legal.termsOfUseTitle", "Nutzungsbedingungen");
  const siteUrl = 'https://billsplitter.siempi.ch';
  const pagePath = `legal/terms-of-use/`;
  const canonicalUrl = `${siteUrl}/${currentLang}/${pagePath}`;

  return {
    title: pageTitle + ' | BillSplitter',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${siteUrl}/en/${pagePath}`,
        'de': `${siteUrl}/de/${pagePath}`,
        'x-default': `${siteUrl}/en/${pagePath}`, // Default to English version
      },
    },
  };
}

// This component will render the markdown content with specific styling for headings.
function StyledMarkdownContent({ content }: { content: string }) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div className="custom-markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Using the styles previously defined in the DE client component
            h1: ({ /* node, */ ...props }) => <h1 {...props} className="text-2xl font-bold mt-12 mb-4 text-[#0284C7]" />,
            h2: ({ /* node, */ ...props }) => <h2 {...props} className="text-xl font-semibold mt-12 mb-4 text-[#0284C7]" />,
            h3: ({ /* node, */ ...props }) => <h3 {...props} className="text-lg font-medium mt-10 mb-3 text-[#0284C7]" />,
            p: ({ /* node, */ ...props }) => <p {...props} className="text-sm leading-relaxed text-muted-foreground mb-6" />,
            ul: ({ /* node, */ ...props }) => <ul {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-disc" />,
            ol: ({ /* node, */ ...props }) => <ol {...props} className="text-sm leading-relaxed text-muted-foreground mb-6 pl-6 list-decimal" />,
            li: ({ /* node, */ ...props }) => <li {...props} className="mb-2" />,
            a: ({ /* node, */ ...props }) => <a {...props} className="text-[#0284C7] hover:underline" />,
            strong: ({ /* node, */ ...props }) => <strong {...props} className="font-semibold" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}

export default async function TermsOfUsePageDE({ params }: { params: { lang: string }}) {
  const lang = params.lang || 'de';
  const { t } = getServerSideTranslator(lang);
  let termsContent = '';
  let lastUpdatedDate = '';

  try {
    const filePath = path.join(process.cwd(), 'public', `terms-of-use.de.md`);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    const dateMatch = rawContent.match(/^Zuletzt aktualisiert am (.*)$/m);
    if (dateMatch && dateMatch[1]) {
      lastUpdatedDate = dateMatch[1];
    }

    termsContent = rawContent
        .replace(/^# .*$/m, '') // Remove the first H1 heading from markdown
        .replace(/^Zuletzt aktualisiert am .*$/m, '') // Remove the German date line
        .trim();

  } catch (error) {
    console.error('Error loading German terms of use server-side:', error);
    termsContent = 'Die Nutzungsbedingungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.';
  }
  
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#0284C7]">
          {t("Legal.termsOfUseTitle", "Nutzungsbedingungen")}
        </h1>
        {lastUpdatedDate && (
          <p className="text-sm text-muted-foreground mt-2">
            {`${t("Legal.lastUpdatedPrefix", "Zuletzt aktualisiert am")} ${lastUpdatedDate}`}
          </p>
        )}
      </div>
      <StyledMarkdownContent content={termsContent} />
    </main>
  );
} 
