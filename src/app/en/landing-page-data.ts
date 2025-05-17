import { FaqItem } from "@/components/faq-section";

export const heroTitle = "Automated Invoice Split Calculator";
export const heroSubtitle =
  "BillSplitter helps you split invoices across fiscal years accurately and effortlessly. Built for finance professionals and businesses. Fast, simple, precise.";
export const feature1Title = "Accurate Period Allocation";
export const feature1Desc =
  "Automatically calculate how much of an invoice belongs to each fiscal year — no more manual errors.";
export const feature2Title = "Prepaid Expenses & Deferred Revenue";
export const feature2Desc =
  "Supports allocation aligned with IFRS 15, HGB, and OR standards for clean, compliant bookkeeping.";
export const feature3Title = "No Login. No Data Storage.";
export const feature3Desc =
  "Use BillSplitter instantly without creating an account. Your data stays secure and private.";
export const ctaTitle = "Start Splitting Invoices Now";
export const ctaSubtitle =
  "Launch the calculator and automate your revenue and expense allocations within seconds.";

export const demoEndDate = "2025-04-29";
export const demoStartDate = "2024-11-01";
export const demoAmount = "5000";
export const demoIncludeEndDate = "true";
export const demoSplitPeriod = "yearly" as "yearly" | "quarterly" | "monthly";

export const faqData: FaqItem[] = [
  {
    question: "How does BillSplitter calculate invoice allocations?",
    answer:
      "BillSplitter calculates proportional allocations based on the exact number of days in each fiscal period. It divides the total invoice amount by the number of days in the service period, then multiplies by the days in each fiscal year or period.",
  },
  {
    question: "Do I need to create an account to use BillSplitter?",
    answer:
      "No, BillSplitter is completely account-free. You can use it instantly without signing up, creating a password, or providing any personal information. Your data is processed locally and never stored on our servers.",
  },
  {
    question: "Is BillSplitter compliant with accounting standards?",
    answer:
      "Yes, BillSplitter follows the principles of accrual accounting in accordance with <a href='https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>IFRS 15</a>, <a href='https://www.gesetze-im-internet.de/hgb/' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>HGB</a>, and <a href='https://www.fedlex.admin.ch/eli/cc/27/317_321_377/en' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline whitespace-nowrap'>OR</a> standards, making it suitable for proper recognition of deferred revenue and prepaid expenses in financial statements.",
  },
  {
    question: "Can I split invoices by monthly, quarterly, or yearly periods?",
    answer:
      "Yes, BillSplitter supports multiple splitting options. You can allocate invoices across yearly, quarterly, or monthly periods depending on your accounting and reporting needs.",
  },
  {
    question: "How accurate are the calculations?",
    answer:
      "BillSplitter provides highly accurate calculations down to the day, with proper rounding to the decimal place of your choice. Any minor rounding differences are automatically adjusted to ensure the total always matches your input amount.",
  },
];
