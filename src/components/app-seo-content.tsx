import { usePathname } from 'next/navigation';
import { useTranslation } from '@/translations';

// This component adds SEO-friendly text content to the app pages
export default function AppSeoContent() {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';
  const pathname = usePathname();
  const isAppPage = pathname?.includes('/app');

  // Skip rendering if we're not on the app page
  if (!isAppPage) {
    return null; // Don't render any SEO content if not on app page
  }

  // Define content in both languages for schema.org metadata only
  const content = {
    en: {
      title: "Invoice Period Allocation Calculator",
      description: "Split invoices across fiscal years, quarters, or months with precision."
    },
    de: {
      title: "Rechnungsperioden-Zuordnungsrechner",
      description: "Teilen Sie Rechnungen präzise auf Geschäftsjahre, Quartale oder Monate auf."
    }
  };

  // Use the content based on the current language
  const { /* title, */ description } = isGerman ? content.de : content.en;

  return (
    <div className="hidden">
      {/* Structured data for SEO - this will remain in the DOM but not be visible */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BillSplitter",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": description
          })
        }}
      />
    </div>
  );
} 
