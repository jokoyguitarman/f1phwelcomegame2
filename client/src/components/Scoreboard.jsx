export default function Scoreboard({ scores, teamIdToName = {}, teamIdToColor = {}, compact = false }) {
  const entries = Object.entries(scores || {})
    .map(([id, score]) => ({
      id: Number(id),
      name: teamIdToName[id] || `Team ${id}`,
      color: teamIdToColor[id] || '#64748b',
      score: Number(score),
    }))
    .sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {entries.map((t, i) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
            style={{ backgroundColor: `${t.color}22`, color: t.color }}
          >
            {i === 0 && <span className="text-amber-400">👑</span>}
            {t.name}: {t.score}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center justify-between px-4 py-2 rounded-lg"
          style={{ backgroundColor: `${t.color}18` }}
        >
          <span className="font-medium" style={{ color: t.color }}>
            {i === 0 && '👑 '}{t.name}
          </span>
          <span className="text-white font-syne">{t.score}</span>
        </div>
      ))}
    </div>
  );
}
