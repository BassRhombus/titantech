const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  active: 'bg-primary/10 text-primary-light border-primary/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-accent/10 text-accent-light border-accent/20',
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-surface text-text-secondary border-divider';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
