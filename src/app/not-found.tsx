import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-8xl font-bold text-primary-light mb-4">404</h1>
        <h2 className="font-heading text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/community" className="btn-outline inline-flex items-center gap-2">
            <Search size={16} />
            Browse Servers
          </Link>
        </div>
      </div>
    </div>
  );
}
