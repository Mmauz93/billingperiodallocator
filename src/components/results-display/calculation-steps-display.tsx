"use client";

import {
  formatDateForDisplay,
  formatNumForDisplay,
  formatPctForDisplay,
  formatPeriodIdForDisplay,
} from "./utils";

import { CalculationStepsDisplayProps } from "./types";
import React from "react";
import { useTranslation } from "@/translations";

export function CalculationStepsDisplay({
  steps,
  settings,
  splitPeriodUsed,
}: CalculationStepsDisplayProps) {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;

  if (steps.error) {
    // Convert the error to a string representation
    const errorMessage =
      typeof steps.error === "string"
        ? steps.error
        : steps.error.message || "Unknown error";

    return <p className="text-destructive">{errorMessage}</p>;
  }

  const { periodSegments, amountCalculations } = steps;

  const fmtNum = (num: number) =>
    formatNumForDisplay(num, currentLocale, settings);
  const fmtPeriod = (id: string) =>
    formatPeriodIdForDisplay(id, splitPeriodUsed, currentLocale);
  const fmtDate = (dateStr: string) =>
    formatDateForDisplay(dateStr, currentLocale);
  const fmtPct = (val: number) => formatPctForDisplay(val, currentLocale);

  return (
    <div className="text-sm space-y-6">
      {/* Total Duration and Period Breakdown Section */}
      <section className="bg-muted/40 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-foreground">
          {t("ResultsDisplay.totalDuration")}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs border-b pb-2 mb-2">
          <div>{t("ResultsDisplay.periodLabel")}</div>{" "}
          <div className="text-right">
            {fmtDate(steps.totalDuration.start)} -{" "}
            {fmtDate(steps.totalDuration.end)}
          </div>
          <div>{t("ResultsDisplay.totalDays")}</div>{" "}
          <div className="text-right">
            {steps.totalDuration.days} (
            {steps.totalDuration.included
              ? t("ResultsDisplay.inclusiveLabel")
              : t("ResultsDisplay.exclusiveLabel")}
            )
          </div>
        </div>
        <h4 className="font-semibold text-foreground">
          {t("ResultsDisplay.proportionCalculation")}
        </h4>
        <div className="space-y-1">
          {periodSegments.map((seg) => (
            <div
              key={seg.periodIdentifier}
              className="grid grid-cols-3 gap-2 text-xs"
            >
              <div className="font-medium">
                {fmtPeriod(seg.periodIdentifier)}:
              </div>
              <div className="text-muted-foreground text-center">
                {seg.days} / {steps.totalDuration.days}{" "}
                {t("ResultsDisplay.daysLabel")}
              </div>
              <div className="text-muted-foreground text-right">
                {fmtPct(seg.proportion)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Calculation per Input Amount Section */}
      <section className="bg-muted/40 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-4">
          {t("ResultsDisplay.splitCalculation")}
        </h4>
        <div className="space-y-6">
          {amountCalculations.map((amtCalc, index) => (
            <div
              key={index}
              className="rounded-md border bg-background p-4 space-y-2 transition-shadow hover:shadow-md"
            >
              <div className="font-bold text-[15px] text-primary mb-3 pb-1 border-b border-primary/20 bg-primary/[0.08] -mx-4 px-4 py-2 rounded-t-md">
                {t("ResultsDisplay.inputAmountLabel")} #{index + 1}:{" "}
                {fmtNum(amtCalc.originalAmount)}
              </div>
              <div className="space-y-3">
                {amtCalc.periodSplits.map((ps, periodIndex) => (
                  <div
                    key={ps.periodIdentifier}
                    className={`pl-2 text-xs space-y-0.5 ${periodIndex < amtCalc.periodSplits.length - 1 ? "border-b border-muted/30 pb-2" : ""}`}
                  >
                    <div className="font-medium shrink-0 text-foreground">
                      {fmtPeriod(ps.periodIdentifier)}:
                    </div>
                    <div className="text-muted-foreground ml-2">
                      <span>
                        {fmtNum(amtCalc.originalAmount)} *{" "}
                        {periodSegments
                          .find(
                            (s) => s.periodIdentifier === ps.periodIdentifier,
                          )
                          ?.proportion.toFixed(6)}
                      </span>
                      <span className="block sm:inline">
                        {" "}
                        = {ps.rawSplit.toFixed(6)}
                      </span>
                    </div>
                    <div className="ml-2 flex items-center gap-x-2">
                      <span>→</span>
                      <span className="font-medium text-foreground">
                        {t("ResultsDisplay.roundedLabel")}:{" "}
                        {fmtNum(ps.roundedSplit)}
                      </span>
                      {ps.adjustment !== 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({t("ResultsDisplay.adjustmentLabel")}:{" "}
                          {fmtNum(ps.adjustment)})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                <p>
                  <span className="font-medium text-foreground">
                    {t("ResultsDisplay.discrepancyLabel")}:
                  </span>
                  <span
                    className={`${Math.abs(amtCalc.discrepancy) > 0.001 ? "text-warning dark:text-warning" : "text-muted-foreground/70"}`}
                  >
                    {" "}
                    {fmtNum(amtCalc.discrepancy)}
                  </span>
                  {amtCalc.adjustmentAppliedToPeriod && (
                    <span className="text-muted-foreground">
                      (
                      {t("ResultsDisplay.adjustedInYearLabel", {
                        defaultValue: "Applied in Year",
                      })}{" "}
                      {fmtPeriod(amtCalc.adjustmentAppliedToPeriod)})
                    </span>
                  )}
                </p>
                <p className="font-semibold text-sm text-foreground pt-1">
                  {t("ResultsDisplay.finalSumLabel")}:{" "}
                  <span className="text-primary">
                    {fmtNum(amtCalc.finalSum)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
