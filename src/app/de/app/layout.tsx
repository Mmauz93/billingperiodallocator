import { Metadata } from "next";
import { generateSubpageHreflangMetadata } from "@/lib/seo-utils";

// Generate alternates for German app page
const alternates = generateSubpageHreflangMetadata("de", "app");

export const metadata: Metadata = {
  title: "Rechner | BillSplitter",
  description:
    "Nutzen Sie das BillSplitter-Tool zum Hochladen und Aufteilen von Rechnungen. Kostenlos für die private Nutzung.",
  alternates,
};

export default function AppLayoutDE({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
