import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: ChangeFrequency }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/community', priority: 0.9, changeFrequency: 'daily' },
  { path: '/events', priority: 0.8, changeFrequency: 'daily' },
  { path: '/gallery', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/suggestions', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/bots', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/game-ini', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tools/commands-ini', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/mod-manager', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/tools/curve-overrides', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/critter-damage', priority: 0.7, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const events = await prisma.event.findMany({
      where: { status: 'active' },
      select: { id: true, updatedAt: true },
      orderBy: { dateTime: 'desc' },
      take: 500,
    });
    for (const e of events) {
      entries.push({
        url: `${SITE_URL}/events/${e.id}`,
        lastModified: e.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch {
    // Database unavailable: still serve the static portion of the sitemap.
  }

  return entries;
}
