export default function Timer({ secondsLeft, totalSeconds, label }) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  return (
    <div className="w-full">
      {label && (
        <p className="text-sm text-slate-400 mb-1">{label}</p>
      )}
      <div className="h-2 bg-f1-card rounded-full overflow-hidden">
        <div
          className="h-full bg-f1-orange transition-all duration-500 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-sm text-slate-500 mt-0.5">{secondsLeft}s</p>
    </div>
  );
}
