import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Commands.ini Generator',
  description:
    'Create custom Commands.ini files for your Path of Titans server. Configure admin roles, command permissions, and server controls easily.',
  path: '/tools/commands-ini',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
