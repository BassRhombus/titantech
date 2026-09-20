import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Game.ini Generator',
  description:
    'Generate custom Game.ini files for your Path of Titans server. Configure growth rates, damage, spawns, and gameplay settings with an easy tool.',
  path: '/tools/game-ini',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
