import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/language-service";

import { Metadata } from "next";
import TermsOfUseClientDE from "./terms-of-use-client";
import fs from "fs/promises";
import { getServerSideTranslator } from "@/lib/translation";
import path from "path";
import process from "process";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  // Validate language parameter
  const lang =
    params.lang &&
    SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage)
      ? (params.lang as SupportedLanguage)
      : ("de" as SupportedLanguage);

  const { t } = getServerSideTranslator(lang);
  const pageTitle = t("Legal.termsOfUseTitle", "Nutzungsbedingungen");
  const siteUrl = "https://billsplitter.siempi.ch";
  const pagePath = `legal/terms-of-use/`;
  const canonicalUrl = `${siteUrl}/${lang}/${pagePath}`;

  return {
    title: pageTitle + " | BillSplitter",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/${pagePath}`,
        de: `${siteUrl}/de/${pagePath}`,
        "x-default": `${siteUrl}/en/${pagePath}`,
      },
    },
  };
}

export default async function TermsOfUsePageDE() {
  const lang = "de";
  let termsContent = "";
  let lastUpdatedDate = "";

  try {
    const filePath = path.join(process.cwd(), "public", `terms-of-use.de.md`);
    const rawContent = await fs.readFile(filePath, "utf-8");

    const dateMatch = rawContent.match(/^Zuletzt aktualisiert am (.*)$/m);
    if (dateMatch && dateMatch[1]) {
      lastUpdatedDate = dateMatch[1];
    }

    termsContent = rawContent
      .replace(/^# .*$/m, "") // Remove the first H1 heading from markdown
      .replace(/^Zuletzt aktualisiert am .*$/m, "") // Remove the German date line
      .trim();
  } catch (error) {
    console.error("Error loading German terms of use server-side:", error);
    termsContent =
      "Die Nutzungsbedingungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.";
  }

  return (
    <TermsOfUseClientDE
      initialContent={termsContent}
      initialLang={lang}
      lastUpdatedDate={lastUpdatedDate}
    />
  );
}
