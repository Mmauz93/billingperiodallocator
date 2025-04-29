// Add ESLint disable comments for unused imports that are kept for future use
import {
  addDays,
  differenceInDays,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  getQuarter,
  getYear,
  startOfDay,
} from "date-fns";

// Helper function for rounding to a specific number of decimal places
function round(value: number, decimals: number): number {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

// Updated Input: Accepts an array of amounts and split period type
export interface CalculationInput {
  startDate: Date;
  endDate: Date;
  includeEndDate: boolean;
  amounts: number[]; // Array of amounts to be summed and split
  splitPeriod?: 'yearly' | 'quarterly' | 'monthly'; // Replaced daily with monthly
}

// Represents the split portion of a SINGLE original amount for a specific period (year, quarter, or day)
interface SingleAmountPeriodSplit {
  splitAmount: number; // Rounded split portion for this period
}

// Represents the split results for ONE original input amount across all periods
export interface AmountSplitResult {
  originalAmount: number;
  adjustedTotalAmount: number; // Sum of splits for this amount after adjustment
  splits: { [periodIdentifier: string]: SingleAmountPeriodSplit }; // Map period identifier (YYYY, YYYY-Qn, YYYY-MM) to its split portion
}

// Represents the aggregated results per period across ALL input amounts
export interface AggregatedPeriodSplit {
  periodIdentifier: string; // YYYY, YYYY-Qn, or YYYY-MM
  daysInPeriod: number;
  proportion: number;
  totalSplitAmount: number; // Sum of all individual amount splits for this period
}

// Updated CalculationResult structure
export interface CalculationResult {
  totalDays: number;
  originalTotalAmount: number; // Sum of all input amounts
  adjustedTotalAmount: number; // Sum of all adjusted split amounts
  resultsPerAmount: AmountSplitResult[]; // Detailed results for each input amount
  aggregatedSplits: AggregatedPeriodSplit[]; // Aggregated results per period
  calculationSteps: CalculationStepDetails;
  splitPeriodUsed: 'yearly' | 'quarterly' | 'monthly'; // Replaced daily with monthly
}

// --- Helper for structuring calculation steps ---
export interface CalculationStepDetails {
  totalDuration: {
    days: number;
    start: string;
    end: string;
    included: boolean;
  };
  periodSegments: { periodIdentifier: string; days: number; proportion: number }[]; // Renamed from yearSegments
  amountCalculations: {
    originalAmount: number;
    periodSplits: { // Renamed from yearSplits
      periodIdentifier: string;
      rawSplit: number;
      roundedSplit: number;
      adjustment: number;
    }[];
    adjustmentAppliedToPeriod?: string; // Renamed from adjustmentAppliedToYear
    discrepancy: number;
    finalSum: number;
  }[];
  error?: string;
}
// --- End Helper ---

// Helper function to get the end of the next period based on the type
function getNextPeriodBoundary(currentDate: Date, periodType: 'yearly' | 'quarterly' | 'monthly'): Date {
  switch (periodType) {
    case 'monthly':
      return startOfDay(addDays(endOfMonth(currentDate), 1));
    case 'quarterly':
      return startOfDay(addDays(endOfQuarter(currentDate), 1));
    case 'yearly':
    default:
      return startOfDay(addDays(endOfYear(currentDate), 1));
  }
}

// Helper function to generate a period identifier string
function getPeriodIdentifier(date: Date, periodType: 'yearly' | 'quarterly' | 'monthly'): string {
  const year = getYear(date);
  switch (periodType) {
    case 'monthly':
      return format(date, 'yyyy-MM');
    case 'quarterly':
      const quarter = getQuarter(date);
      return `${year}-Q${quarter}`;
    case 'yearly':
    default:
      return year.toString();
  }
}

/**
 * Calculates the proportional split of invoice amounts across specified periods.
 * Applies rounding and adjustment for precision.
 */
export function calculateInvoiceSplit(
  input: CalculationInput,
): CalculationResult {
  const splitPeriod = input.splitPeriod || 'yearly'; // Default to yearly if not provided
  const calcSteps: CalculationStepDetails = {
    totalDuration: {
      days: 0,
      start: "",
      end: "",
      included: input.includeEndDate,
    },
    periodSegments: [], // Renamed
    amountCalculations: [],
  };

  if (!input.amounts || input.amounts.length === 0) {
    // Return structure indicating error
    return {
      totalDays: 0,
      originalTotalAmount: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
      calculationSteps: {
        ...calcSteps,
        error: "At least one amount is required.",
      },
      splitPeriodUsed: splitPeriod,
    };
  }
  if (input.amounts.some((a) => isNaN(a) || a === null)) {
    return {
      totalDays: 0,
      originalTotalAmount: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
      calculationSteps: {
        ...calcSteps,
        error: "Invalid non-numeric amount provided.",
      },
      splitPeriodUsed: splitPeriod,
    };
  }

  const originalTotalAmount = round(
    input.amounts.reduce((sum, a) => sum + a, 0),
    2,
  );

  const cleanStartDate = startOfDay(input.startDate);
  let cleanEffectiveEndDate = startOfDay(input.endDate);
  if (input.includeEndDate) {
    cleanEffectiveEndDate = addDays(cleanEffectiveEndDate, 1);
  }
  calcSteps.totalDuration.start = format(cleanStartDate, "yyyy-MM-dd");
  // Use original end date for display if included, otherwise the day before effective end
  calcSteps.totalDuration.end = format(input.includeEndDate ? input.endDate : addDays(cleanEffectiveEndDate, -1), "yyyy-MM-dd"); 

  if (cleanStartDate >= cleanEffectiveEndDate) {
    return {
      totalDays: 0,
      originalTotalAmount,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
      calculationSteps: {
        ...calcSteps,
        error: "Start date must be before the effective end date.",
      },
      splitPeriodUsed: splitPeriod,
    };
  }

  const totalDurationDays = differenceInDays(
    cleanEffectiveEndDate,
    cleanStartDate,
  );
  calcSteps.totalDuration.days = totalDurationDays;

  if (totalDurationDays <= 0) {
    return {
      totalDays: 0,
      originalTotalAmount,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
      calculationSteps: {
        ...calcSteps,
        error: "Calculated duration is zero or negative.",
      },
      splitPeriodUsed: splitPeriod,
    };
  }

  // --- Calculate days and proportions per period segment ---
  const periodSegmentMap: {
    [periodIdentifier: string]: { days: number; proportion: number };
  } = {};
  let currentDate = cleanStartDate;
  while (currentDate < cleanEffectiveEndDate) {
    const periodIdentifier = getPeriodIdentifier(currentDate, splitPeriod);
    const nextPeriodBoundary = getNextPeriodBoundary(currentDate, splitPeriod);
    const segmentEndDate =
      cleanEffectiveEndDate < nextPeriodBoundary
        ? cleanEffectiveEndDate
        : nextPeriodBoundary;
    const daysInSegment = differenceInDays(segmentEndDate, currentDate);

    if (daysInSegment > 0) {
      const proportion = daysInSegment / totalDurationDays;
      if (!periodSegmentMap[periodIdentifier]) {
        periodSegmentMap[periodIdentifier] = { days: 0, proportion: 0 };
      }
      periodSegmentMap[periodIdentifier].days += daysInSegment;
      periodSegmentMap[periodIdentifier].proportion += proportion;
    }
    currentDate = segmentEndDate;
  }
  // Store period segment details for calculation steps display
  calcSteps.periodSegments = Object.entries(periodSegmentMap)
    .map(([identifier, data]) => ({
      periodIdentifier: identifier,
      days: data.days,
      proportion: data.proportion,
    }))
    // Custom sort needed: Year > Quarter > Month
    .sort((a, b) => {
        // Sort YYYY, YYYY-Qn, YYYY-MM correctly
        return a.periodIdentifier.localeCompare(b.periodIdentifier);
    });
  // --- End Segment Calculation ---

  const resultsPerAmount: AmountSplitResult[] = [];

  // --- Process each amount individually ---
  for (const amount of input.amounts) {
    const amountCalcStep: CalculationStepDetails["amountCalculations"][0] = {
      originalAmount: amount,
      periodSplits: [], // Renamed
      discrepancy: 0,
      finalSum: 0,
    };

    const rawSplits: { periodIdentifier: string; rawSplit: number }[] = [];
    for (const identifier in periodSegmentMap) {
      const segment = periodSegmentMap[identifier];
      const rawSplitAmount = amount * segment.proportion;
      rawSplits.push({ periodIdentifier: identifier, rawSplit: rawSplitAmount });
      amountCalcStep.periodSplits.push({
        periodIdentifier: identifier,
        rawSplit: rawSplitAmount,
        roundedSplit: 0,
        adjustment: 0,
      }); // Initialize step details
    }

    // Round initial splits for this amount
    const roundedSplits = rawSplits.map((split) => ({
      ...split,
      roundedSplit: round(split.rawSplit, 2),
    }));

    // Update steps with rounded values
    roundedSplits.forEach((rs) => {
      const step = amountCalcStep.periodSplits.find((s) => s.periodIdentifier === rs.periodIdentifier);
      if (step) step.roundedSplit = rs.roundedSplit;
    });

    // Calculate discrepancy for this amount
    const currentTotal = round(
      roundedSplits.reduce((sum, s) => sum + s.roundedSplit, 0),
      2,
    );
    const discrepancy = round(amount - currentTotal, 2);
    amountCalcStep.discrepancy = discrepancy;

    // Apply rounding adjustment to the period with the largest raw amount
    if (discrepancy !== 0 && roundedSplits.length > 0) {
      // Find the period with the max *raw* split amount to minimize impact of rounding intermediate values
      const periodToAdjustDetails = rawSplits.reduce((max, current) => 
         Math.abs(current.rawSplit) > Math.abs(max.rawSplit) ? current : max
      );
      const periodIdentifierToAdjust = periodToAdjustDetails.periodIdentifier;

      // Find the corresponding entry in roundedSplits to apply the adjustment
      const splitToAdjust = roundedSplits.find(s => s.periodIdentifier === periodIdentifierToAdjust);
      if(splitToAdjust) {
        splitToAdjust.roundedSplit = round(splitToAdjust.roundedSplit + discrepancy, 2);
        
        // Update calculation steps with the adjustment detail
        const step = amountCalcStep.periodSplits.find(s => s.periodIdentifier === periodIdentifierToAdjust);
        if (step) {
            step.roundedSplit = splitToAdjust.roundedSplit; // Ensure step reflects adjusted rounded value
            step.adjustment = discrepancy;
        }
        amountCalcStep.adjustmentAppliedToPeriod = periodIdentifierToAdjust;
      } else {
        // Fallback if somehow the period wasn't found (shouldn't happen)
        console.warn("Could not find period to apply adjustment, discrepancy unapplied for this amount.")
      }
    }

    // Store final splits for this amount
    const finalAmountSplits: { [periodIdentifier: string]: SingleAmountPeriodSplit } = {};
    roundedSplits.forEach((s) => {
      finalAmountSplits[s.periodIdentifier] = { splitAmount: s.roundedSplit };
    });

    const adjustedTotalForThisAmount = round(
      roundedSplits.reduce((sum, s) => sum + s.roundedSplit, 0),
      2,
    );
    amountCalcStep.finalSum = adjustedTotalForThisAmount;

    resultsPerAmount.push({
      originalAmount: amount,
      adjustedTotalAmount: adjustedTotalForThisAmount,
      splits: finalAmountSplits,
    });
    calcSteps.amountCalculations.push(amountCalcStep);
  }
  // --- End Amount Processing ---

  // --- Aggregate results per period ---
  const aggregatedSplits: AggregatedPeriodSplit[] = Object.entries(periodSegmentMap)
    .map(([identifier, segment]) => {
      const periodIdentifier = identifier;
      let totalSplitForPeriod = 0;
      resultsPerAmount.forEach((amountResult) => {
        totalSplitForPeriod += amountResult.splits[periodIdentifier]?.splitAmount || 0;
      });
      return {
        periodIdentifier: periodIdentifier,
        daysInPeriod: segment.days,
        proportion: segment.proportion,
        totalSplitAmount: round(totalSplitForPeriod, 2),
      };
    })
    // Use the same sort as periodSegments
    .sort((a, b) => a.periodIdentifier.localeCompare(b.periodIdentifier));
  // --- End Aggregation ---

  const finalAdjustedTotalAmount = round(
    aggregatedSplits.reduce((sum, s) => sum + s.totalSplitAmount, 0),
    2,
  );

  // Final sanity check: does adjusted total match original total?
  const finalDiscrepancy = round(originalTotalAmount - finalAdjustedTotalAmount, 2);
  if (Math.abs(finalDiscrepancy) > 0.01 * input.amounts.length) { // Allow small tolerance per amount
       console.warn(`Potential rounding discrepancy: Original ${originalTotalAmount}, Adjusted ${finalAdjustedTotalAmount}, Diff ${finalDiscrepancy}`);
       // Optionally add a warning to the results/steps if needed
  }

  return {
    totalDays: totalDurationDays,
    originalTotalAmount: originalTotalAmount,
    adjustedTotalAmount: finalAdjustedTotalAmount,
    resultsPerAmount: resultsPerAmount,
    aggregatedSplits: aggregatedSplits,
    calculationSteps: calcSteps,
    splitPeriodUsed: splitPeriod,
  };
}
