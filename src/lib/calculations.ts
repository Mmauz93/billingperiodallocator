// Add ESLint disable comments for unused imports that are kept for future use

import {
  CalculationError,
  CalculationProcessingError,
  ERROR_CODES,
  InputValidationError,
} from "./errors";
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

// Re-export error types so they can be imported from calculations.ts
export {
  CalculationError,
  CalculationProcessingError,
  InputValidationError,
  ERROR_CODES,
} from "./errors";

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
  splitPeriod?: "yearly" | "quarterly" | "monthly"; // Replaced daily with monthly
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
  splitPeriodUsed: "yearly" | "quarterly" | "monthly"; // Replaced daily with monthly
}

// --- Helper for structuring calculation steps ---
export interface CalculationStepDetails {
  totalDuration: {
    days: number;
    start: string;
    end: string;
    included: boolean;
  };
  periodSegments: {
    periodIdentifier: string;
    days: number;
    proportion: number;
  }[]; // Renamed from yearSegments
  amountCalculations: {
    originalAmount: number;
    periodSplits: {
      // Renamed from yearSplits
      periodIdentifier: string;
      rawSplit: number;
      roundedSplit: number;
      adjustment: number;
    }[];
    adjustmentAppliedToPeriod?: string; // Renamed from adjustmentAppliedToYear
    discrepancy: number;
    finalSum: number;
  }[];
  error?: string | CalculationError;
}
// --- End Helper ---

// New return types for calculateInvoiceSplit
interface CalculateInvoiceSplitSuccess
  extends Omit<CalculationResult, "calculationSteps"> {
  success: true;
  calculationSteps: Omit<CalculationStepDetails, "error"> & {
    error?: undefined;
  };
}

interface CalculateInvoiceSplitFailure {
  success: false;
  error: CalculationError;
  calculationSteps: CalculationStepDetails; // Contains the error details
  originalTotalAmount: number;
  splitPeriodUsed: "yearly" | "quarterly" | "monthly";
  // Minimal fields for consistency with createErrorResult's context
  totalDays: 0;
  adjustedTotalAmount: 0;
  resultsPerAmount: [];
  aggregatedSplits: [];
}

export type CalculateInvoiceSplitReturnType =
  | CalculateInvoiceSplitSuccess
  | CalculateInvoiceSplitFailure;

// Helper function to get the end of the next period based on the type
function getNextPeriodBoundary(
  currentDate: Date,
  periodType: "yearly" | "quarterly" | "monthly",
): Date {
  switch (periodType) {
    case "monthly":
      return startOfDay(addDays(endOfMonth(currentDate), 1));
    case "quarterly":
      return startOfDay(addDays(endOfQuarter(currentDate), 1));
    case "yearly":
    default:
      return startOfDay(addDays(endOfYear(currentDate), 1));
  }
}

// Helper function to generate a period identifier string
function getPeriodIdentifier(
  date: Date,
  periodType: "yearly" | "quarterly" | "monthly",
): string {
  const year = getYear(date);
  switch (periodType) {
    case "monthly":
      return format(date, "yyyy-MM");
    case "quarterly":
      const quarter = getQuarter(date);
      return `${year}-Q${quarter}`;
    case "yearly":
    default:
      return year.toString();
  }
}

/**
 * Calculates the proportional split of invoice amounts across specified periods.
 * Applies rounding and adjustment for precision.
 *
 * @throws {InputValidationError} When input data is invalid
 * @throws {CalculationProcessingError} When calculation can't be completed successfully
 */
export function calculateInvoiceSplit(
  input: CalculationInput,
): CalculateInvoiceSplitReturnType {
  const splitPeriod = input.splitPeriod || "yearly"; // Default to yearly if not provided
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

  // Validate inputs with clear error messages
  if (!input.amounts || input.amounts.length === 0) {
    const error = new InputValidationError(
      "At least one invoice amount is required.",
      ERROR_CODES.NO_AMOUNTS,
    );
    calcSteps.error = error;
    return {
      success: false,
      error: error,
      calculationSteps: calcSteps,
      originalTotalAmount: 0, // No amounts processed yet
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }

  if (input.amounts.some((a) => isNaN(a) || a === null || a <= 0)) {
    const invalidAmounts = input.amounts.filter(
      (a) => isNaN(a) || a === null || a <= 0,
    );
    const error = new InputValidationError(
      "All amounts must be valid positive numbers.",
      ERROR_CODES.INVALID_AMOUNT,
      { invalidAmounts },
    );
    calcSteps.error = error;
    return {
      success: false,
      error: error,
      calculationSteps: calcSteps,
      originalTotalAmount: 0, // Or sum of amounts if calculated before this check
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }

  const originalTotalAmount = round(
    input.amounts.reduce((sum, a) => sum + a, 0),
    2,
  );

  // Start date and end date validation
  if (
    !input.startDate ||
    !input.endDate ||
    !(input.startDate instanceof Date) ||
    !(input.endDate instanceof Date)
  ) {
    const error = new InputValidationError(
      "Valid start and end dates are required.",
      ERROR_CODES.INVALID_DATES,
      { startDate: input.startDate, endDate: input.endDate },
    );
    calcSteps.error = error;
    return {
      success: false,
      error: error,
      calculationSteps: calcSteps,
      originalTotalAmount: originalTotalAmount,
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }

  const cleanStartDate = startOfDay(input.startDate);
  let cleanEffectiveEndDate = startOfDay(input.endDate);
  if (input.includeEndDate) {
    cleanEffectiveEndDate = addDays(cleanEffectiveEndDate, 1);
  }
  calcSteps.totalDuration.start = format(cleanStartDate, "yyyy-MM-dd");
  // Use original end date for display if included, otherwise the day before effective end
  calcSteps.totalDuration.end = format(
    input.includeEndDate ? input.endDate : addDays(cleanEffectiveEndDate, -1),
    "yyyy-MM-dd",
  );

  if (cleanStartDate >= cleanEffectiveEndDate) {
    const error = new InputValidationError(
      "Start date must be before the end date.",
      ERROR_CODES.END_BEFORE_START,
      {
        startDate: format(cleanStartDate, "yyyy-MM-dd"),
        endDate: format(cleanEffectiveEndDate, "yyyy-MM-dd"),
        includeEndDate: input.includeEndDate,
      },
    );
    calcSteps.error = error;
    return {
      success: false,
      error: error,
      calculationSteps: calcSteps,
      originalTotalAmount: originalTotalAmount,
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }

  const totalDurationDays = differenceInDays(
    cleanEffectiveEndDate,
    cleanStartDate,
  );
  calcSteps.totalDuration.days = totalDurationDays;

  if (totalDurationDays <= 0) {
    const error = new InputValidationError(
      "The date range must result in a positive duration.",
      ERROR_CODES.ZERO_DURATION,
      {
        startDate: format(cleanStartDate, "yyyy-MM-dd"),
        endDate: format(cleanEffectiveEndDate, "yyyy-MM-dd"),
        calculatedDays: totalDurationDays,
      },
    );
    calcSteps.error = error;
    return {
      success: false,
      error: error,
      calculationSteps: calcSteps,
      originalTotalAmount: originalTotalAmount,
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }

  try {
    // --- Calculate days and proportions per period segment ---
    const periodSegmentMap: {
      [periodIdentifier: string]: { days: number; proportion: number };
    } = {};
    let currentDate = cleanStartDate;
    while (currentDate < cleanEffectiveEndDate) {
      const periodIdentifier = getPeriodIdentifier(currentDate, splitPeriod);
      const nextPeriodBoundary = getNextPeriodBoundary(
        currentDate,
        splitPeriod,
      );
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
        rawSplits.push({
          periodIdentifier: identifier,
          rawSplit: rawSplitAmount,
        });
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
        const step = amountCalcStep.periodSplits.find(
          (s) => s.periodIdentifier === rs.periodIdentifier,
        );
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
          Math.abs(current.rawSplit) > Math.abs(max.rawSplit) ? current : max,
        );
        const periodIdentifierToAdjust = periodToAdjustDetails.periodIdentifier;

        // Find the corresponding entry in roundedSplits to apply the adjustment
        const splitToAdjust = roundedSplits.find(
          (s) => s.periodIdentifier === periodIdentifierToAdjust,
        );
        if (splitToAdjust) {
          splitToAdjust.roundedSplit = round(
            splitToAdjust.roundedSplit + discrepancy,
            2,
          );

          // Update calculation steps with the adjustment detail
          const step = amountCalcStep.periodSplits.find(
            (s) => s.periodIdentifier === periodIdentifierToAdjust,
          );
          if (step) {
            step.roundedSplit = splitToAdjust.roundedSplit; // Ensure step reflects adjusted rounded value
            step.adjustment = discrepancy;
          }
          amountCalcStep.adjustmentAppliedToPeriod = periodIdentifierToAdjust;
        } else {
          throw new CalculationProcessingError(
            "Calculation error: Unable to apply rounding adjustment.",
            ERROR_CODES.ROUNDING_ERROR,
            { discrepancy, periodToAdjust: periodIdentifierToAdjust },
          );
        }
      }

      // Store final splits for this amount
      const finalAmountSplits: {
        [periodIdentifier: string]: SingleAmountPeriodSplit;
      } = {};
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
    const aggregatedSplits: AggregatedPeriodSplit[] = Object.entries(
      periodSegmentMap,
    )
      .map(([identifier, segment]) => {
        const periodIdentifier = identifier;
        let totalSplitForPeriod = 0;
        resultsPerAmount.forEach((amountResult) => {
          totalSplitForPeriod +=
            amountResult.splits[periodIdentifier]?.splitAmount || 0;
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
    const finalDiscrepancy = round(
      originalTotalAmount - finalAdjustedTotalAmount,
      2,
    );
    if (Math.abs(finalDiscrepancy) > 0.01 * input.amounts.length) {
      // Allow small tolerance per amount
      console.warn(
        `Potential rounding discrepancy: Original ${originalTotalAmount}, Adjusted ${finalAdjustedTotalAmount}, Diff ${finalDiscrepancy}`,
      );
      // Do not throw here, but we could add a warning to the result
    }

    // MODIFIED: Ensure calcSteps.error is undefined for success case
    const successCalcSteps: Omit<CalculationStepDetails, "error"> & {
      error?: undefined;
    } = { ...calcSteps, error: undefined };

    return {
      success: true,
      totalDays: totalDurationDays,
      originalTotalAmount: originalTotalAmount,
      adjustedTotalAmount: finalAdjustedTotalAmount,
      resultsPerAmount: resultsPerAmount,
      aggregatedSplits: aggregatedSplits,
      calculationSteps: successCalcSteps,
      splitPeriodUsed: splitPeriod,
    };
  } catch (error) {
    // Handle unexpected errors or re-throw known errors
    let caughtError: CalculationError;
    if (error instanceof CalculationError) {
      caughtError = error;
    } else {
      // Convert unknown errors to CalculationError
      caughtError = new CalculationProcessingError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during calculation.",
        ERROR_CODES.UNEXPECTED_ERROR,
        { originalError: error },
      );
    }
    calcSteps.error = caughtError; // Ensure calcSteps has the error for the failure object

    // MODIFIED: Return CalculateInvoiceSplitFailure
    return {
      success: false,
      error: caughtError,
      calculationSteps: calcSteps,
      originalTotalAmount: originalTotalAmount,
      splitPeriodUsed: splitPeriod,
      totalDays: 0,
      adjustedTotalAmount: 0,
      resultsPerAmount: [],
      aggregatedSplits: [],
    };
  }
}
