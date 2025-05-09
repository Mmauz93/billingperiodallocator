// Configure this page for static export
export const dynamic = 'force-static';

import Link from 'next/link';

// Simple static 404 page without client-side hooks
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-16 text-center">
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link 
          href="/en"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
} 
