import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Mod Manager',
  description:
    'Browse and select Path of Titans mods for your server and generate a GameUserSettings.ini with your chosen mod list.',
  path: '/tools/mod-manager',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
