"use client";

import { AccessibleTable, AccessibleTableRow } from "@/components/ui/accessible-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import {
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

import { AccessibleIcon } from "@/components/ui/accessible-icon";
import { Announcement } from "@/components/ui/announcer";
import { Button } from "@/components/ui/button";
import { CalculationStepsDisplay } from "./calculation-steps-display";
import { ResultsDisplayProps } from "./types";
import { SettingsModal } from "@/components/settings-modal";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { exportToExcel } from "./export-excel";
import { exportToPdf } from "./export-pdf";
import { useAnnouncer } from "@/components/ui/announcer";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "@/translations";

// Internal component function
function ResultsDisplayComponent({ results, inputData }: ResultsDisplayProps) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const currentLocale = i18n.language;
  const { announce } = useAnnouncer();
  const [showResults, setShowResults] = useState(false);

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

  // Announce results to screen readers when loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      announce(
        t("ResultsDisplay.loadedAnnouncement", {
          defaultValue: "Results have been calculated and are now displayed",
        }),
        "polite"
      );
      setShowResults(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [announce, t]);

  // Handler functions for export
  function handleExportExcel() {
    announce(t("ResultsDisplay.exportingExcel", {
      defaultValue: "Exporting results to Excel. Please wait.",
    }), "polite");
    
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
    ).then(() => {
      announce(t("ResultsDisplay.exportCompleted", {
        defaultValue: "Export to Excel completed successfully.",
      }), "polite");
    }).catch((error) => {
      console.error("Failed to export Excel:", error);
      announce(t("ResultsDisplay.exportFailed", {
        defaultValue: "Failed to export Excel. Please try again.",
      }), "assertive");
      alert("Failed to export Excel. Please try again.");
    });
  }

  function handleExportPdf() {
    announce(t("ResultsDisplay.exportingPdf", {
      defaultValue: "Exporting results to PDF. Please wait.",
    }), "polite");
    
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
    ).then(() => {
      announce(t("ResultsDisplay.exportCompleted", {
        defaultValue: "Export to PDF completed successfully.",
      }), "polite");
    }).catch((error) => {
      console.error("Failed to generate PDF:", error);
      announce(t("ResultsDisplay.exportFailed", {
        defaultValue: "Failed to export PDF. Please try again.",
      }), "assertive");
      alert("Failed to generate PDF. Please try again.");
    });
  }

  return (
    <div 
      className="w-full animate-fadeIn"
      aria-live="polite"
      aria-atomic="true"
    >
      {!showResults && (
        <VisuallyHidden>
          {t("ResultsDisplay.calculatingAnnouncement", {
            defaultValue: "Calculating results, please wait",
          })}
        </VisuallyHidden>
      )}
      
      {/* Announcements for screen readers */}
      <Announcement 
        message={showResults ? t("ResultsDisplay.resultsSummary", {
          defaultValue: `Results calculated for period ${formatDateForDisplay(inputData.startDate, currentLocale)} to ${formatDateForDisplay(inputData.endDate, currentLocale)}. Total amount: ${formatNumForDisplay(totalInputAmount, currentLocale, settings)}`,
        }) : ""}
        type="polite" 
      />
      
      {/* Wrap everything except the modal in a single card */}
      <Card className="shadow-lg border border-border/50">
        <CardContent className="p-6 space-y-8">
          <Card className="shadow-md border border-border/40 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 
                  className="text-xl font-semibold text-primary"
                  id="summary-heading"
                >
                  {t("ResultsDisplay.summaryTitle")}
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer"
                  aria-label={t("ResultsDisplay.settingsLabel")}
                >
                  <AccessibleIcon label={t("ResultsDisplay.settingsLabel")}>
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
                  </AccessibleIcon>
                </button>
              </div>
              <div 
                className="space-y-2 text-sm text-muted-foreground"
                aria-labelledby="summary-heading"
              >
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
              <h3 
                className="text-xl font-semibold mb-6 pb-4 border-b text-primary"
                id="allocation-heading"
              >
                {t("ResultsDisplay.aggregatedTitle", {
                  defaultValue: "Allocation per Period",
                })}
              </h3>
              
              <AccessibleTable
                className="w-full"
                caption={t("ResultsDisplay.tableCaption", {
                  defaultValue: "Allocation of amounts across periods",
                })}
                summary={t("ResultsDisplay.tableSummary", {
                  defaultValue: `This table shows how the total amount of ${formatNumForDisplay(
                    totalInputAmount,
                    currentLocale,
                    settings,
                  )} is allocated across ${
                    results.aggregatedSplits?.length || 0
                  } periods based on the number of days in each period.`,
                })}
                selectable={true}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{getPeriodHeader(splitPeriodUsed, t)}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("ResultsDisplay.daysHeader")}
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("ResultsDisplay.proportionHeader")}
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("ResultsDisplay.amountHeader")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.aggregatedSplits?.map((split, index) => (
                    <AccessibleTableRow key={index}>
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
                    </AccessibleTableRow>
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
              </AccessibleTable>
            </CardContent>
          </Card>

          {results.detailedSplits && results.detailedSplits.length > 0 && (
            <Card className="shadow-md border border-border/40 overflow-hidden">
              <CardContent className="p-6">
                <h3 
                  className="text-xl font-semibold mb-6 pb-4 border-b text-primary"
                  id="details-heading"
                >
                  {t("ResultsDisplay.detailedTitle", {
                    defaultValue: "Detailed Breakdown",
                  })}
                </h3>
                <AccessibleTable
                  className="w-full"
                  caption={t("ResultsDisplay.detailedTableCaption", {
                    defaultValue: "Detailed breakdown of allocation by invoice line",
                  })}
                  summary={t("ResultsDisplay.detailedTableSummary", {
                    defaultValue: "This table shows the detailed breakdown of how each invoice line is allocated across periods.",
                  })}
                  selectable={true}
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t("ResultsDisplay.lineItemHeader")}</TableHead>
                      <TableHead scope="col">{getPeriodHeader(splitPeriodUsed, t)}</TableHead>
                      <TableHead scope="col" className="text-right">
                        {t("ResultsDisplay.daysHeader")}
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        {t("ResultsDisplay.proportionHeader")}
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        {t("ResultsDisplay.amountHeader")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.detailedSplits.map((detailedSplit: { splits: Array<{ periodIdentifier: string; daysInPeriod: number; proportion: number; splitAmount: number }> }, lineIndex: number) =>
                      detailedSplit.splits.map((split: { periodIdentifier: string; daysInPeriod: number; proportion: number; splitAmount: number }, splitIndex: number) => (
                        <AccessibleTableRow key={`${lineIndex}-${splitIndex}`}>
                          {splitIndex === 0 ? (
                            <TableCell
                              rowSpan={detailedSplit.splits.length}
                              className="font-medium text-foreground align-top"
                            >
                              {inputData.descriptions?.[lineIndex] ||
                                `${t("ResultsDisplay.itemLabel")} ${lineIndex + 1}`}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatNumForDisplay(
                                  inputData.amounts[lineIndex],
                                  currentLocale,
                                  settings,
                                )}
                              </div>
                            </TableCell>
                          ) : null}
                          <TableCell className="whitespace-nowrap">
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
                              split.splitAmount,
                              currentLocale,
                              settings,
                            )}
                          </TableCell>
                        </AccessibleTableRow>
                      ))
                    )}
                  </TableBody>
                </AccessibleTable>
              </CardContent>
            </Card>
          )}

          {/* Calculation Steps */}
          {results.calculationSteps && (
            <Card className="shadow-md border border-border/40 overflow-hidden">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger className="text-xl font-semibold text-primary py-2">
                      {t("ResultsDisplay.calculationStepsTitle", {
                        defaultValue: "Calculation Steps",
                      })}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <CalculationStepsDisplay
                        steps={results.calculationSteps}
                        settings={settings}
                        splitPeriodUsed={splitPeriodUsed}
                        locale={currentLocale}
                        t={t}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="min-w-[120px]"
              aria-label={t("ResultsDisplay.exportExcelLabel", {
                defaultValue: "Export to Excel spreadsheet",
              })}
            >
              {t("ResultsDisplay.exportExcelButton", {
                defaultValue: "Export to Excel",
              })}
            </Button>
            <Button
              onClick={handleExportPdf}
              variant="outline"
              className="min-w-[120px]"
              aria-label={t("ResultsDisplay.exportPdfLabel", {
                defaultValue: "Export to PDF document",
              })}
            >
              {t("ResultsDisplay.exportPdfButton", {
                defaultValue: "Export to PDF",
              })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}

// This is the exported component, it's doing some processing before rendering
export function ResultsDisplay(props: ResultsDisplayProps) {
  // Your component here...
  return <ResultsDisplayComponent {...props} />;
}
