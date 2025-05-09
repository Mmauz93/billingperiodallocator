// Script to update all layout files with consistent hreflang implementation
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Find all layout.tsx files in the src directory
exec('find src/app -name "layout.tsx"', (err, stdout, stderr) => {
  if (err) {
    console.error('Error finding layout files:', err);
    return;
  }

  const layoutFiles = stdout.trim().split('\n');
  console.log(`Found ${layoutFiles.length} layout files to process.`);

  // Process each layout file
  layoutFiles.forEach(filePath => {
    processLayoutFile(filePath);
  });
});

function processLayoutFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    // Skip files that already have the import (already updated)
    if (data.includes('import { generateHreflangMetadata } from')) {
      console.log(`Skipping already updated file: ${filePath}`);
      return;
    }

    // Extract the path from the file location
    // Remove src/app/ prefix to get the relative path
    const relPath = filePath.replace(/src\/app\//, '').replace(/\/layout\.tsx$/, '');
    
    // Prepare the updated content
    let updatedContent = data;

    // Add the import statement if needed
    if (!updatedContent.includes('import { generateHreflangMetadata }')) {
      updatedContent = updatedContent.replace(
        /import\s+{\s*Metadata\s*}\s*from\s*'next';/,
        "import { Metadata } from 'next';\nimport { generateHreflangMetadata } from '@/lib/seo-utils';"
      );
    }

    // Add the alternates constant
    if (!updatedContent.includes('const alternates =')) {
      updatedContent = updatedContent.replace(
        /export\s+const\s+metadata\s*:\s*Metadata\s*=/,
        `// Generate alternates for this page\nconst alternates = generateHreflangMetadata('${relPath}');\n\nexport const metadata: Metadata =`
      );
    }

    // Replace existing alternates object with the constant
    updatedContent = updatedContent.replace(
      /alternates\s*:\s*{[^}]*canonical[^}]*languages\s*:\s*{[^}]*}[^}]*}/s,
      'alternates'
    );

    // Write the updated content back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
        return;
      }
      console.log(`Successfully updated: ${filePath}`);
    });
  });
} 
