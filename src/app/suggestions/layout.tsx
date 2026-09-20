import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Suggestions',
  description:
    'Suggest and vote on new features and tools for TitanTech, the Path of Titans community hub.',
  path: '/suggestions',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
