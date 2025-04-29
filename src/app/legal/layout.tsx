"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isPrivacyPolicy = pathname === "/legal/privacy-policy";
  
  // Force dark theme only for privacy policy page
  useEffect(() => {
    if (isPrivacyPolicy) {
      setTheme("dark");
    }
  }, [setTheme, isPrivacyPolicy]);

  return (
    <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
      {children}
    </main>
  );
} 
