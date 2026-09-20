import type { Metadata } from 'next';

export const SITE_URL = 'https://titantech.party';

interface PageMetadataOptions {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/tools/game-ini" */
  path: string;
  /** Use the title as-is instead of the "%s | TitanTech" template */
  absoluteTitle?: boolean;
}

/** Metadata for a public, indexable page with a self-referencing canonical. */
export function pageMetadata({ title, description, path, absoluteTitle }: PageMetadataOptions): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'TitanTech',
      type: 'website',
    },
  };
}

/** Metadata for private pages (auth-gated, admin, forms) that must stay out of search results. */
export function privateMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
