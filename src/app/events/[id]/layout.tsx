import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { pageMetadata, privateMetadata } from '@/lib/seo';

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, status: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return privateMetadata('Event Not Found');
  if (event.status !== 'active') return privateMetadata(event.title);
  return pageMetadata({
    title: event.title,
    description: event.description.slice(0, 160),
    path: `/events/${event.id}`,
  });
}

// Deleted or unknown events return a real 404 instead of a 200 "Event Not Found" page.
export default async function EventLayout({ params, children }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  return children;
}
