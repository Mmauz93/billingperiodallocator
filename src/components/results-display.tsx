"use client";

import * as XLSX from 'xlsx';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    CalculationInput,
    CalculationResult,
    CalculationStepDetails
} from "@/lib/calculations";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { AppSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { useSettings } from "@/context/settings-context";
import { useTranslation } from 'react-i18next';

// Define a local interface extending jsPDF to include the property added by jspdf-autotable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY?: number };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Interface inherits members via Pick
interface InputDataForDisplay extends Pick<
    CalculationInput,
    'startDate' | 'endDate' | 'includeEndDate' | 'amounts'
> {}

interface ResultsDisplayProps {
    results: CalculationResult;
    inputData: InputDataForDisplay;
}

// --- Formatting Helpers ---

// Rounds a value to the nearest precision (e.g., 0.01, 0.05, 1)
function roundValue(value: number, precision: number): number {
  if (!precision || precision <= 0) return value; // No rounding if precision is invalid
  return Math.round(value / precision) * precision;
}

// Formats a number according to locale and decimal places settings
function formatNumber(value: number | undefined | null, locale: string, settings: Omit<AppSettings, 'locale'>): string {
  if (value === undefined || value === null || isNaN(value)) return "";
  
  let formattedString = new Intl.NumberFormat(locale, {
    minimumFractionDigits: settings.decimalPlaces,
    maximumFractionDigits: settings.decimalPlaces,
    useGrouping: true,
  }).format(value);

  // Apply custom thousands separator if selected
  if (settings.thousandsSeparator === 'apostrophe') {
    const simpleLocale = locale.startsWith('de') ? 'de' : 'en';
    if (simpleLocale === 'de') {
        const parts = formattedString.split(',');
        parts[0] = parts[0].replace(/\./g, "'");
        formattedString = parts.join(',');
    } else {
        formattedString = formattedString.replace(/,/g, "'");
    }
  }

  return formattedString;
}

// Formats a percentage according to locale and decimal places settings
function formatPercent(value: number | undefined | null, locale: string): string {
    if (value === undefined || value === null || isNaN(value)) return "";
    const percentageValue = value * 100;
     return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(percentageValue) + '%';
}

// Formats a date string (yyyy-MM-dd) according to locale
function formatDateLocale(dateString: string | undefined | null, locale: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + 'T00:00:00Z'); // Treat as UTC date
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string on error
  }
}

// --- End Formatting Helpers ---

// --- Calculation Steps Renderer Component --- 
const CalculationStepsDisplay = ({ steps, settings }: { steps: CalculationStepDetails, settings: Omit<AppSettings, 'locale'> }) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language;

    if (steps.error) {
        return <p className="text-destructive">{steps.error}</p>;
    }

    const { totalDuration, yearSegments, amountCalculations } = steps;

    const fmtDate = (dateStr: string) => formatDateLocale(dateStr, currentLocale);
    const fmtNum = (num: number) => formatNumber(num, currentLocale, settings);

    return (
        <div className="text-sm space-y-6">
            {/* 1. Duration - Using grid for alignment */}
            <div className="space-y-1">
                <h4 className="font-semibold mb-2">1. {t('ResultsDisplay.totalDuration')}</h4>
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{t('ResultsDisplay.periodLabel')}</span>
                    <span>{fmtDate(totalDuration.start)} to {fmtDate(totalDuration.end)} ({totalDuration.included ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')})</span>
                    <span className="font-medium text-foreground">{t('ResultsDisplay.totalDays')}:</span>
                    <span>{totalDuration.days}</span>
                </div>
            </div>

             {/* 2. Proportion per Year */}
            <div className="space-y-1">
                <h4 className="font-semibold mb-2">2. {t('ResultsDisplay.proportionCalculation')}</h4>
                {yearSegments.map((seg) => (
                    <p key={seg.year} className="text-muted-foreground">
                         <span className="font-medium text-foreground">{seg.year}:</span> {seg.days} {t('ResultsDisplay.daysLabel')} / {totalDuration.days} {t('ResultsDisplay.totalDays')} = <span className="font-medium text-foreground">{seg.proportion.toFixed(6)}</span> ({t('ResultsDisplay.proportionLabel')})
                    </p>
                ))}
             </div>

             {/* 3. Split per Amount - Added structure and styling */}
             <div className="space-y-4">
                <h4 className="font-semibold mb-2">3. {t('ResultsDisplay.splitCalculation')}</h4>
                {amountCalculations.map((amtCalc, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-2 bg-muted/30">
                        <p className="font-medium">{t('ResultsDisplay.inputAmountLabel')} #{index + 1}: {fmtNum(amtCalc.originalAmount)}</p>
                        <div className="space-y-1">
                            {amtCalc.yearSplits.map((ys) => (
                                <div key={ys.year} className="pl-2 text-xs flex flex-wrap gap-x-2">
                                    <span className="font-medium shrink-0">{ys.year}:</span>
                                    {/* Muted calculation part */}
                                    <span className="text-muted-foreground">
                                        {fmtNum(amtCalc.originalAmount)} * {yearSegments.find((s) => s.year === ys.year)?.proportion.toFixed(6)} =
                                        {t('ResultsDisplay.rawLabel')}: {ys.rawSplit.toFixed(6)}
                                    </span>
                                    <span>→</span>
                                    <span className="font-medium"> 
                                        {t('ResultsDisplay.roundedLabel')}: {fmtNum(ys.roundedSplit)}
                                    </span>
                                     {/* Adjustment part */}
                                    {ys.adjustment !== 0 && 
                                        <span className="text-muted-foreground">
                                            ({t('ResultsDisplay.adjustmentLabel')}: {fmtNum(ys.adjustment)})
                                        </span>
                                    }
                                </div>
                            ))}
                         </div>
                         {/* Discrepancy and Final Sum */}
                        <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                             <p>
                                <span className="font-medium">{t('ResultsDisplay.discrepancyLabel')}:</span> 
                                <span className={Math.abs(amtCalc.discrepancy) > 0.001 ? "text-amber-600 dark:text-amber-500" : ""}> {fmtNum(amtCalc.discrepancy)}</span>
                                {amtCalc.adjustmentAppliedToYear && 
                                    <span className="text-muted-foreground">
                                        ({t('ResultsDisplay.adjustedInYearLabel')} {amtCalc.adjustmentAppliedToYear})
                                    </span>
                                }
                            </p>
                            <p className="font-medium">{t('ResultsDisplay.finalSumLabel')}: {fmtNum(amtCalc.finalSum)}</p>
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};
// --- End Calculation Steps Renderer --- 


export function ResultsDisplay({ results, inputData }: ResultsDisplayProps) {
    const { settings } = useSettings();
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language;
    const {
        totalDays,
        originalTotalAmount,
        adjustedTotalAmount,
        resultsPerAmount,
        aggregatedSplits,
        calculationSteps
    } = results;

    // Use the correctly defined helper functions
    const formatNum = (value: number) => formatNumber(roundValue(value, settings.roundingPrecision), currentLocale, settings);
    const formatPct = (value: number) => formatPercent(value, currentLocale);
    const formatDateStr = (date: Date) => format(date, 'yyyy-MM-dd'); // Internal format
    const formatDateForDisplay = (date: Date) => formatDateLocale(format(date, 'yyyy-MM-dd'), currentLocale);

    // Calculate if there is a notable discrepancy due to rounding
    const discrepancyThreshold = settings.roundingPrecision / 2 + 0.00001; // Add small epsilon
    const discrepancyExists = Math.abs(originalTotalAmount - adjustedTotalAmount) > discrepancyThreshold;

    // --- Aggregated Table --- 
    const aggregatedHeaders = [t('ResultsDisplay.yearHeader'), t('ResultsDisplay.daysHeader'), t('ResultsDisplay.proportionHeader'), t('ResultsDisplay.totalSplitAmountHeader')];
    const aggregatedTableData = aggregatedSplits.map(split => [
        split.year,
        split.daysInYear,
        formatPct(split.proportion),
        formatNum(split.totalSplitAmount)
    ]);
    const aggregatedTotalsRow = [
        t('ResultsDisplay.totalHeader'),
        totalDays,
        formatPct(1),
        formatNum(adjustedTotalAmount)
    ];
    // --- End Aggregated Table --- 

     // --- Detailed Breakdown Table --- 
     const detailedYears = aggregatedSplits.map(s => s.year);
     const detailedHeaders = [t('ResultsDisplay.yearHeader')];
     inputData.amounts.forEach((_, index) => {
         detailedHeaders.push(t('ResultsDisplay.amountSplitHeader', { index: index + 1 }));
     });
     detailedHeaders.push(t('ResultsDisplay.yearTotalHeader'));

     const detailedTableData = detailedYears.map(year => {
         const row: (string | number)[] = [year];
         let yearTotal = 0;
         resultsPerAmount.forEach(amtResult => {
             const splitAmount = amtResult.splits[year]?.splitAmount || 0;
             row.push(formatNum(splitAmount));
             yearTotal += splitAmount;
         });
         row.push(formatNum(yearTotal));
         return row;
     });

     const detailedTotalsRow: (string | number)[] = [t('ResultsDisplay.totalHeader')];
     resultsPerAmount.forEach(amtResult => {
         detailedTotalsRow.push(formatNum(amtResult.adjustedTotalAmount));
     });
     detailedTotalsRow.push(formatNum(adjustedTotalAmount));
    // --- End Detailed Breakdown Table --- 


    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const inputAmountsStr = inputData.amounts.map(a => formatNum(a)).join(", ");
         const inputWsData = [
             [t('ResultsDisplay.inputSummary', {defaultValue: 'Input Summary'})],
             [],
             [t('InvoiceForm.startDateLabel'), formatDateForDisplay(inputData.startDate)],
             [t('InvoiceForm.endDateLabel'), formatDateForDisplay(inputData.endDate)],
             [t('InvoiceForm.includeEndDateLabel'), inputData.includeEndDate ? t('ResultsDisplay.yesLabel', {defaultValue: 'Yes'}) : t('ResultsDisplay.noLabel', {defaultValue: 'No'})],
             [t('ResultsDisplay.totalDurationLabel', {defaultValue: 'Total Duration (days)'}), totalDays],
             [t('InvoiceForm.amountsLabel'), inputAmountsStr],
             [t('ResultsDisplay.originalTotalAmountLabel', {defaultValue: 'Original Total Amount'}), formatNum(originalTotalAmount)],
         ];
        const inputWs = XLSX.utils.aoa_to_sheet(inputWsData);
        inputWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, inputWs, t('ResultsDisplay.inputSummarySheetName', {defaultValue: "Input Summary"}));

        const aggWsData = [
            [t('ResultsDisplay.aggregatedTitle')],
            [],
            aggregatedHeaders,
            ...aggregatedTableData,
            [],
            aggregatedTotalsRow
        ];
        const aggWs = XLSX.utils.aoa_to_sheet(aggWsData);
        aggWs['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, aggWs, t('ResultsDisplay.aggregatedSheetName', {defaultValue: "Aggregated Results"}));

        const detailWsData = [
            [t('ResultsDisplay.detailedTitle')],
            [],
            detailedHeaders,
            ...detailedTableData,
            [],
            detailedTotalsRow
        ];
        const detailWs = XLSX.utils.aoa_to_sheet(detailWsData);
        const detailColWidths = [{ wch: 10 }, ...inputData.amounts.map(() => ({ wch: 15 })), { wch: 15 }];
        detailWs['!cols'] = detailColWidths;
        XLSX.utils.book_append_sheet(wb, detailWs, t('ResultsDisplay.detailedSheetName', {defaultValue: "Detailed Breakdown"}));

        XLSX.writeFile(wb, `invoice_split_${formatDateStr(new Date())}.xlsx`);
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        const title = t('ResultsDisplay.pdfTitle', {defaultValue: "Invoice Split Calculation"});
        const inputInfoLine1 = `${t('ResultsDisplay.periodLabel')} ${formatDateForDisplay(inputData.startDate)} to ${formatDateForDisplay(inputData.endDate)} (${inputData.includeEndDate ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')}, ${totalDays} ${t('ResultsDisplay.daysLabel')})`;
        const inputInfoLine2 = `${t('ResultsDisplay.originalTotalLabel')} ${formatNum(originalTotalAmount)}`;

        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(10);
        doc.text(inputInfoLine1, 14, 26);
        doc.text(inputInfoLine2, 14, 30);

        doc.setFontSize(12);
        doc.text(t('ResultsDisplay.aggregatedTitle'), 14, 40);
        autoTable(doc, {
            startY: 42,
            head: [aggregatedHeaders],
            body: aggregatedTableData,
            foot: [aggregatedTotalsRow],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 1.5 },
            columnStyles: { 3: { halign: 'right' } },
        });

        const lastTable = doc as jsPDFWithAutoTable;
        const startYDetailed = (lastTable.lastAutoTable?.finalY ?? 40) + 10;
        doc.setFontSize(12);
        doc.text(t('ResultsDisplay.detailedTitle'), 14, startYDetailed);
        autoTable(doc, {
            startY: startYDetailed + 2,
            head: [detailedHeaders],
            body: detailedTableData,
            foot: [detailedTotalsRow],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 1.5 },
            columnStyles: {
                 ...detailedHeaders.reduce((styles: Record<number, { halign: 'right' }>, _, index) => {
                     if (index > 0) styles[index] = { halign: 'right' };
                     return styles;
                 }, {})
            }
        });

        doc.save(`invoice_split_${formatDateStr(new Date())}.pdf`);
    };

    return (
        <Card className="mt-8 w-full max-w-4xl">
            <CardHeader>
                <CardTitle>{t('ResultsDisplay.resultsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Improved Summary Section */}
                 <div className="text-sm space-y-1"> {/* Wrap in a div for spacing */}
                     <p> {/* Line 1: Period Info */}
                         {t('ResultsDisplay.periodLabel')} {formatDateForDisplay(inputData.startDate)} bis {formatDateForDisplay(inputData.endDate)}
                         <span className="ml-1 text-muted-foreground">
                             ({inputData.includeEndDate ? t('ResultsDisplay.inclusiveLabel') : t('ResultsDisplay.exclusiveLabel')}, {totalDays} {t('ResultsDisplay.daysLabel')})
                         </span>
                     </p>
                     <p> {/* Line 2: Total Info */}
                         {t('ResultsDisplay.originalTotalLabel')} {formatNum(originalTotalAmount)}
                         <span className="ml-1 text-muted-foreground">
                             ({inputData.amounts.length} {inputData.amounts.length === 1 ? t('ResultsDisplay.amountLabel') : t('ResultsDisplay.amountsLabel')} {t('ResultsDisplay.enteredLabel')})
                         </span>
                     </p>
                 </div>

                 {/* Aggregated Results Table */}
                 <div>
                    <h3 className="text-lg font-semibold mb-2">{t('ResultsDisplay.aggregatedTitle')}</h3>
                     <Table>
                         <TableHeader>
                             <TableRow>{aggregatedHeaders.map(h => <TableHead key={h} className={h !== t('ResultsDisplay.yearHeader') ? 'text-right' : ''}>{h}</TableHead>)}</TableRow>
                         </TableHeader>
                         <TableBody>
                             {aggregatedSplits.map((split) => (
                                 <TableRow key={split.year}>
                                     <TableCell className="font-medium">{split.year}</TableCell>
                                     <TableCell className="text-right">{split.daysInYear}</TableCell>
                                     <TableCell className="text-right">{formatPct(split.proportion)}</TableCell>
                                     <TableCell className="text-right">{formatNum(split.totalSplitAmount)}</TableCell>
                                 </TableRow>
                             ))}
                         </TableBody>
                         <TableFooter>
                              <TableRow className={discrepancyExists ? "bg-warning/10" : ""}>
                                  <TableCell colSpan={2} className="font-bold">{t('ResultsDisplay.totalHeader')}</TableCell>
                                  <TableCell className="text-right font-bold">{formatPct(1)}</TableCell>
                                  <TableCell className="text-right font-bold">{formatNum(adjustedTotalAmount)}</TableCell>
                              </TableRow>
                         </TableFooter>
                     </Table>
                      {discrepancyExists && (
                          <p className="text-xs text-muted-foreground mt-2 text-amber-700 dark:text-amber-500">
                              {t('ResultsDisplay.roundingNote')}
                          </p>
                      )}
                 </div>

                 {/* Detailed Breakdown Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">{t('ResultsDisplay.detailedTitle')}</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {detailedHeaders.map((header, index) => (
                                    <TableHead key={`${header}-${index}`} className={index > 0 ? 'text-right' : ''}>{header}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                             {detailedTableData.map((row, rowIndex) => (
                                 <TableRow key={rowIndex}>
                                     {row.map((cell, cellIndex) => (
                                         <TableCell key={cellIndex} className={cellIndex > 0 ? 'text-right' : 'font-medium'}>{cell}</TableCell>
                                     ))}
                                 </TableRow>
                             ))}
                         </TableBody>
                         <TableFooter>
                            <TableRow className={discrepancyExists ? "bg-warning/10" : ""}>
                                <TableCell className="font-bold">{t('ResultsDisplay.totalHeader')}</TableCell>
                                {resultsPerAmount.map((amtResult, index) => (
                                     <TableCell key={index} className="text-right font-bold">{formatNum(amtResult.adjustedTotalAmount)}</TableCell>
                                ))}
                                <TableCell className="text-right font-bold">{formatNum(adjustedTotalAmount)}</TableCell>
                            </TableRow>
                         </TableFooter>
                    </Table>
                 </div>

                <Accordion type="single" collapsible className="w-full mt-6">
                     <AccordionItem value="item-1">
                        <AccordionTrigger>{t('ResultsDisplay.calculationStepsTitle')}</AccordionTrigger>
                        <AccordionContent>
                            <CalculationStepsDisplay steps={calculationSteps} settings={settings} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <Download className="mr-2 h-4 w-4" /> {t('ResultsDisplay.exportExcelButton')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPdf}>
                     <Download className="mr-2 h-4 w-4" /> {t('ResultsDisplay.exportPdfButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}
