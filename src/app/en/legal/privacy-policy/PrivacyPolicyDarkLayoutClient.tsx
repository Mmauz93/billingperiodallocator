"use client";

import { useEffect } from "react";

export default function PrivacyPolicyDarkLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.backgroundColor = "#121212";
    document.documentElement.style.backgroundColor = "#121212";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  return <>{children}</>;
} 
