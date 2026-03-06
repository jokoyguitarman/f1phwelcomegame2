import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import TeamBadge from '../components/TeamBadge';
import Scoreboard from '../components/Scoreboard';
import PassThePen from '../rounds/PassThePen';

const TEAM_NAMES = { 1: 'Blaze', 2: 'Surge', 3: 'Volt', 4: 'Nova', 5: 'Pulse' };
const TEAM_COLORS = { 1: '#FF5C1A', 2: '#00C4B4', 3: '#FFD600', 4: '#7C3AED', 5: '#F43F8E' };

export default function GameScreen() {
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [scores, setScores] = useState({});
  const [questionData, setQuestionData] = useState(null);
  const [roundState, setRoundState] = useState({});
  const teamId = Number(localStorage.getItem('factor1-teamId')) || null;
  const teamName = localStorage.getItem('factor1-teamName') || TEAM_NAMES[teamId];
  const teamColor = localStorage.getItem('factor1-teamColor') || TEAM_COLORS[teamId];

  useEffect(() => {
    const onGameStart = () => {
      setRound(1);
    };
    const onRoundStart = (data) => {
      setRound(1);
      setQuestionData(data.questionData || null);
      setRoundState({});
    };
    const onScores = (data) => {
      if (data.scores) setScores(data.scores);
    };
    const onRoundEnd = (data) => {
      if (data.scores) setScores(data.scores);
    };
    const onGameEnd = (data) => {
      navigate('/results', { state: { finalScores: data.finalScores } });
    };
    socket.on('game:start', onGameStart);
    socket.on('round:start', onRoundStart);
    socket.on('scores:update', onScores);
    socket.on('answer:correct', () => {}); // scores will be sent via scores:update or round:end
    socket.on('round:end', onRoundEnd);
    socket.on('game:end', onGameEnd);
    return () => {
      socket.off('game:start', onGameStart);
      socket.off('round:start', onRoundStart);
      socket.off('scores:update', onScores);
      socket.off('round:end', onRoundEnd);
      socket.off('game:end', onGameEnd);
    };
  }, [navigate]);

  useEffect(() => {
    socket.on('answer:correct', (data) => {
      setScores((prev) => ({
        ...prev,
        [data.teamId]: (prev[data.teamId] || 0) + (data.points || 0),
      }));
    });
    return () => socket.off('answer:correct');
  }, []);

  if (round === null && !questionData) {
    return (
      <div className="min-h-screen bg-f1-dark flex items-center justify-center">
        <p className="text-slate-400">Waiting for round to start...</p>
      </div>
    );
  }

  const showDrawSaurus = round !== null || questionData?.round === 'passThePen';

  return (
    <div className="min-h-screen bg-f1-dark flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-f1-card/80 border-b border-slate-700/50 shrink-0">
        <h1 className="font-syne text-lg text-white">Draw Saurus</h1>
        <TeamBadge name={teamName} color={teamColor} />
      </header>

      <main className="flex-1 overflow-hidden">
        {showDrawSaurus && <PassThePen questionData={questionData} roundState={roundState} setRoundState={setRoundState} />}
      </main>

      <footer className="px-4 py-2 bg-f1-card/80 border-t border-slate-700/50 shrink-0">
        <Scoreboard
          scores={scores}
          teamIdToName={TEAM_NAMES}
          teamIdToColor={TEAM_COLORS}
          compact
        />
      </footer>
    </div>
  );
}
