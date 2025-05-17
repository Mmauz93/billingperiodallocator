import { CalculationInput, calculateInvoiceSplit } from "./calculations";

import { createUTCDate } from "./date-utils";

// Split the helper function into multiple smaller functions to reduce complexity
function parseTestDate(dateStr: string): Date {
  return createUTCDate(dateStr);
}

// Use the simpler name for tests
const d = parseTestDate;

describe("calculateInvoiceSplit", () => {
  // Basic Test: Single year, no leap, exclusive end date
  test("should split correctly within a single year (exclusive)", () => {
    const input: CalculationInput = {
      startDate: d("2023-01-15"),
      endDate: d("2023-03-15"),
      includeEndDate: false,
      amounts: [1000, 100], // Sum = 1100
    };
    const result = calculateInvoiceSplit(input);
    expect(result.totalDays).toBe(59);
    expect(result.aggregatedSplits).toHaveLength(1);
    expect(result.aggregatedSplits[0].year).toBe(2023);
    expect(result.aggregatedSplits[0].daysInYear).toBe(59);
    expect(result.aggregatedSplits[0].totalSplitAmount).toBeCloseTo(1100, 2);
    expect(result.originalTotalAmount).toBeCloseTo(1100, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(1100, 2);
  });

  // Basic Test: Single year, no leap, inclusive end date
  test("should split correctly within a single year (inclusive)", () => {
    const input: CalculationInput = {
      startDate: d("2023-01-15"),
      endDate: d("2023-03-15"),
      includeEndDate: true,
      amounts: [1100], // Single amount
    };
    const result = calculateInvoiceSplit(input);
    expect(result.totalDays).toBe(60);
    expect(result.aggregatedSplits).toHaveLength(1);
    expect(result.aggregatedSplits[0].year).toBe(2023);
    expect(result.aggregatedSplits[0].daysInYear).toBe(60);
    expect(result.aggregatedSplits[0].totalSplitAmount).toBeCloseTo(1100, 2);
    expect(result.originalTotalAmount).toBeCloseTo(1100, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(1100, 2);
  });

  // Test spanning two years (exclusive)
  test("should split correctly across two years (exclusive)", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-01"),
      endDate: d("2024-02-01"),
      includeEndDate: false,
      amounts: [1000, 80], // Sum = 1080
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 1080;

    expect(result.totalDays).toBe(62);
    expect(result.aggregatedSplits).toHaveLength(2);

    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);

    expect(split2023?.daysInYear).toBe(31);
    expect(split2023?.totalSplitAmount).toBeCloseTo(totalAmount * (31 / 62), 2);

    expect(split2024?.daysInYear).toBe(31);
    expect(split2024?.totalSplitAmount).toBeCloseTo(totalAmount * (31 / 62), 2);

    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);
  });

  // Test spanning two years including a leap day (Feb 29th, 2024)
  test("should split correctly across two years including leap day (inclusive)", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-15"),
      endDate: d("2024-03-15"),
      includeEndDate: true,
      amounts: [10000, 816], // Sum = 10816
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 10816;

    expect(result.totalDays).toBe(92);
    expect(result.aggregatedSplits).toHaveLength(2);

    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);

    expect(split2023?.daysInYear).toBe(17);
    expect(split2024?.daysInYear).toBe(75);

    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);

    expect(split2023).toBeDefined();
    expect(split2024).toBeDefined();
    expect(
      (split2023?.totalSplitAmount || 0) + (split2024?.totalSplitAmount || 0),
    ).toBeCloseTo(result.adjustedTotalAmount, 2);
  });

  test("should handle multiple amount inputs", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-01"),
      endDate: d("2024-02-01"),
      includeEndDate: false,
      amounts: [500, 300, 280], // Sum = 1080
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 1080;

    expect(result.totalDays).toBe(62);
    expect(result.aggregatedSplits).toHaveLength(2);
    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);
    expect(split2023?.totalSplitAmount).toBeCloseTo(totalAmount * (31 / 62), 2);
    expect(split2024?.totalSplitAmount).toBeCloseTo(totalAmount * (31 / 62), 2);
    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);
  });

  test("should split single amount correctly within one year (aggregated)", () => {
    const input: CalculationInput = {
      startDate: d("2023-01-15"),
      endDate: d("2023-03-15"),
      includeEndDate: false,
      amounts: [1100],
    };
    const result = calculateInvoiceSplit(input);
    expect(result.totalDays).toBe(59);
    expect(result.originalTotalAmount).toBeCloseTo(1100, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(1100, 2);
    expect(result.resultsPerAmount).toHaveLength(1);
    expect(result.aggregatedSplits).toHaveLength(1);

    expect(result.aggregatedSplits[0].year).toBe(2023);
    expect(result.aggregatedSplits[0].daysInYear).toBe(59);
    expect(result.aggregatedSplits[0].totalSplitAmount).toBeCloseTo(1100, 2);

    expect(result.resultsPerAmount[0].originalAmount).toBe(1100);
    expect(result.resultsPerAmount[0].adjustedTotalAmount).toBeCloseTo(1100, 2);
    expect(result.resultsPerAmount[0].splits[2023].splitAmount).toBeCloseTo(
      1100,
      2,
    );
  });

  test("should split multiple amounts correctly across two years (aggregated)", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-01"),
      endDate: d("2024-02-01"),
      includeEndDate: false,
      amounts: [1000, 80],
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 1080;
    const prop2023 = 31 / 62;
    const prop2024 = 31 / 62;

    expect(result.totalDays).toBe(62);
    expect(result.aggregatedSplits).toHaveLength(2);

    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);
    expect(split2023).toBeDefined();
    expect(split2024).toBeDefined();

    expect(split2023?.daysInYear).toBe(31);
    expect(split2023?.totalSplitAmount).toBeCloseTo(totalAmount * prop2023, 2);

    expect(split2024?.daysInYear).toBe(31);
    expect(split2024?.totalSplitAmount).toBeCloseTo(totalAmount * prop2024, 2);

    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(
      (split2023?.totalSplitAmount || 0) + (split2024?.totalSplitAmount || 0),
    ).toBeCloseTo(result.adjustedTotalAmount, 2);
  });

  test("should handle leap year correctly (aggregated)", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-15"),
      endDate: d("2024-03-15"),
      includeEndDate: true,
      amounts: [10000, 816],
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 10816;
    const totalDays = 92;

    expect(result.totalDays).toBe(totalDays);
    expect(result.aggregatedSplits).toHaveLength(2);

    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);
    expect(split2023).toBeDefined();
    expect(split2024).toBeDefined();

    expect(split2023?.daysInYear).toBe(17);
    expect(split2024?.daysInYear).toBe(75);

    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);

    expect(
      (split2023?.totalSplitAmount || 0) + (split2024?.totalSplitAmount || 0),
    ).toBeCloseTo(result.adjustedTotalAmount, 2);
  });

  test("should handle multiple amounts correctly (aggregated)", () => {
    const input: CalculationInput = {
      startDate: d("2023-12-01"),
      endDate: d("2024-02-01"),
      includeEndDate: false,
      amounts: [500, 300, 280],
    };
    const result = calculateInvoiceSplit(input);
    const totalAmount = 1080;
    const prop2023 = 31 / 62;
    const prop2024 = 31 / 62;

    expect(result.totalDays).toBe(62);
    expect(result.aggregatedSplits).toHaveLength(2);

    const split2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const split2024 = result.aggregatedSplits.find((s) => s.year === 2024);
    expect(split2023).toBeDefined();
    expect(split2024).toBeDefined();

    expect(split2023?.totalSplitAmount).toBeCloseTo(totalAmount * prop2023, 2);
    expect(split2024?.totalSplitAmount).toBeCloseTo(totalAmount * prop2024, 2);
    expect(result.originalTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(totalAmount, 2);
    expect(
      (split2023?.totalSplitAmount || 0) + (split2024?.totalSplitAmount || 0),
    ).toBeCloseTo(result.adjustedTotalAmount, 2);
  });

  test("should return error if end date is before start date", () => {
    const input: CalculationInput = {
      startDate: d("2024-02-01"),
      endDate: d("2023-12-01"),
      includeEndDate: false,
      amounts: [1000],
    };
    const result = calculateInvoiceSplit(input);
    expect(result.totalDays).toBe(0);
    expect(result.aggregatedSplits).toHaveLength(0);
    expect(result.resultsPerAmount).toHaveLength(0);
    expect(result.calculationSteps?.error).toContain(
      "Start date must be before",
    );
  });

  test("should return error if no amounts provided", () => {
    const input: CalculationInput = {
      startDate: d("2023-01-01"),
      endDate: d("2023-02-01"),
      includeEndDate: false,
      amounts: [],
    };
    const result = calculateInvoiceSplit(input);
    expect(result.aggregatedSplits).toHaveLength(0);
    expect(result.resultsPerAmount).toHaveLength(0);
    expect(result.calculationSteps?.error).toContain(
      "At least one amount is required",
    );
  });

  test("should split multiple amounts correctly across two years (inclusive) - detailed check", () => {
    const inputAmounts = [1000, 80];
    const inputTotal = 1080;
    const input: CalculationInput = {
      startDate: d("2023-12-15"),
      endDate: d("2024-01-15"),
      includeEndDate: true,
      amounts: inputAmounts,
    };

    const result = calculateInvoiceSplit(input);
    const prop2023 = 17 / 32;
    const prop2024 = 15 / 32;

    expect(result.totalDays).toBe(32);
    expect(result.originalTotalAmount).toBeCloseTo(inputTotal, 2);
    expect(result.adjustedTotalAmount).toBeCloseTo(inputTotal, 2);
    expect(result.resultsPerAmount).toHaveLength(2);
    expect(result.aggregatedSplits).toHaveLength(2);

    const agg2023 = result.aggregatedSplits.find((s) => s.year === 2023);
    const agg2024 = result.aggregatedSplits.find((s) => s.year === 2024);
    expect(agg2023).toBeDefined();
    expect(agg2024).toBeDefined();

    expect(agg2023?.daysInYear).toBe(17);
    expect(agg2024?.daysInYear).toBe(15);
    expect(agg2023?.totalSplitAmount).toBeCloseTo(inputTotal * prop2023, 2);
    expect(agg2024?.totalSplitAmount).toBeCloseTo(inputTotal * prop2024, 2);
    expect(
      (agg2023?.totalSplitAmount || 0) + (agg2024?.totalSplitAmount || 0),
    ).toBeCloseTo(inputTotal, 2);

    const breakdown1 = result.resultsPerAmount.find(
      (r) => r.originalAmount === 1000,
    );
    expect(breakdown1).toBeDefined();
    expect(breakdown1?.adjustedTotalAmount).toBeCloseTo(1000, 2);
    expect(breakdown1?.splits[2023]?.splitAmount).toBeCloseTo(
      1000 * prop2023,
      2,
    );
    expect(breakdown1?.splits[2024]?.splitAmount).toBeCloseTo(
      1000 * prop2024,
      2,
    );
    expect(
      (breakdown1?.splits[2023]?.splitAmount || 0) +
        (breakdown1?.splits[2024]?.splitAmount || 0),
    ).toBeCloseTo(1000, 2);

    const breakdown2 = result.resultsPerAmount.find(
      (r) => r.originalAmount === 80,
    );
    expect(breakdown2).toBeDefined();
    expect(breakdown2?.adjustedTotalAmount).toBeCloseTo(80, 2);
    expect(breakdown2?.splits[2023]?.splitAmount).toBeCloseTo(80 * prop2023, 2);
    expect(breakdown2?.splits[2024]?.splitAmount).toBeCloseTo(80 * prop2024, 2);
    expect(
      (breakdown2?.splits[2023]?.splitAmount || 0) +
        (breakdown2?.splits[2024]?.splitAmount || 0),
    ).toBeCloseTo(80, 2);
  });
});
