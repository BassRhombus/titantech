import { privateMetadata } from '@/lib/seo';

export const metadata = privateMetadata('Edit Event');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
