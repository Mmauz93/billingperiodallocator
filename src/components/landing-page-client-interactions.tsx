"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LandingPageClientInteractionsProps {
  buttonText: string;
  demoStartDate: string;
  demoEndDate: string;
  demoAmount: string;
  demoIncludeEndDate: string;
  demoSplitPeriod: "yearly" | "quarterly" | "monthly";
  appPath: string; // e.g., '/en/app' or '/de/app'
}

export default function LandingPageClientInteractions({
  buttonText,
  demoStartDate,
  demoEndDate,
  demoAmount,
  demoIncludeEndDate,
  demoSplitPeriod,
  appPath,
}: LandingPageClientInteractionsProps) {
  const router = useRouter();

  useEffect(() => {
    // Force scroll to top when component mounts
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleTestWithDemoData = () => {
    if (typeof window !== "undefined") {
      const demoDataForForm = {
        startDateString: demoStartDate,
        endDateString: demoEndDate,
        amount: demoAmount,
        includeEndDate: demoIncludeEndDate === "true",
        splitPeriod: demoSplitPeriod,
        isDemo: true,
      };
      sessionStorage.setItem(
        "billSplitterDemoData",
        JSON.stringify(demoDataForForm),
      );
      router.push(appPath);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleTestWithDemoData}
      className="inline-flex items-center gap-1 font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group !hover:transform !hover:translate-y-[-2px] !hover:scale-[1.015] bg-primary text-primary-foreground"
      aria-label={buttonText}
    >
      {buttonText}
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Button>
  );
}
