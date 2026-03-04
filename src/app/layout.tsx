import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TitanTech - Path of Titans Community Hub',
    template: '%s | TitanTech',
  },
  description:
    'The community hub for Path of Titans server owners. Browse servers, share events, and use powerful configuration tools.',
  openGraph: {
    title: 'TitanTech - Path of Titans Community Hub',
    description:
      'The community hub for Path of Titans server owners. Browse servers, share events, and use powerful configuration tools.',
    siteName: 'TitanTech',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-background text-text-primary font-sans min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
