import { Metadata } from 'next';

// Server-side metadata with hreflang annotations
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://billsplitter.siempi.ch/en/',
    languages: {
      'en': 'https://billsplitter.siempi.ch/en/',
      'de': 'https://billsplitter.siempi.ch/de/',
      'x-default': 'https://billsplitter.siempi.ch/en/',
    },
  },
};

// Root page. This will never actually render due to middleware redirects
export default function RootPage() {
  return (
    // Return empty fragment as middleware handles the redirection
    <></>
  );
}
