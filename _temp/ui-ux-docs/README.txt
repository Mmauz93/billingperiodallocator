BillingPeriodAllocator UI/UX Documentation
===========================================

This folder contains a comprehensive documentation of all UI and UX related files in the project.

Files included:
1. All CSS files from src/styles
2. All UI components from src/components/ui
3. All layout components from src/components
4. Configuration files: tailwind.config.js, postcss.config.mjs, components.json

To view and print the documentation:

1. Open the HTML file:
   - Double-click on ui-ux-documentation.html
   OR
   - Run one of these scripts:
     * _temp\open-documentation.bat (for Windows CMD)
     * bash _temp/create-ui-ux-doc.sh (to regenerate and open)

2. Print to PDF:
   - Once opened in your browser, press Ctrl+P
   - Select "Save as PDF" as the destination
   - Enable "Background graphics" in the More Settings section
   - Set margins to "Minimum" or "None"
   - Set paper size to A4 or Letter

3. Save the PDF file with a descriptive name, e.g., "BillingPeriodAllocator-UI-UX-Documentation.pdf"

All file contents are static copies from the time of generation. If you make changes to the codebase and need updated documentation, run the script again:

bash _temp/create-ui-ux-doc.sh

or 

_temp\create-ui-ux-doc.bat (for Windows) 
