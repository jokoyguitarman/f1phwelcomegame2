import { useState, useEffect } from 'react';
import socket from '../socket';
import Scoreboard from '../components/Scoreboard';

const TEAM_NAMES = { 1: 'Blaze', 2: 'Surge', 3: 'Volt', 4: 'Nova', 5: 'Pulse' };
const TEAM_COLORS = { 1: '#FF5C1A', 2: '#00C4B4', 3: '#FFD600', 4: '#7C3AED', 5: '#F43F8E' };
const MIN_PLAYERS = 1;

export default function HostDashboard() {
  const [teams, setTeams] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [phase, setPhase] = useState('lobby');
  const [scores, setScores] = useState({});
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentEmojis, setCurrentEmojis] = useState('');
  const [answerFeed, setAnswerFeed] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.emit('host:setHost');
    const onConfirm = () => setIsHost(true);
    const onErr = (data) => setError(data.message || 'Error');
    socket.on('host:confirmed', onConfirm);
    socket.on('host:error', onErr);
    return () => {
      socket.off('host:confirmed', onConfirm);
      socket.off('host:error', onErr);
    };
  }, []);

  useEffect(() => {
    const onLobby = (data) => {
      if (data.teams) setTeams(data.teams);
      if (typeof data.playerCount === 'number') setPlayerCount(data.playerCount);
    };
    const onStart = (data) => {
      setPhase(data.phase || 'round1');
    };
    const onRoundStart = (data) => {
      setPhase('round1');
      setTotalQuestions(data.totalQuestions || 10);
      setAnswerFeed([]);
    };
    const onQuestion = (data) => {
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setCurrentEmojis(data.emojis);
    };
    const onCorrect = (data) => {
      setAnswerFeed((prev) => [
        ...prev.slice(-19),
        { type: 'correct', teamName: data.teamName, playerName: data.playerName, q: data.questionNumber },
      ]);
    };
    const onTimeUp = (data) => {
      setAnswerFeed((prev) => [
        ...prev.slice(-19),
        { type: 'timeup', answer: data.answer, q: data.questionNumber },
      ]);
    };
    const onScores = (d) => d.scores && setScores(d.scores);

    socket.on('lobby:update', onLobby);
    socket.on('game:start', onStart);
    socket.on('round:start', onRoundStart);
    socket.on('emoji:question', onQuestion);
    socket.on('guess:correct', onCorrect);
    socket.on('emoji:timeUp', onTimeUp);
    socket.on('scores:update', onScores);

    return () => {
      socket.off('lobby:update', onLobby);
      socket.off('game:start', onStart);
      socket.off('round:start', onRoundStart);
      socket.off('emoji:question', onQuestion);
      socket.off('guess:correct', onCorrect);
      socket.off('emoji:timeUp', onTimeUp);
      socket.off('scores:update', onScores);
    };
  }, []);

  useEffect(() => {
    const onGameEnd = () => setPhase('results');
    socket.on('game:end', onGameEnd);
    return () => socket.off('game:end', onGameEnd);
  }, []);

  const handleStartGame = () => {
    setError('');
    socket.emit('host:startGame');
  };
  const handleNextQuestion = () => {
    setError('');
    socket.emit('host:nextQuestion');
  };
  const handleEndRound = () => {
    socket.emit('host:endRound');
  };
  const handleAwardPoints = (teamId, delta) => {
    socket.emit('host:awardPoints', { teamId, points: delta });
  };

  return (
    <div className="min-h-screen bg-f1-dark p-4 md:p-6 font-dm">
      <header className="mb-6">
        <h1 className="font-syne text-2xl text-white">Factor1 — Host</h1>
        {!isHost && <p className="text-slate-500 text-sm">Claiming host...</p>}
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          {phase === 'lobby' && (
            <div className="rounded-xl bg-f1-card p-4 border border-slate-700/50">
              <h2 className="font-syne text-lg text-white mb-2">Lobby</h2>
              <p className="text-slate-400 mb-4">
                {playerCount} player{playerCount !== 1 ? 's' : ''} joined
                {playerCount < MIN_PLAYERS && ` (min ${MIN_PLAYERS} to start)`}
              </p>
              <div className="flex flex-wrap gap-2">
                {teams.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: `${t.color}22`, color: t.color }}
                  >
                    {t.name}: {t.pseudonyms?.length ?? 0}
                  </span>
                ))}
              </div>
              <button
                onClick={handleStartGame}
                disabled={playerCount < MIN_PLAYERS}
                className="mt-4 px-6 py-2 rounded-lg bg-f1-orange text-white font-syne font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </button>
            </div>
          )}

          {phase === 'round1' && (
            <>
              <div className="rounded-xl bg-f1-card p-4 border border-slate-700/50">
                <h2 className="font-syne text-lg text-white mb-2">Emoji Movie Quiz</h2>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-slate-400 text-sm">
                    Question {questionNumber} / {totalQuestions}
                  </span>
                  {currentEmojis && (
                    <span className="text-3xl">{currentEmojis}</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-lg bg-f1-teal text-white font-medium"
                  >
                    Skip / Next Question
                  </button>
                  <button
                    onClick={handleEndRound}
                    className="px-4 py-2 rounded-lg bg-slate-600 text-white font-medium"
                  >
                    End Game
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-f1-card p-4 border border-slate-700/50 max-h-48 overflow-y-auto">
                <h3 className="font-syne text-white mb-2">Activity feed</h3>
                {answerFeed.length === 0 && (
                  <p className="text-slate-500 text-sm">No activity yet</p>
                )}
                {answerFeed.map((a, i) => (
                  <p key={i} className="text-sm">
                    {a.type === 'correct' && (
                      <span className="text-green-400">
                        Q{a.q}: {a.teamName} got it! ({a.playerName})
                      </span>
                    )}
                    {a.type === 'timeup' && (
                      <span className="text-slate-500">
                        Q{a.q}: Time's up — answer was "{a.answer}"
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </>
          )}

          {phase === 'results' && (
            <div className="rounded-xl bg-f1-card p-4 border border-slate-700/50">
              <p className="text-white">Game over! Check the final scores.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-f1-card p-4 border border-slate-700/50 h-fit">
          <h2 className="font-syne text-lg text-white mb-4">Scoreboard</h2>
          <Scoreboard
            scores={scores}
            teamIdToName={TEAM_NAMES}
            teamIdToColor={TEAM_COLORS}
          />
          {phase === 'round1' && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-sm mb-2">Award points</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((id) => (
                  <span key={id} className="flex items-center gap-1">
                    <button
                      type="button"
                      className="w-8 h-8 rounded bg-slate-700 text-white text-lg leading-none"
                      onClick={() => handleAwardPoints(id, 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded bg-slate-700 text-white text-lg leading-none"
                      onClick={() => handleAwardPoints(id, -1)}
                    >
                      −
                    </button>
                    <span className="text-sm" style={{ color: TEAM_COLORS[id] }}>{TEAM_NAMES[id]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
