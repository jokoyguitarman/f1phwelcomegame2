export default function PlayerChip({ name, color }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color: color }}
    >
      {name}
    </span>
  );
}
