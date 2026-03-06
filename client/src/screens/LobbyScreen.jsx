import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket';
import TeamBadge from '../components/TeamBadge';
import PlayerChip from '../components/PlayerChip';
import Scoreboard from '../components/Scoreboard';

export default function LobbyScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState(location.state?.allTeams || []);
  const [playerCount, setPlayerCount] = useState(() =>
    (location.state?.allTeams || []).reduce((acc, t) => acc + (t.pseudonyms?.length || t.playerIds?.length || 0), 0)
  );
  const playerTeamId = location.state?.teamId;
  const playerTeamName = location.state?.teamName;
  const playerTeamColor = location.state?.teamColor;
  const providedEmail = location.state?.providedEmail;

  useEffect(() => {
    if (!playerTeamId && !location.state?.allTeams?.length) {
      const tid = localStorage.getItem('factor1-teamId');
      if (!tid) {
        navigate('/', { replace: true });
        return;
      }
    }
  }, [playerTeamId, location.state, navigate]);

  useEffect(() => {
    const onLobby = (data) => {
      if (data.teams) setTeams(data.teams);
      if (typeof data.playerCount === 'number') setPlayerCount(data.playerCount);
    };
    const onStart = () => navigate('/game');
    socket.on('lobby:update', onLobby);
    socket.on('game:start', onStart);
    if (location.state?.allTeams) {
      setTeams(location.state.allTeams);
      setPlayerCount(location.state.allTeams.reduce((acc, t) => acc + (t.pseudonyms?.length || t.playerIds?.length || 0), 0));
    }
    return () => {
      socket.off('lobby:update', onLobby);
      socket.off('game:start', onStart);
    };
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-f1-dark p-4 md:p-6 font-dm">
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-syne text-xl text-white">Factor1</h1>
        {playerTeamId && (
          <TeamBadge name={playerTeamName} color={playerTeamColor} />
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl bg-f1-card border border-slate-700/50 overflow-hidden"
            >
              <div
                className="h-2"
                style={{ background: team.color }}
              />
              <div className="p-4">
                <h3 className="font-syne font-semibold text-white mb-2">{team.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {(team.pseudonyms || []).map((name, i) => (
                    <PlayerChip key={i} name={name} color={team.color} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-f1-orange border-t-transparent animate-spin mb-4" />
          <p className="text-slate-300 mb-2">Waiting for host to start the game...</p>
          <p className="text-2xl font-syne text-white">{playerCount} joined</p>
          {providedEmail && (
            <p className="text-slate-500 text-sm mt-4">We've noted your email. You can rejoin at any time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
