import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Submit Your Server');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
