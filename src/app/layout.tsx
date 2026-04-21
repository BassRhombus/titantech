import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShutdownBanner } from '@/components/ShutdownBanner';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://titantech.party'),
  title: {
    default: 'TitanTech - Path of Titans Community Hub',
    template: '%s | TitanTech',
  },
  description:
    'The community hub for Path of Titans server owners. Browse servers, share events, and use powerful configuration tools.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TitanTech - Path of Titans Community Hub',
    description:
      'The community hub for Path of Titans server owners. Browse servers, share events, and use powerful configuration tools.',
    siteName: 'TitanTech',
    type: 'website',
    url: 'https://titantech.party',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-background text-text-primary font-sans min-h-screen flex flex-col">
        <Providers>
          <ShutdownBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
