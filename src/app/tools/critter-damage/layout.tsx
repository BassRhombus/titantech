import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Critter Damage Calculator',
  description:
    'Calculate hits-to-kill between any two Path of Titans creatures across all growth stages.',
  path: '/tools/critter-damage',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
