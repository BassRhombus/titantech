import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Gallery',
  description:
    'Screenshots and artwork from the Path of Titans community, submitted by players and server owners.',
  path: '/gallery',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
