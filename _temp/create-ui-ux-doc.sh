#!/bin/bash

# Create directories
mkdir -p _temp/ui-ux-docs/content

# Create the output file with a title
OUTPUT="_temp/ui-ux-docs/ui-ux-documentation.html"
cat > "$OUTPUT" << EOL
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>BillingPeriodAllocator UI/UX Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    pre { background-color: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 4px; }
    code { font-family: 'Courier New', monospace; }
    h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .file-header { background-color: #e0e0e0; padding: 10px; margin-top: 30px; border-radius: 4px 4px 0 0; }
    .file-content { margin-top: 0; border-radius: 0 0 4px 4px; }
    hr { margin: 30px 0; }
    @media print {
      pre { white-space: pre-wrap; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <h1>BillingPeriodAllocator UI/UX Documentation</h1>
  <p>Generated on $(date)</p>
  
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#theme-configuration">Theme Configuration</a></li>
    <li><a href="#css-styles">CSS Styles</a></li>
    <li><a href="#ui-components">UI Components</a></li>
    <li><a href="#layout-components">Layout Components</a></li>
    <li><a href="#all-components">All Components</a></li>
    <li><a href="#configuration-files">Configuration Files</a></li>
  </ol>
  <hr>
EOL

# Function to append file with proper HTML formatting
append_file() {
  local file=$1
  local output=$2
  local section=$3
  
  if [ ! -z "$section" ]; then
    echo "<h2 id=\"$(echo "$section" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')\" class=\"page-break\">$section</h2>" >> "$output"
  fi
  
  echo "<div class=\"file-header\">File: $file</div>" >> "$output"
  echo "<pre class=\"file-content\"><code>" >> "$output"
  
  # Replace < and > with HTML entities to prevent rendering as HTML
  cat "$file" | sed 's/</\&lt;/g; s/>/\&gt;/g' >> "$output"
  
  echo "</code></pre>" >> "$output"
  echo "<hr>" >> "$output"
}

# Theme Configuration
append_file "src/styles/themes.css" "$OUTPUT" "Theme Configuration"

# CSS Styles
echo "<h2 id=\"css-styles\" class=\"page-break\">CSS Styles</h2>" >> "$OUTPUT"
append_file "src/styles/base.css" "$OUTPUT"
append_file "src/styles/components.css" "$OUTPUT"
append_file "src/styles/forms.css" "$OUTPUT"
append_file "src/styles/animations.css" "$OUTPUT"
append_file "src/styles/calendar.css" "$OUTPUT"
append_file "src/styles/globals.css" "$OUTPUT"

# UI Components
echo "<h2 id=\"ui-components\" class=\"page-break\">UI Components</h2>" >> "$OUTPUT"
for file in src/components/ui/*.tsx; do
  append_file "$file" "$OUTPUT"
done

# Core Layout Components
echo "<h2 id=\"layout-components\" class=\"page-break\">Layout Components</h2>" >> "$OUTPUT"
append_file "src/components/theme-toggle.tsx" "$OUTPUT"
append_file "src/components/language-toggle.tsx" "$OUTPUT"
append_file "src/components/header.tsx" "$OUTPUT"
append_file "src/components/footer.tsx" "$OUTPUT"
append_file "src/components/force-dark-theme.tsx" "$OUTPUT"
append_file "src/components/custom-cookie-banner.tsx" "$OUTPUT"

# All Components (except UI which are already included)
echo "<h2 id=\"all-components\" class=\"page-break\">All Components</h2>" >> "$OUTPUT"
for file in src/components/*.tsx; do
  # Skip files already included in Layout Components
  if [[ "$file" != "src/components/theme-toggle.tsx" && 
        "$file" != "src/components/language-toggle.tsx" && 
        "$file" != "src/components/header.tsx" && 
        "$file" != "src/components/footer.tsx" && 
        "$file" != "src/components/force-dark-theme.tsx" && 
        "$file" != "src/components/custom-cookie-banner.tsx" ]]; then
    append_file "$file" "$OUTPUT"
  fi
done

# Configuration Files
echo "<h2 id=\"configuration-files\" class=\"page-break\">Configuration Files</h2>" >> "$OUTPUT"
append_file "tailwind.config.js" "$OUTPUT"
append_file "postcss.config.mjs" "$OUTPUT"
append_file "components.json" "$OUTPUT"

# Close HTML
cat >> "$OUTPUT" << EOL
</body>
</html>
EOL

echo "Documentation generated: $OUTPUT"
echo "Please open this HTML file in your browser and use the browser's print function to save as PDF."

# Try to open the HTML file
if command -v start &> /dev/null; then
  start "$OUTPUT"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$OUTPUT"
elif command -v open &> /dev/null; then
  open "$OUTPUT"
else
  echo "Unable to automatically open the file. Please open it manually."
fi 
