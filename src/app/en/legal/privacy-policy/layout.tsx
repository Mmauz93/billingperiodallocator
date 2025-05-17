import { ForceDarkTheme } from "@/components/force-dark-theme";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { generateSubpageHreflangMetadata } from "@/lib/seo-utils";

// Generate alternates for English privacy policy page
const alternates = generateSubpageHreflangMetadata(
  "en",
  "legal/privacy-policy",
);

export const metadata: Metadata = {
  title: "Privacy Policy | BillSplitter",
  description:
    "Our privacy policy outlines how we collect, use, and protect your personal information when using BillSplitter.",
  alternates,
};

export default function PrivacyPolicyLayoutEN({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ForceDarkTheme>
      <ThemeProvider attribute="class" forcedTheme="dark">
        {children}
      </ThemeProvider>
    </ForceDarkTheme>
  );
}
