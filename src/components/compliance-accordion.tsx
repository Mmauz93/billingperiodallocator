"use client";

import { ComplianceAccordionShared } from "./compliance-accordion-shared";
import React from "react";

export function ComplianceAccordion() {
  const answer = (
    <>
      Yes, BillSplitter follows the principles of accrual accounting in
      accordance with{" "}
      <span className="inline-flex whitespace-nowrap">
        <a
          href="https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          IFRS 15
        </a>
      </span>
      ,{" "}
      <span className="inline-flex whitespace-nowrap">
        <a
          href="https://www.gesetze-im-internet.de/hgb/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          HGB
        </a>
      </span>
      , and{" "}
      <span className="inline-flex whitespace-nowrap">
        <a
          href="https://www.fedlex.admin.ch/eli/cc/27/317_321_377/en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          OR
        </a>
      </span>{" "}
      standards, making it suitable for proper recognition of deferred revenue
      and prepaid expenses in financial statements.
    </>
  );

  return (
    <ComplianceAccordionShared
      question="Is BillSplitter compliant with accounting standards?"
      answer={answer}
    />
  );
}
