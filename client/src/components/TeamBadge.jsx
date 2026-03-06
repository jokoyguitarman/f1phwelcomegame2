export default function TeamBadge({ name, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color || '#475569' }}
    >
      <span className="w-2 h-2 rounded-full bg-white/80" />
      {name || 'Team'}
    </span>
  );
}
