"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateForDisplay,
  formatNumForDisplay,
  formatPctForDisplay,
  formatPeriodIdForDisplay,
  getPeriodHeader,
} from "./utils";

import { Button } from "@/components/ui/button";
import { CalculationStepsDisplay } from "./calculation-steps-display";
import { ResultsDisplayProps } from "./types";
import { SettingsModal } from "@/components/settings-modal";
import { exportToExcel } from "./export-excel";
import { exportToPdf } from "./export-pdf";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "@/translations";

// Internal component function
function ResultsDisplayComponent({ results, inputData }: ResultsDisplayProps) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const currentLocale = i18n.language;

  // Ensure we use the splitPeriod from the inputData if available
  const splitPeriodUsed = inputData.splitPeriod || "yearly";

  // Calculate derived values with checks
  const totalDurationDays = results.calculationSteps?.totalDuration?.days ?? 0;
  const totalInputAmount = inputData.amounts.reduce(
    (sum, val) => sum + (isNaN(val) ? 0 : val),
    0,
  );
  const totalAggregatedAmount =
    results.aggregatedSplits?.reduce(
      (sum, s) => sum + (s.totalSplitAmount ?? 0),
      0,
    ) ?? 0;

  // Handler functions for export
  function handleExportExcel() {
    exportToExcel(
      results,
      inputData,
      settings,
      totalInputAmount,
      totalDurationDays,
      totalAggregatedAmount,
      splitPeriodUsed,
      currentLocale,
      t,
    ).catch((error) => {
      console.error("Failed to export Excel:", error);
      alert("Failed to export Excel. Please try again.");
    });
  }

  function handleExportPdf() {
    exportToPdf(
      results,
      inputData,
      settings,
      totalInputAmount,
      totalDurationDays,
      totalAggregatedAmount,
      splitPeriodUsed,
      currentLocale,
      t,
    ).catch((error) => {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    });
  }

  return (
    <div className="w-full animate-fadeIn">
      {/* Wrap everything except the modal in a single card */}
      <Card className="shadow-lg border border-border/50">
        <CardContent className="p-6 space-y-8">
          <Card className="shadow-md border border-border/40 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-primary">
                  {t("ResultsDisplay.summaryTitle")}
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer"
                  aria-label={t("ResultsDisplay.settingsLabel")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t("ResultsDisplay.periodLabel")}</span>
                  <span className="font-medium text-foreground">
                    {formatDateForDisplay(inputData.startDate, currentLocale)} -{" "}
                    {formatDateForDisplay(inputData.endDate, currentLocale)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {t("ResultsDisplay.totalDurationLabel", {
                      defaultValue: "Total Duration (days)",
                    })}
                  </span>
                  <span className="font-medium text-foreground">
                    {totalDurationDays} {t("ResultsDisplay.daysLabel")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {t("InvoiceForm.includeEndDateLabel", {
                      defaultValue: "Include Final Day in Service Period?",
                    })}
                  </span>
                  <span className="font-medium text-foreground">
                    {inputData.includeEndDate
                      ? t("ResultsDisplay.yesLabel", { defaultValue: "Yes" })
                      : t("ResultsDisplay.noLabel", { defaultValue: "No" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {t("InvoiceForm.splitPeriodLabel", {
                      defaultValue: "Split Period",
                    })}
                  </span>
                  <span className="font-medium text-foreground">
                    {splitPeriodUsed === "yearly" &&
                      t("InvoiceForm.periodYearly")}
                    {splitPeriodUsed === "quarterly" &&
                      t("InvoiceForm.periodQuarterly")}
                    {splitPeriodUsed === "monthly" &&
                      t("InvoiceForm.periodMonthly")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/30">
                  <span className="font-semibold text-foreground">
                    {t("ResultsDisplay.originalTotalLabel", {
                      defaultValue: "Total Input Amount:",
                    })}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatNumForDisplay(
                      totalInputAmount,
                      currentLocale,
                      settings,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-border/40 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 pb-4 border-b text-primary">
                {t("ResultsDisplay.aggregatedTitle", {
                  defaultValue: "Allocation per Period",
                })}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getPeriodHeader(splitPeriodUsed, t)}</TableHead>
                    <TableHead className="text-right">
                      {t("ResultsDisplay.daysHeader")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("ResultsDisplay.proportionHeader")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("ResultsDisplay.amountHeader")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.aggregatedSplits?.map((split, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">
                        {formatPeriodIdForDisplay(
                          split.periodIdentifier,
                          splitPeriodUsed,
                          currentLocale,
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {split.daysInPeriod}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPctForDisplay(split.proportion, currentLocale)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {formatNumForDisplay(
                          split.totalSplitAmount,
                          currentLocale,
                          settings,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>
                      {t("ResultsDisplay.totalLabel", {
                        defaultValue: "Total",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {totalDurationDays}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatPctForDisplay(1, currentLocale)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatNumForDisplay(
                        totalAggregatedAmount,
                        currentLocale,
                        settings,
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Calculation Details Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="item-1"
              className="border rounded-lg shadow-md bg-card"
            >
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-primary hover:bg-muted/40">
                {t("ResultsDisplay.calculationStepsTitle", {
                  defaultValue: "View Full Split Calculation",
                })}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 bg-background border-t">
                {results.calculationSteps ? (
                  <CalculationStepsDisplay
                    steps={results.calculationSteps}
                    settings={settings}
                    splitPeriodUsed={splitPeriodUsed}
                  />
                ) : (
                  <p>{t("ResultsDisplay.noStepsAvailable")}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Export Buttons Section */}
          <div className="mt-8 w-full flex flex-col items-center sm:flex-row sm:justify-center gap-4 px-4 sm:px-0">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="w-full sm:w-auto"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t("ResultsDisplay.exportExcelButton")}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPdf}
              className="w-full sm:w-auto"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t("ResultsDisplay.exportPdfButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Modal remains outside the main card */}
      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

// Wrapper component to export
export function ResultsDisplay(props: ResultsDisplayProps) {
  return <ResultsDisplayComponent {...props} />;
}
