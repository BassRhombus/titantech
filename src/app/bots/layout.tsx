import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Discord Bots',
  description:
    'Custom Discord bots for Path of Titans communities. Server status, whitelist sync, tickets, and more from TitanTech.',
  path: '/bots',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
