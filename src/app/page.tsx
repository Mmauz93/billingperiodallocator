import { Metadata } from 'next';

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

export default function RootPage() {
  return (
    <></>
  );
}
