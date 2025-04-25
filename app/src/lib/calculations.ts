import { addDays, differenceInDays, endOfYear, getYear, startOfDay } from 'date-fns';

import { format } from 'date-fns';

// Helper function for rounding to a specific number of decimal places
function round(value: number, decimals: number): number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

// Updated Input: Accepts an array of amounts
export interface CalculationInput {
    startDate: Date;
    endDate: Date;
    includeEndDate: boolean;
    amounts: number[]; // Array of amounts to be summed and split
}

// Represents the split portion of a SINGLE original amount for a specific year
interface SingleAmountYearSplit {
    splitAmount: number; // Rounded split portion for this year
}

// Represents the split results for ONE original input amount across all years
export interface AmountSplitResult {
    originalAmount: number;
    adjustedTotalAmount: number; // Sum of splits for this amount after adjustment
    splits: { [year: number]: SingleAmountYearSplit }; // Map year to its split portion
}

// Represents the aggregated results per year across ALL input amounts
export interface AggregatedYearSplit {
    year: number;
    daysInYear: number;
    proportion: number;
    totalSplitAmount: number; // Sum of all individual amount splits for this year
}

// Updated CalculationResult structure
export interface CalculationResult {
    totalDays: number;
    originalTotalAmount: number; // Sum of all input amounts
    adjustedTotalAmount: number; // Sum of all adjusted split amounts
    resultsPerAmount: AmountSplitResult[]; // Detailed results for each input amount
    aggregatedSplits: AggregatedYearSplit[]; // Aggregated results per year
    calculationSteps: CalculationStepDetails;
}

// --- Helper for structuring calculation steps --- 
export interface CalculationStepDetails {
    totalDuration: { days: number; start: string; end: string; included: boolean };
    yearSegments: { year: number; days: number; proportion: number }[];
    amountCalculations: {
        originalAmount: number;
        yearSplits: { year: number; rawSplit: number; roundedSplit: number; adjustment: number }[];
        adjustmentAppliedToYear?: number;
        discrepancy: number;
        finalSum: number;
    }[];
    error?: string;
}
// --- End Helper --- 

/**
 * Calculates the proportional split of invoice amounts across fiscal years.
 * Applies rounding and adjustment for precision.
 */
export function calculateInvoiceSplit(input: CalculationInput): CalculationResult {
    const calcSteps: CalculationStepDetails = {
        totalDuration: { days: 0, start: "", end: "", included: input.includeEndDate },
        yearSegments: [],
        amountCalculations: [],
    };

    if (!input.amounts || input.amounts.length === 0) {
        // Return structure indicating error, conforming to CalculationResult
        return {
            totalDays: 0,
            originalTotalAmount: 0,
            adjustedTotalAmount: 0,
            resultsPerAmount: [],
            aggregatedSplits: [],
            calculationSteps: { ...calcSteps, error: "At least one amount is required." }
        };
    }
    if (input.amounts.some(a => isNaN(a) || a === null)) {
         return {
            totalDays: 0,
            originalTotalAmount: 0,
            adjustedTotalAmount: 0,
            resultsPerAmount: [],
            aggregatedSplits: [],
            calculationSteps: { ...calcSteps, error: "Invalid non-numeric amount provided." }
        };
    }

    const originalTotalAmount = round(input.amounts.reduce((sum, a) => sum + a, 0), 2);

    const cleanStartDate = startOfDay(input.startDate);
    let cleanEffectiveEndDate = startOfDay(input.endDate);
    if (input.includeEndDate) {
        cleanEffectiveEndDate = addDays(cleanEffectiveEndDate, 1);
    }
    calcSteps.totalDuration.start = format(cleanStartDate, 'yyyy-MM-dd');
    calcSteps.totalDuration.end = format(cleanEffectiveEndDate, 'yyyy-MM-dd');

    if (cleanStartDate >= cleanEffectiveEndDate) {
         return {
            totalDays: 0,
            originalTotalAmount,
            adjustedTotalAmount: 0,
            resultsPerAmount: [],
            aggregatedSplits: [],
            calculationSteps: { ...calcSteps, error: "Start date must be before the effective end date." }
        };
    }

    const totalDurationDays = differenceInDays(cleanEffectiveEndDate, cleanStartDate);
    calcSteps.totalDuration.days = totalDurationDays;

    if (totalDurationDays <= 0) {
         return {
            totalDays: 0,
            originalTotalAmount,
            adjustedTotalAmount: 0,
            resultsPerAmount: [],
            aggregatedSplits: [],
            calculationSteps: { ...calcSteps, error: "Calculated duration is zero or negative." }
        };
    }

    // --- Calculate days and proportions per year segment --- 
    const yearSegmentMap: { [year: number]: { days: number; proportion: number } } = {};
    let currentDate = cleanStartDate;
    while (currentDate < cleanEffectiveEndDate) {
        const currentYear = getYear(currentDate);
        const currentYearEndDate = endOfYear(currentDate);
        const nextYearStartDate = startOfDay(addDays(currentYearEndDate, 1));
        const segmentEndDate = cleanEffectiveEndDate < nextYearStartDate ? cleanEffectiveEndDate : nextYearStartDate;
        const daysInSegment = differenceInDays(segmentEndDate, currentDate);

        if (daysInSegment > 0) {
            const proportion = daysInSegment / totalDurationDays;
            if (!yearSegmentMap[currentYear]) {
                yearSegmentMap[currentYear] = { days: 0, proportion: 0 };
            }
            yearSegmentMap[currentYear].days += daysInSegment;
            yearSegmentMap[currentYear].proportion += proportion;
        }
        currentDate = segmentEndDate;
    }
    // Store year segment details for calculation steps display
    calcSteps.yearSegments = Object.entries(yearSegmentMap).map(([year, data]) => ({ year: Number(year), days: data.days, proportion: data.proportion })).sort((a,b)=> a.year - b.year);
    // --- End Segment Calculation --- 

    const resultsPerAmount: AmountSplitResult[] = [];

    // --- Process each amount individually --- 
    for (const amount of input.amounts) {
        const amountCalcStep: CalculationStepDetails['amountCalculations'][0] = {
            originalAmount: amount,
            yearSplits: [],
            discrepancy: 0,
            finalSum: 0
        };

        const rawSplits: { year: number; rawSplit: number }[] = [];
        for (const yearStr in yearSegmentMap) {
            const year = Number(yearStr);
            const segment = yearSegmentMap[year];
            const rawSplitAmount = amount * segment.proportion;
            rawSplits.push({ year, rawSplit: rawSplitAmount });
            amountCalcStep.yearSplits.push({ year, rawSplit: rawSplitAmount, roundedSplit:0, adjustment: 0}); // Initialize step details
        }

        // Round initial splits for this amount
        const roundedSplits = rawSplits.map(split => ({
            ...split,
            roundedSplit: round(split.rawSplit, 2),
        }));

        // Update steps with rounded values
        roundedSplits.forEach(rs => {
            const step = amountCalcStep.yearSplits.find(s => s.year === rs.year);
            if(step) step.roundedSplit = rs.roundedSplit;
        });

        // Calculate discrepancy for this amount
        const currentTotal = round(roundedSplits.reduce((sum, s) => sum + s.roundedSplit, 0), 2);
        const discrepancy = round(amount - currentTotal, 2);
        amountCalcStep.discrepancy = discrepancy;

        // Adjust discrepancy for this amount
        if (discrepancy !== 0 && roundedSplits.length > 0) {
            // Sort by year to adjust the first year consistently
            roundedSplits.sort((a, b) => a.year - b.year);
            const targetIndex = 0;
            roundedSplits[targetIndex].roundedSplit = round(roundedSplits[targetIndex].roundedSplit + discrepancy, 2);

            // Update steps with adjustment
             const step = amountCalcStep.yearSplits.find(s => s.year === roundedSplits[targetIndex].year);
             if(step) step.adjustment = discrepancy;
             amountCalcStep.adjustmentAppliedToYear = roundedSplits[targetIndex].year;
        }

        // Store final splits for this amount
        const finalAmountSplits: { [year: number]: SingleAmountYearSplit } = {};
        roundedSplits.forEach(s => {
            finalAmountSplits[s.year] = { splitAmount: s.roundedSplit };
        });

        const adjustedTotalForThisAmount = round(roundedSplits.reduce((sum, s) => sum + s.roundedSplit, 0), 2);
        amountCalcStep.finalSum = adjustedTotalForThisAmount;

        resultsPerAmount.push({
            originalAmount: amount,
            adjustedTotalAmount: adjustedTotalForThisAmount,
            splits: finalAmountSplits,
        });
        calcSteps.amountCalculations.push(amountCalcStep);
    }
    // --- End Amount Processing --- 

    // --- Aggregate results per year --- 
    const aggregatedSplits: AggregatedYearSplit[] = Object.entries(yearSegmentMap)
        .map(([yearStr, segment]) => {
            const year = Number(yearStr);
            let totalSplitForYear = 0;
            resultsPerAmount.forEach(amountResult => {
                totalSplitForYear += amountResult.splits[year]?.splitAmount || 0;
            });
            return {
                year: year,
                daysInYear: segment.days,
                proportion: segment.proportion,
                totalSplitAmount: round(totalSplitForYear, 2),
            };
        })
        .sort((a, b) => a.year - b.year);
    // --- End Aggregation --- 

    const finalAdjustedTotalAmount = round(aggregatedSplits.reduce((sum, s) => sum + s.totalSplitAmount, 0), 2);

    return {
        totalDays: totalDurationDays,
        originalTotalAmount: originalTotalAmount,
        adjustedTotalAmount: finalAdjustedTotalAmount,
        resultsPerAmount: resultsPerAmount,
        aggregatedSplits: aggregatedSplits,
        calculationSteps: calcSteps,
    };
}
