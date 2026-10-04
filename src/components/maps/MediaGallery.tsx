'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ImageIcon, Video } from 'lucide-react';
import type { MapImage, MapVideo } from '@/data/isla-solara';

export function VideoGallery({ videos }: { videos: MapVideo[] }) {
  if (videos.length === 0) {
    return <MediaPlaceholder icon={<Video size={28} />} label="Videos coming soon" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {videos.map((v) => (
        <figure key={v.src} className="card-static overflow-hidden">
          <video
            controls
            preload="metadata"
            poster={v.poster}
            className="w-full aspect-video bg-black"
          >
            <source src={v.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <figcaption className="p-4">
            <div className="font-heading font-semibold text-text-primary">{v.title}</div>
            {v.caption && <p className="text-text-secondary text-sm mt-1">{v.caption}</p>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ImageGallery({ images }: { images: MapImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') setIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [index, images.length]);

  if (images.length === 0) {
    return <MediaPlaceholder icon={<ImageIcon size={28} />} label="Screenshots coming soon" />;
  }

  const current = index === null ? null : images[index];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-video overflow-hidden rounded-card border border-divider bg-background-paper hover:border-primary-light/60 hover:shadow-card-hover transition-all duration-300"
            aria-label={`Open ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-left text-xs text-text-primary">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          <button
            type="button"
            onClick={() => setIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((index - 1 + images.length) % images.length);
                }}
                className="absolute left-2 sm:left-6 p-2 rounded-full bg-background-paper/70 text-text-primary hover:bg-primary transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((index + 1) % images.length);
                }}
                className="absolute right-2 sm:right-6 p-2 rounded-full bg-background-paper/70 text-text-primary hover:bg-primary transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <figure
            className="relative w-[92vw] h-[80vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" priority />
            {current.caption && (
              <figcaption className="absolute inset-x-0 -bottom-8 text-center text-sm text-text-secondary">
                {current.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}

function MediaPlaceholder({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="card-static p-10 flex flex-col items-center justify-center text-center border-dashed">
      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  );
}
