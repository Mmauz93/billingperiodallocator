import { Metadata } from "next";
import { generateSubpageHreflangMetadata } from "@/lib/seo-utils";

// Generate alternates for German privacy policy page
const alternates = generateSubpageHreflangMetadata(
  "de",
  "legal/privacy-policy",
);

export const metadata: Metadata = {
  title: "Datenschutzerklärung | BillSplitter",
  description:
    "Unsere Datenschutzerklärung erläutert, wie wir Ihre persönlichen Daten bei der Nutzung von BillSplitter erfassen, verwenden und schützen.",
  alternates,
};

export default function PrivacyPolicyLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
