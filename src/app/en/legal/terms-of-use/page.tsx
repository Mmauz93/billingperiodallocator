// Import the new client component
import TermsOfUseClient from './terms-of-use-client';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';

// Server Component: Fetches data and passes it to the Client Component
export default async function TermsOfUsePageEN() {
  const lang = 'en'; // Explicitly 'en' for this file
  let termsContent = '';

  try {
    // Construct the absolute path to the markdown file in the public directory
    const filePath = path.join(process.cwd(), 'public', `terms-of-use.md`);
    const content = await fs.readFile(filePath, 'utf-8');

    termsContent = content
        .replace(/^# .*$/m, '') // Remove the first heading
        .replace(/^Last updated on.*$/m, '') // Remove the date line for English
        .trim();
    } catch (error) {
    console.error('Error loading terms of use server-side:', error);
    termsContent = 'Failed to load terms of use. Please try again later.';
  }

  // Render the client component, passing the fetched content
  return <TermsOfUseClient initialContent={termsContent} initialLang={lang} />;
}
