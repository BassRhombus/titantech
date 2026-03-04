import Link from 'next/link';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface EventWithCreator {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  serverName?: string | null;
  category: string;
  imageUrl?: string | null;
  discordLink?: string | null;
  status: string;
  creator: { username: string; avatar?: string | null; discordId: string };
}

const categoryColors: Record<string, string> = {
  tournament: 'bg-red-500/10 text-red-400',
  community: 'bg-primary/10 text-primary-light',
  roleplay: 'bg-purple-500/10 text-purple-400',
  pvp: 'bg-orange-500/10 text-orange-400',
  other: 'bg-surface text-text-secondary',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function EventCard({ event }: { event: EventWithCreator }) {
  const isPast = new Date(event.dateTime) < new Date();

  return (
    <Link href={`/events/${event.id}`} className={`card p-5 group flex flex-col ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[event.category] || categoryColors.other}`}>
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </span>
        <StatusBadge status={event.status} />
      </div>

      <h3 className="font-heading font-semibold text-text-primary mb-2 group-hover:text-primary-light transition-colors line-clamp-1">
        {event.title}
      </h3>
      <p className="text-text-secondary text-sm line-clamp-2 mb-3 flex-1">{event.description}</p>

      <div className="space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} />
          <span>{formatDate(event.dateTime)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>{formatTime(event.dateTime)}{event.endDateTime ? ` - ${formatTime(event.endDateTime)}` : ''}</span>
        </div>
        {event.serverName && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} />
            <span className="truncate">{event.serverName}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-divider flex items-center justify-between text-xs text-text-secondary">
        <span>by {event.creator.username}</span>
        {event.discordLink && (
          <ExternalLink size={13} className="text-primary-light" />
        )}
      </div>
    </Link>
  );
}
