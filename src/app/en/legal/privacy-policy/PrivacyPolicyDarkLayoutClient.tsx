"use client";
import { useEffect } from "react";

export default function PrivacyPolicyDarkLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.backgroundColor = "#09090B";
    document.documentElement.style.backgroundColor = "#09090B";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  return <>{children}</>;
} 
