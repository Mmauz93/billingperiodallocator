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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileSpreadsheet, FileText } from "lucide-react";
import React, { useEffect, useState } from 'react';
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
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { useSettings } from "@/context/settings-context";
import { useTranslation } from 'react-i18next';

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

  // Apply custom thousands separator if needed
  const defaultSeparator = locale.startsWith('de') ? '.' : ',';
  
  if (settings.thousandsSeparator && settings.thousandsSeparator !== defaultSeparator) {
    // Replace the default separator with the custom one
    formattedString = formattedString.replace(
      new RegExp(`\\${defaultSeparator}`, 'g'), 
      settings.thousandsSeparator
    );
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

    const { yearSegments, amountCalculations } = steps;

    const fmtNum = (num: number) => formatNumber(num, currentLocale, settings);

    return (
        <div className="text-sm space-y-6">
            {/* Split Calculation per Input Amount Section */}
            <section className="bg-muted/40 rounded-lg p-4">
                <div className="space-y-6">
                    {amountCalculations.map((amtCalc, index) => (
                        <div key={index} className="rounded-md border bg-background p-4 space-y-2 transition-shadow hover:shadow-md">
                            <div className="font-bold text-[15px] text-primary mb-3 pb-1 border-b border-primary/20 bg-primary/[0.08] -mx-4 px-4 py-2 rounded-t-md">{t('ResultsDisplay.inputAmountLabel')} #{index + 1}: {fmtNum(amtCalc.originalAmount)}</div>
                            <div className="space-y-3">
                                {amtCalc.yearSplits.map((ys, yearIndex) => (
                                    <div key={ys.year} className={`pl-2 text-xs space-y-0.5 ${yearIndex < amtCalc.yearSplits.length - 1 ? "border-b border-muted/30 pb-2" : ""}`}>
                                        <div className="font-medium shrink-0 text-foreground">{ys.year}:</div>
                                        <div className="text-muted-foreground ml-2">
                                            <span>{fmtNum(amtCalc.originalAmount)} * {yearSegments.find((s) => s.year === ys.year)?.proportion.toFixed(6)}</span>
                                            <span className="block sm:inline"> = {ys.rawSplit.toFixed(6)}</span>
                                        </div>
                                        <div className="ml-2 flex items-center gap-x-2">
                                            <span>→</span>
                                            <span className="font-medium text-foreground">
                                                {t('ResultsDisplay.roundedLabel')}: {fmtNum(ys.roundedSplit)}
                                            </span>
                                            {ys.adjustment !== 0 &&
                                                <span className="text-muted-foreground text-xs">
                                                    ({t('ResultsDisplay.adjustmentLabel')}: {fmtNum(ys.adjustment)})
                                                </span>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                                <p>
                                    <span className="font-medium text-foreground">{t('ResultsDisplay.discrepancyLabel')}:</span>
                                    <span className={`${Math.abs(amtCalc.discrepancy) > 0.001 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground/70"}`}> {fmtNum(amtCalc.discrepancy)}</span>
                                    {amtCalc.adjustmentAppliedToYear &&
                                        <span className="text-muted-foreground">
                                            ({t('ResultsDisplay.adjustedInYearLabel')} {amtCalc.adjustmentAppliedToYear})
                                        </span>
                                    }
                                </p>
                                <p className="font-semibold text-sm text-foreground pt-1">{t('ResultsDisplay.finalSumLabel')}: <span className="text-primary">{fmtNum(amtCalc.finalSum)}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
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
    
    // State to force re-render when settings change
    const [, setForceUpdate] = useState(0);

    // Listen for settings changes and trigger re-render
    useEffect(() => {
        const handleSettingsChange = () => {
            // Force re-render by updating state
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('settingsChanged', handleSettingsChange);
        
        return () => {
            window.removeEventListener('settingsChanged', handleSettingsChange);
        };
    }, []);

    // Use the correctly defined helper functions
    const formatNum = (value: number) => formatNumber(roundValue(value, settings.roundingPrecision), currentLocale, settings);
    const formatPct = (value: number) => formatPercent(value, currentLocale);
    const formatDateStr = (date: Date) => format(date, 'yyyy-MM-dd'); // Internal format
    const formatDateForDisplay = (date: Date) => formatDateLocale(format(date, 'yyyy-MM-dd'), currentLocale);

    // Calculate if there is a notable discrepancy due to rounding
    const discrepancyThreshold = settings.roundingPrecision / 2 + 0.00001; // Add small epsilon
    const discrepancyExists = Math.abs(originalTotalAmount - adjustedTotalAmount) > discrepancyThreshold;

    // Add success message component at the top
    const SuccessMessage = () => (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-3 mb-6 flex items-center text-green-700 dark:text-green-400 animate-fadeIn">
            <span className="mr-2 text-lg">✅</span>
            <span>{t('ResultsDisplay.successMessage', { defaultValue: 'Split completed successfully! Your detailed allocation is ready.' })}</span>
        </div>
    );

    // --- Merged Table Headers --- 
    const mergedHeaders = [
        t('ResultsDisplay.yearHeader'),
        t('ResultsDisplay.daysHeader'),
        t('ResultsDisplay.proportionHeader')
    ];
    
    // Add Amount columns for each input amount
    inputData.amounts.forEach((_, index) => {
        mergedHeaders.push(`${t('ResultsDisplay.amountHeader')} #${index + 1}`);
    });
    
    // Add Year Total column
    mergedHeaders.push(t('ResultsDisplay.yearTotalHeader'));
    
    // --- Merged Table Data ---
    const mergedTableData = aggregatedSplits.map(split => {
        const row: (string | number)[] = [
            split.year,
            split.daysInYear,
            formatPct(split.proportion)
        ];
        
        // Add amount columns
        resultsPerAmount.forEach(amtResult => {
            const splitAmount = amtResult.splits[split.year]?.splitAmount || 0;
            row.push(formatNum(splitAmount));
        });
        
        // Add Year Total column
        row.push(formatNum(split.totalSplitAmount));
        
        return row;
    });
    
    // --- Merged Table Totals Row ---
    const mergedTotalsRow: (string | number)[] = [
        t('ResultsDisplay.totalHeader'),
        totalDays,
        formatPct(1)
    ];
    
    // Add amount totals
    resultsPerAmount.forEach(amtResult => {
        mergedTotalsRow.push(formatNum(amtResult.adjustedTotalAmount));
    });
    
    // Add grand total
    mergedTotalsRow.push(formatNum(adjustedTotalAmount));

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

        const mergedWsData = [
            [t('ResultsDisplay.aggregatedTitle')],
            [],
            mergedHeaders,
            ...mergedTableData,
            [],
            mergedTotalsRow
        ];
        const mergedWs = XLSX.utils.aoa_to_sheet(mergedWsData);
        const colWidths = [
            { wch: 10 }, // Year
            { wch: 10 }, // Days
            { wch: 15 }, // Proportion
            ...inputData.amounts.map(() => ({ wch: 15 })), // Amount columns
            { wch: 15 } // Year Total
        ];
        mergedWs['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, mergedWs, t('ResultsDisplay.aggregatedSheetName', {defaultValue: "Allocation Results"}));

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
            head: [mergedHeaders],
            body: mergedTableData,
            foot: [mergedTotalsRow],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 1.5 },
            columnStyles: { 
                2: { halign: 'right' },
                ...mergedHeaders.reduce((styles: Record<number, { halign: 'right' }>, _, index) => {
                    if (index > 2) styles[index] = { halign: 'right' };
                    return styles;
                }, {})
            },
        });

        doc.save(`invoice_split_${formatDateStr(new Date())}.pdf`);
    };

    return (
        <Card className="w-full">
            {/* No CardHeader: start directly with content for a cleaner look */}
            <CardContent className="space-y-6 pt-6 px-6">
                {/* Success Message */}
                <SuccessMessage />
                
                {/* New Summary Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">{t('ResultsDisplay.summaryTitle', {defaultValue: 'Summary'})}</h3>
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('ResultsDisplay.periodLabel')}</span>
                            <span className="font-medium">{formatDateForDisplay(inputData.startDate)} – {formatDateForDisplay(inputData.endDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('ResultsDisplay.totalDays')}:</span>
                            <span className="font-medium">{totalDays} {t('ResultsDisplay.daysLabel')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('InvoiceForm.includeEndDateLabel')}</span>
                            <span className="font-medium">{inputData.includeEndDate ? t('ResultsDisplay.yesLabel', {defaultValue: 'Yes'}) : t('ResultsDisplay.noLabel', {defaultValue: 'No'})}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-primary/10 pt-2 mt-1">
                            <span className="text-muted-foreground">{t('ResultsDisplay.originalTotalLabel')}</span>
                            <span className="font-semibold text-primary">{formatNum(adjustedTotalAmount)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Merged Allocation Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">{t('ResultsDisplay.aggregatedTitle')}</h3>
                    
                    {/* Stacked View for Mobile (Visible below md breakpoint) */}
                    <div className="block md:hidden space-y-3">
                        {aggregatedSplits.map((split) => (
                            <div key={split.year} className="border rounded-md p-3 text-sm bg-muted/20">
                                <div className="font-semibold text-base mb-1">{split.year}</div>
                                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                                    <span className="text-muted-foreground">{t('ResultsDisplay.daysHeader')}:</span>
                                    <span className="text-right">{split.daysInYear}</span>
                                    <span className="text-muted-foreground">{t('ResultsDisplay.proportionHeader')}:</span>
                                    <span className="text-right">
                                        <div className="relative inline-block min-w-[100px] px-2 py-0.5">
                                            <div 
                                                className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm" 
                                                style={{ 
                                                    width: `${split.proportion * 100}%`,
                                                    maxWidth: '100%' 
                                                }}
                                            />
                                            <span className="relative z-10">{formatPct(split.proportion)}</span>
                                        </div>
                                    </span>
                                    
                                    {/* Add all amount columns */}
                                    {resultsPerAmount.map((amtResult, index) => {
                                        const splitAmount = amtResult.splits[split.year]?.splitAmount || 0;
                                        return (
                                            <React.Fragment key={index}>
                                                <span className="text-muted-foreground">{`${t('ResultsDisplay.amountHeader')} #${index + 1}`}:</span>
                                                <span className="text-right">{formatNum(splitAmount)}</span>
                                            </React.Fragment>
                                        );
                                    })}
                                    
                                    <span className="text-muted-foreground">{t('ResultsDisplay.yearTotalHeader')}:</span>
                                    <span className="text-right font-medium">{formatNum(split.totalSplitAmount)}</span>
                                </div>
                            </div>
                        ))}
                        {/* Mobile Totals: align as a single card like desktop */}
                        <div className="border-t pt-3 mt-3 text-sm">
                            <div className="border rounded-md p-3 bg-muted/20 font-semibold">
                                <div className="font-semibold text-base mb-1">{t('ResultsDisplay.totalHeader')}</div>
                                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                                    <span className="text-muted-foreground">{t('ResultsDisplay.daysHeader')}:</span>
                                    <span className="text-right">{totalDays}</span>
                                    <span className="text-muted-foreground">{t('ResultsDisplay.proportionHeader')}:</span>
                                    <span className="text-right">
                                        <div className="relative inline-block min-w-[100px] px-2 py-0.5">
                                            <div 
                                                className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm" 
                                                style={{ 
                                                    width: '100%',
                                                    maxWidth: '100%' 
                                                }}
                                            />
                                            <span className="relative z-10">{formatPct(1)}</span>
                                        </div>
                                    </span>
                                    
                                    {/* Add all amount totals */}
                                    {resultsPerAmount.map((amtResult, index) => (
                                        <React.Fragment key={index}>
                                            <span className="text-muted-foreground">{`${t('ResultsDisplay.amountHeader')} #${index + 1}`}:</span>
                                            <span className="text-right">{formatNum(amtResult.adjustedTotalAmount)}</span>
                                        </React.Fragment>
                                    ))}
                                    
                                    <span className="text-muted-foreground">{t('ResultsDisplay.yearTotalHeader')}:</span>
                                    <span className="text-right">{formatNum(adjustedTotalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table View for Desktop (Hidden below md breakpoint) */}
                    <div className="hidden md:block overflow-x-auto relative border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {mergedHeaders.map((header, idx) => (
                                        <TableHead key={header} className={idx > 0 ? "text-right" : "text-left"}>{header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mergedTableData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <TableCell 
                                                key={cellIndex} 
                                                className={`${cellIndex > 0 ? "text-right" : "text-left"}`}
                                            >
                                                {cellIndex === 2 ? (
                                                    <div className="relative px-3 py-1 h-8 flex items-center justify-end">
                                                        <div 
                                                            className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm" 
                                                            style={{ 
                                                                width: `${typeof cell === 'string' ? parseFloat(cell.replace(/[^0-9.]/g, '')) : 0}%`,
                                                                maxWidth: '100%' 
                                                            }}
                                                        />
                                                        <span className="relative z-10">{cell}</span>
                                                    </div>
                                                ) : cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    {mergedTotalsRow.map((cell, cellIndex) => (
                                        <TableCell 
                                            key={cellIndex} 
                                            className={`font-bold ${cellIndex > 0 ? "text-right" : ""}`}
                                        >
                                            {cellIndex === 2 ? (
                                                <div className="relative px-3 py-1 h-8 flex items-center justify-end">
                                                    <div 
                                                        className="absolute left-0 top-0 bottom-0 bg-primary/20 rounded-sm" 
                                                        style={{ 
                                                            width: '100%',
                                                            maxWidth: '100%' 
                                                        }}
                                                    />
                                                    <span className="relative z-10">{cell}</span>
                                                </div>
                                            ) : cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                    {discrepancyExists && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{t('ResultsDisplay.roundingNote')}</p>
                    )}
                </div>

                {/* Calculation Steps Accordion */}
                {calculationSteps && (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>{t('ResultsDisplay.calculationStepsTitle')}</AccordionTrigger>
                            <AccordionContent>
                                <CalculationStepsDisplay steps={calculationSteps} settings={settings} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
            {/* Apply responsive flex classes to footer with consistent padding */}
            <CardFooter className="flex flex-col sm:flex-row justify-start gap-4 px-6 py-6">
                 {/* Optionally make buttons full width when stacked */}
                 <Button variant="outline" onClick={handleExportExcel} className="w-full sm:w-auto h-11 px-4">
                   <FileSpreadsheet className="mr-2 h-4 w-4" />{t('ResultsDisplay.exportExcelButton')}
                 </Button>
                 <Button variant="outline" onClick={handleExportPdf} className="w-full sm:w-auto h-11 px-4">
                   <FileText className="mr-2 h-4 w-4" />{t('ResultsDisplay.exportPdfButton')}
                 </Button>
            </CardFooter>
        </Card>
    );
}
