# Invoice Split Calculation Tool

## 📄 Project Overview

The Invoice Split Calculation Tool is a web-based application designed to assist users in accurately allocating invoice amounts across different fiscal years. This is particularly useful when an invoice spans multiple years, ensuring precise financial reporting and compliance.

## ✨ Technology Stack

-   **Framework:** Next.js (React)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** Shadcn/ui (to be added)
-   **State Management:** Zustand (if needed)
-   **Date Handling:** date-fns
-   **PDF Export:** react-pdf (or similar)
-   **Excel Export:** SheetJS (or similar)

## ✅ Acceptance Criteria

- [ ] Users can specify the start and end dates of the invoiced period.
- [ ] Users have the option to include or exclude the end date in calculations (+/-1 day).
- [ ] Users can enter either:
  - [ ] The total invoice amount (including VAT), or
  - [ ] Separately provide the net amount and VAT amount.
- [ ] The calculation accurately splits the invoice amounts proportionally based on the number of days in each year.
- [ ] Leap years and differing month lengths are correctly handled.
- [ ] Results clearly display allocated net, VAT, and total amounts per year.
- [ ] Users can export results as a PDF or Excel document.
- [ ] The tool is accessible, complying with WCAG 2.1 standards.
- [ ] The interface supports multiple languages and regional date and number formats.
- [ ] Users can view the detailed calculation steps (mathematical solution).
- [ ] Users can easily copy the detailed calculation for their records.

## 🛠️ Tasks
- 

### 2. Design Phase

- [ ] Create wireframes and prototypes incorporating inclusive/exclusive end-date selections.
- [ ] Create a simple nice, modern looking UI with a form for the user to input the data incl darkmode.

### 3. Frontend Development

- [ ] Set up React.js application structure.
- [ ] Develop input forms for:
  - [ ] Start and end dates.
  - [ ] Include/exclude end date option.
  - [ ] Total/net/VAT amounts.
- [ ] Integrate date-picker components.
- [ ] Implement robust form validation.
- [ ] users should be able to add experience/improvements or questions, so that the tool can be improved over time. (feedback) I want to reicive the feedback to my email (mauro@siempi.ch).
- [ ] all legal required information should be displayed in the footer.


### 4. Calculation Engine Development

- [ ] Implement modular logic to calculate proportional splits accurately.
- [ ] Handle leap years and precision decimal calculations.
- [ ] Generate detailed calculation steps for user transparency.

### 5. Result Display and Export

- [ ] Develop clear and responsive result presentation.
- [ ] Implement export functionality for PDF and Excel formats.
- [ ] Provide an option to copy detailed calculations easily.

### 6. Accessibility and Internationalization

- [ ] Ensure compliance with accessibility standards (WCAG 2.1).
- [ ] Integrate internationalization support for multiple languages and regional formats.

### 7. Testing and Validation


### 8. Deployment and Monitoring


## 📂 File Structure

```
billingperiodallocator/
├── app/                  # Next.js application code
│   ├── public/           # Static assets
│   │   ├── src/          # Application source code
│   │   │   ├── app/      # App Router pages and layouts
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── lib/          # Utility functions, calculation logic
│   │   │   └── styles/       # Global styles
│   │   ├── next.config.mjs   # Next.js configuration
│   │   ├── package.json      # Project dependencies
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   └── ...               # Other configuration files
│   ├── project.md            # This file (project overview, tasks)
│   └── README.md             # Project README (to be created)
```

