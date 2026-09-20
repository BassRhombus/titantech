import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Curve Overrides Generator',
  description:
    'Build Path of Titans curve override settings with a visual editor and export them for your server configuration.',
  path: '/tools/curve-overrides',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
