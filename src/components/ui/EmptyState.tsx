import Link from 'next/link';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="border border-dashed border-divider rounded-lg p-12 text-center">
      <div className="text-text-secondary mb-4 flex justify-center">{icon}</div>
      <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-flex items-center gap-2 text-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn-primary inline-flex items-center gap-2 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
