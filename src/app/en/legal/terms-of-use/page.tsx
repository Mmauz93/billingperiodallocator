import { Metadata } from "next";
import TermsOfUseClient from "./terms-of-use-client";
import fs from "fs/promises";
import { getServerSideTranslator } from "@/lib/translation"; // For metadata
import path from "path";
import process from "process";

export async function generateMetadata(): Promise<Metadata> {
  const currentLang = "en";
  const { t } = getServerSideTranslator(currentLang);
  const pageTitle = t("Legal.termsOfUseTitle", "Terms of Use");
  const siteUrl = "https://billsplitter.siempi.ch";
  const pagePath = `legal/terms-of-use/`;
  const canonicalUrl = `${siteUrl}/${currentLang}/${pagePath}`;

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

export default async function TermsOfUsePageEN() {
  const lang = "en";
  let termsContent = "";
  let lastUpdatedDate = "";

  try {
    const filePath = path.join(process.cwd(), "public", `terms-of-use.md`);
    const rawContent = await fs.readFile(filePath, "utf-8");

    const dateMatch = rawContent.match(/^Last updated on (.*)$/m);
    if (dateMatch && dateMatch[1]) {
      lastUpdatedDate = dateMatch[1];
    }

    termsContent = rawContent
      .replace(/^# .*$/m, "")
      .replace(/^Last updated on.*$/m, "")
      .trim();
  } catch (error) {
    console.error("Error loading terms of use server-side:", error);
    termsContent = "Failed to load terms of use. Please try again later.";
  }

  return (
    <TermsOfUseClient
      initialContent={termsContent}
      initialLang={lang}
      lastUpdatedDate={lastUpdatedDate}
    />
  );
}
