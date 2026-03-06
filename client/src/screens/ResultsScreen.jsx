import { useLocation, useNavigate } from 'react-router-dom';

const TEAM_NAMES = { 1: 'Blaze', 2: 'Surge', 3: 'Volt', 4: 'Nova', 5: 'Pulse' };
const TEAM_COLORS = { 1: '#FF5C1A', 2: '#00C4B4', 3: '#FFD600', 4: '#7C3AED', 5: '#F43F8E' };

export default function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const finalScores = location.state?.finalScores || [];

  const podium = finalScores.slice(0, 3);
  const rest = finalScores.slice(3);

  return (
    <div className="min-h-screen bg-f1-dark p-6 font-dm flex flex-col items-center">
      <h1 className="font-syne text-3xl md:text-4xl text-white text-center mb-2">
        Thanks for playing, Factor1!
      </h1>
      <p className="text-slate-400 text-center mb-8">Final scores</p>

      <div className="flex items-end gap-4 md:gap-8 mb-8">
        {podium[1] && (
          <div className="flex flex-col items-center">
            <p className="text-slate-500 text-sm mb-1">2nd</p>
            <div
              className="w-24 md:w-32 h-24 md:h-32 rounded-t-lg flex items-center justify-center text-white font-syne font-bold text-lg"
              style={{ backgroundColor: podium[1].color }}
            >
              {podium[1].name}
            </div>
            <p className="text-white font-syne mt-2">{podium[1].score}</p>
          </div>
        )}
        {podium[0] && (
          <div className="flex flex-col items-center">
            <p className="text-amber-400 text-sm mb-1">1st</p>
            <div
              className="w-28 md:w-40 h-32 md:h-40 rounded-t-lg flex items-center justify-center text-white font-syne font-bold text-xl"
              style={{ backgroundColor: podium[0].color }}
            >
              {podium[0].name}
            </div>
            <p className="text-white font-syne mt-2">{podium[0].score}</p>
          </div>
        )}
        {podium[2] && (
          <div className="flex flex-col items-center">
            <p className="text-slate-500 text-sm mb-1">3rd</p>
            <div
              className="w-20 md:w-28 h-20 md:h-28 rounded-t-lg flex items-center justify-center text-white font-syne font-bold"
              style={{ backgroundColor: podium[2].color }}
            >
              {podium[2].name}
            </div>
            <p className="text-white font-syne mt-2">{podium[2].score}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-2 mb-8">
        {rest.map((t) => (
          <div
            key={t.teamId}
            className="flex items-center justify-between px-4 py-2 rounded-lg"
            style={{ backgroundColor: `${t.color}22` }}
          >
            <span className="font-medium" style={{ color: t.color }}>{t.name}</span>
            <span className="text-white font-syne">{t.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-lg bg-f1-orange text-white font-syne font-semibold hover:opacity-90"
      >
        Back to home
      </button>
    </div>
  );
}
