import { useCallback, useEffect, useRef, useState } from "react";

import { DemoDataType } from "./form-schema";

export function useDemoDataHandler() {
  const [initialDemoData, setInitialDemoData] = useState<DemoDataType>(null);
  const demoDataProcessedRef = useRef(false);

  useEffect(() => {
    if (demoDataProcessedRef.current) {
      return;
    }

    if (typeof window !== "undefined") {
      const demoDataString = sessionStorage.getItem("billSplitterDemoData");
      console.log(
        "Reading sessionStorage billSplitterDemoData:",
        demoDataString,
      );

      if (demoDataString) {
        try {
          const parsedDemoData = JSON.parse(demoDataString);
          if (parsedDemoData && parsedDemoData.isDemo) {
            localStorage.removeItem("invoiceFormDataCache");
            console.log(
              "Cleared localStorage cache to ensure demo data is used",
            );

            console.log("Setting initialDemoData state:", parsedDemoData);
            setInitialDemoData(parsedDemoData);

            sessionStorage.removeItem("billSplitterDemoData");
            console.log("Removed billSplitterDemoData from sessionStorage");

            demoDataProcessedRef.current = true;
          } else {
            sessionStorage.removeItem("billSplitterDemoData");
          }
        } catch (error) {
          console.error("Error parsing demo data:", error);
          sessionStorage.removeItem("billSplitterDemoData");
        }
      }
    }
  }, []);

  const handleDemoDataApplied = useCallback(() => {
    console.log("Demo data processed by InvoiceForm, clearing state");
    setInitialDemoData(null);
  }, []);

  return {
    initialDemoData,
    handleDemoDataApplied,
  };
}
