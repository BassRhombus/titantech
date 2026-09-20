import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Community Events',
  description:
    'Upcoming Path of Titans community events. Find tournaments, migrations, and server events, or post your own.',
  path: '/events',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
