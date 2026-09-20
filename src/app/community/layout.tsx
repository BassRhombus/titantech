import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Community Servers',
  description:
    'Browse Path of Titans community servers. Find a server to play on or submit your own to the TitanTech server list.',
  path: '/community',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
