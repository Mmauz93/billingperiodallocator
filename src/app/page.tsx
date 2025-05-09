"use client";

import { redirect } from 'next/navigation';

// Server component root page
export default function RootPage() {
  // Server-side redirect to the default language (English)
  // This is just a fallback - middleware should handle this without redirecting
  redirect('/en');
}
