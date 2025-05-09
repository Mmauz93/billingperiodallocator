import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Seite nicht gefunden</h2>
      <p className="mb-8 text-gray-600 max-w-md">
        Die gesuchte Seite existiert nicht. Sie wurde möglicherweise verschoben, gelöscht oder hat nie existiert.
      </p>
      <Link 
        href="/"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
} 
