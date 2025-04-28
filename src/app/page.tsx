import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// No longer a client component at the page level


// Define metadata for the Home page
export const metadata: Metadata = {
  title: 'BillSplitter - Easy Bill Period Allocation',
  description: 'Split bills over time periods easily. Perfect for sharing costs or calculating periodic expenses.',
  // Add other metadata here
};

export default function HomePage() {
  redirect('/app');
}
