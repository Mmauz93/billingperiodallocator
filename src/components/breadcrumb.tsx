import Link from "next/link";

interface BreadcrumbProps {
  currentPage: string;
  lang: string;
}

/**
 * Simple breadcrumb component with hardcoded translations for stability.
 * Using explicit line heights and vertical alignment to force consistent rendering.
 */
export function Breadcrumb({ currentPage, lang }: BreadcrumbProps) {
  const homeLabel = lang === "de" ? "Startseite" : "Home";

  return (
    <div className="mb-6 whitespace-nowrap">
      <span className="text-sm">
        <Link
          href={`/${lang}/`}
          className="text-muted-foreground hover:text-primary"
        >
          {homeLabel}
        </Link>
        <span className="inline-block mx-2" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block align-baseline"
          >
            <path
              d="M1 9L5 5L1 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-foreground" aria-current="page">
          {currentPage}
        </span>
      </span>

      {/* Schema.org structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: homeLabel,
                item: `https://billsplitter.siempi.ch/${lang}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: currentPage,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
