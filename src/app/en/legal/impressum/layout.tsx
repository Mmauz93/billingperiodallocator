import { Metadata } from "next";
import { generateSubpageHreflangMetadata } from "@/lib/seo-utils";

// Generate alternates for English impressum page
const alternates = generateSubpageHreflangMetadata("en", "legal/impressum");

export const metadata: Metadata = {
  title: "Imprint | BillSplitter",
  description:
    "Legal information about the operator of BillSplitter, company details, and contact information.",
  alternates,
};

export default function ImpressumLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
