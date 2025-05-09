import { Metadata } from 'next';

// Define the default language metadata for the root layout
export const metadata: Metadata = {
  metadataBase: new URL('https://billsplitter.siempi.ch'),
  title: {
    template: '%s | BillSplitter',
    default: 'BillSplitter',
  },
  description: 'Invoice period allocation calculator for finance professionals',
  alternates: {
    canonical: '/en/',
    languages: {
      'en': '/en/',
      'de': '/de/',
      'x-default': '/en/'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}; 
