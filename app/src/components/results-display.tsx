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

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

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

// Shared helpers
function round(value: number, decimals: number): number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}
const formatCurrency = (value: number): string => value.toFixed(2);
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatPercent = (value: number): string => (value * 100).toFixed(2) + '%';

// --- Calculation Steps Renderer Component --- 
const CalculationStepsDisplay = ({ steps }: { steps: CalculationStepDetails }) => {
    if (steps.error) {
        return <p className="text-destructive">{steps.error}</p>;
    }

    const { totalDuration, yearSegments, amountCalculations } = steps;

    return (
        <div className="text-sm space-y-4 font-mono">
            {/* 1. Duration */}
            <div>
                <h4 className="font-semibold mb-1">1. Total Duration</h4>
                <p>Period: {totalDuration.start} to {totalDuration.end} ({totalDuration.included ? 'inclusive' : 'exclusive'})</p>
                <p>Total Days: {totalDuration.days}</p>
            </div>

             {/* 2. Proportion per Year */}
            <div>
                <h4 className="font-semibold mb-1">2. Proportion Calculation per Year</h4>
                {yearSegments.map((seg: CalculationStepDetails['yearSegments'][0]) => (
                    <p key={seg.year}>
                         {seg.year}: {seg.days} days / {totalDuration.days} total days = {seg.proportion.toFixed(6)} (proportion)
                    </p>
                ))}
             </div>

             {/* 3. Split per Amount */}
             <div>
                <h4 className="font-semibold mb-1">3. Split Calculation per Input Amount</h4>
                {amountCalculations.map((amtCalc: CalculationStepDetails['amountCalculations'][0], index: number) => (
                    <div key={index} className="border-t pt-3 mt-3">
                        <p className="font-medium">Input Amount #{index + 1}: {formatCurrency(amtCalc.originalAmount)}</p>
                        {amtCalc.yearSplits.map((ys: CalculationStepDetails['amountCalculations'][0]['yearSplits'][0]) => (
                            <p key={ys.year} className="pl-4 text-xs">
                                {ys.year}: {formatCurrency(amtCalc.originalAmount)} * {yearSegments.find((s) => s.year === ys.year)?.proportion.toFixed(6)} =
                                Raw: {ys.rawSplit.toFixed(6)} → Rounded: {formatCurrency(ys.roundedSplit)}
                                {ys.adjustment !== 0 && ` (Adjustment: ${formatCurrency(ys.adjustment)})`}
                            </p>
                        ))}
                        <p className="pl-4 text-xs mt-1">
                            Discrepancy due to rounding: {formatCurrency(amtCalc.discrepancy)}
                            {amtCalc.adjustmentAppliedToYear && ` (Adjusted in year ${amtCalc.adjustmentAppliedToYear})`}
                        </p>
                        <p className="pl-4 text-xs font-medium">Final Sum for this Amount: {formatCurrency(amtCalc.finalSum)}</p>
                    </div>
                ))}
             </div>
        </div>
    );
};
// --- End Calculation Steps Renderer --- 


export function ResultsDisplay({ results, inputData }: ResultsDisplayProps) {
    const {
        totalDays,
        originalTotalAmount,
        adjustedTotalAmount,
        resultsPerAmount,
        aggregatedSplits,
        calculationSteps
    } = results;

    // --- Aggregated Table --- 
    const aggregatedHeaders = ["Year", "Days", "Proportion %", "Total Split Amount"];
    const aggregatedTableData = aggregatedSplits.map(split => [
        split.year,
        split.daysInYear,
        formatPercent(split.proportion),
        formatCurrency(split.totalSplitAmount)
    ]);
    const aggregatedTotalsRow = [
        "Total",
        totalDays,
        "100.00%",
        formatCurrency(adjustedTotalAmount)
    ];
    // --- End Aggregated Table --- 

     // --- Detailed Breakdown Table --- 
     // Headers: Year, Amount 1 Split, Amount 2 Split, ..., Year Total
     const detailedYears = aggregatedSplits.map(s => s.year);
     const detailedHeaders = ["Year"];
     inputData.amounts.forEach((_, index) => {
         detailedHeaders.push(`Amt ${index + 1} Split`);
     });
     detailedHeaders.push("Year Total");

     const detailedTableData = detailedYears.map(year => {
         const row: (string | number)[] = [year];
         let yearTotal = 0;
         resultsPerAmount.forEach(amtResult => {
             const splitAmount = amtResult.splits[year]?.splitAmount || 0;
             row.push(formatCurrency(splitAmount));
             yearTotal += splitAmount;
         });
         row.push(formatCurrency(round(yearTotal, 2)));
         return row;
     });

     const detailedTotalsRow: (string | number)[] = ["Total"];
     resultsPerAmount.forEach(amtResult => {
         detailedTotalsRow.push(formatCurrency(amtResult.adjustedTotalAmount));
     });
     detailedTotalsRow.push(formatCurrency(adjustedTotalAmount));
    // --- End Detailed Breakdown Table --- 


    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // --- Input Sheet ---
         const inputAmountsStr = inputData.amounts.map(a => formatCurrency(a)).join(", ");
         const inputWsData = [
             ["Input Summary"],
             [],
             ["Start Date:", formatDate(inputData.startDate)],
             ["End Date:", formatDate(inputData.endDate)],
             ["Include End Date:", inputData.includeEndDate ? "Yes" : "No"],
             ["Total Duration (days):", totalDays],
             ["Input Amounts:", inputAmountsStr],
             ["Original Total Amount:", formatCurrency(originalTotalAmount)],
         ];
        const inputWs = XLSX.utils.aoa_to_sheet(inputWsData);
        inputWs['!cols'] = [{ wch: 20 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, inputWs, "Input Summary");

        // --- Aggregated Sheet ---
        const aggWsData = [
            ["Aggregated Split per Year"],
            [],
            aggregatedHeaders,
            ...aggregatedTableData,
            [],
            aggregatedTotalsRow
        ];
        const aggWs = XLSX.utils.aoa_to_sheet(aggWsData);
        aggWs['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, aggWs, "Aggregated Results");

         // --- Detailed Sheet ---
         const detailWsData = [
             ["Detailed Split per Amount per Year"],
             [],
             detailedHeaders,
             ...detailedTableData,
             [],
             detailedTotalsRow
         ];
        const detailWs = XLSX.utils.aoa_to_sheet(detailWsData);
        const detailColWidths = [{ wch: 10 }, ...inputData.amounts.map(() => ({ wch: 15 })), { wch: 15 }];
        detailWs['!cols'] = detailColWidths;
        XLSX.utils.book_append_sheet(wb, detailWs, "Detailed Breakdown");

        XLSX.writeFile(wb, `invoice_split_${formatDate(new Date())}.xlsx`);
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        const title = "Invoice Split Calculation";
        const inputInfoLine1 = `Period: ${formatDate(inputData.startDate)} to ${formatDate(inputData.endDate)} (${inputData.includeEndDate ? 'inclusive' : 'exclusive'}, ${totalDays} days)`;
        const inputInfoLine2 = `Input Amounts Total: ${formatCurrency(originalTotalAmount)}`;

        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(10);
        doc.text(inputInfoLine1, 14, 26);
        doc.text(inputInfoLine2, 14, 30);

        // Add Aggregated Table
        doc.setFontSize(12);
        doc.text("Aggregated Split per Year", 14, 40);
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

         // Add Detailed Table
        // Use type assertion for the extended interface
        const lastTable = doc as jsPDFWithAutoTable;
        const startYDetailed = (lastTable.lastAutoTable?.finalY ?? 40) + 10; // Use nullish coalescing for safety
        doc.setFontSize(12);
        doc.text("Detailed Split per Amount per Year", 14, startYDetailed);
        autoTable(doc, {
            startY: startYDetailed + 2,
            head: [detailedHeaders],
            body: detailedTableData,
            foot: [detailedTotalsRow],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 1.5 },
            columnStyles: { // Apply right align to all amount columns
                 // Provide specific type for accumulator
                 ...detailedHeaders.reduce((styles: Record<number, { halign: 'right' }>, _, index) => {
                     if (index > 0) styles[index] = { halign: 'right' };
                     return styles;
                 }, {})
            }
        });

        doc.save(`invoice_split_${formatDate(new Date())}.pdf`);
    };

    const discrepancyExists = Math.abs(round(originalTotalAmount - adjustedTotalAmount, 2)) > 0.001;

    return (
        <Card className="mt-8 w-full max-w-4xl"> {/* Increased width */}
            <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Added space between sections */} 
                 <p className="text-sm text-muted-foreground">
                    Period: {formatDate(inputData.startDate)} to {formatDate(inputData.endDate)}
                    ({inputData.includeEndDate ? 'inclusive' : 'exclusive'}, {totalDays} days)<br />
                     Original Input Total: {formatCurrency(originalTotalAmount)}
                     ({inputData.amounts.length} amount{inputData.amounts.length === 1 ? '' : 's'} entered)
                </p>

                 {/* Aggregated Results Table */}
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Aggregated Split per Year</h3>
                     <Table>
                         <TableHeader>
                             <TableRow>{aggregatedHeaders.map(h => <TableHead key={h} className={h !== 'Year' ? 'text-right' : ''}>{h}</TableHead>)}</TableRow>
                         </TableHeader>
                         <TableBody>
                             {aggregatedSplits.map((split) => (
                                 <TableRow key={split.year}>
                                     <TableCell className="font-medium">{split.year}</TableCell>
                                     <TableCell className="text-right">{split.daysInYear}</TableCell>
                                     <TableCell className="text-right">{formatPercent(split.proportion)}</TableCell>
                                     <TableCell className="text-right">{formatCurrency(split.totalSplitAmount)}</TableCell>
                                 </TableRow>
                             ))}
                         </TableBody>
                         <TableFooter>
                              <TableRow className={discrepancyExists ? "bg-warning/10" : ""}>
                                  <TableCell colSpan={2} className="font-bold">Total</TableCell>
                                  <TableCell className="text-right font-bold">{aggregatedTotalsRow[2]}</TableCell>
                                  <TableCell className="text-right font-bold">{aggregatedTotalsRow[3]}</TableCell>
                              </TableRow>
                         </TableFooter>
                     </Table>
                      {discrepancyExists && (
                          <p className="text-xs text-muted-foreground mt-2 text-amber-700 dark:text-amber-500">
                              Note: Totals adjusted slightly due to rounding.
                          </p>
                      )}
                 </div>

                 {/* Detailed Breakdown Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Detailed Breakdown per Input Amount</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {detailedHeaders.map((header, index) => (
                                    <TableHead key={header} className={index > 0 ? 'text-right' : ''}>{header}</TableHead>
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
                                {detailedTotalsRow.map((cell, cellIndex) => (
                                     <TableCell key={cellIndex} className={`font-bold ${cellIndex > 0 ? 'text-right' : ''}`}>{cell}</TableCell>
                                ))}
                            </TableRow>
                         </TableFooter>
                    </Table>
                 </div>

                <Accordion type="single" collapsible className="w-full mt-6">
                     <AccordionItem value="item-1">
                        <AccordionTrigger>Show Calculation Steps</AccordionTrigger>
                        <AccordionContent>
                            {/* Render structured steps */}
                            <CalculationStepsDisplay steps={calculationSteps} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <Download className="mr-2 h-4 w-4" /> Export Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPdf}>
                     <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
            </CardFooter>
        </Card>
    );
}
