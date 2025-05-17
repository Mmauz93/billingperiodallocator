import { Metadata } from "next";
import { generateSubpageHreflangMetadata } from "@/lib/seo-utils";

// Generate alternates for German terms of use page
const alternates = generateSubpageHreflangMetadata("de", "legal/terms-of-use");

export const metadata: Metadata = {
  title: "Nutzungsbedingungen | BillSplitter",
  description:
    "Allgemeine Geschäftsbedingungen für die Nutzung des BillSplitter-Dienstes. Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unsere Plattform nutzen.",
  alternates,
};

export default function TermsOfUseLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
