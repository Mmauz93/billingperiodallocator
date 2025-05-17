import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service";

import { Metadata } from "next";
import { ReactNode } from "react";
import WwwRedirector from "@/components/www-redirector";

interface LangLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
    ? params.lang
    : "en";
  const siteUrl = "https://billsplitter.siempi.ch";

  return {
    alternates: {
      canonical: `${siteUrl}/${lang}/`,
      languages: {
        en: `${siteUrl}/en/`,
        de: `${siteUrl}/de/`,
        "x-default": `${siteUrl}/en/`,
      },
    },
  };
}

export default function LangLayout({ children }: LangLayoutProps) {
  return (
    <>
      <WwwRedirector />
      {children}
    </>
  );
}
