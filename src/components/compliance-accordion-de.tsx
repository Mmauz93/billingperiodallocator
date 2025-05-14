"use client";

import { ComplianceAccordionShared } from "./compliance-accordion-shared";
import React from "react";

export function ComplianceAccordionDE() {
  const answer = (
    <>
      Ja, BillSplitter folgt den Grundsätzen der periodengerechten Rechnungslegung gemäss{" "}
      <span className="inline-flex whitespace-nowrap">
        <a href='https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/'
          target='_blank'
          rel='noopener noreferrer'
          className="text-primary hover:underline"
        >IFRS 15</a>
      </span>
      ,{" "}
      <span className="inline-flex whitespace-nowrap">
        <a href='https://www.gesetze-im-internet.de/hgb/'
          target='_blank'
          rel='noopener noreferrer'
          className="text-primary hover:underline"
        >HGB</a>
      </span>
      , und{" "}
      <span className="inline-flex whitespace-nowrap">
        <a href='https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de'
          target='_blank'
          rel='noopener noreferrer'
          className="text-primary hover:underline"
        >OR</a>
      </span>
      {" "}Standards, und eignet sich somit für die korrekte Erfassung von passiven und aktiven Rechnungsabgrenzungsposten in der Finanzbuchhaltung.
    </>
  );

  return (
    <ComplianceAccordionShared
      question="Ist BillSplitter konform mit Rechnungslegungsstandards?"
      answer={answer}
    />
  );
} 
