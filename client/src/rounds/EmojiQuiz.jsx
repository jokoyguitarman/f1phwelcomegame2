import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const TEAM_NAMES = { 1: 'Blaze', 2: 'Surge', 3: 'Volt', 4: 'Nova', 5: 'Pulse' };
const TEAM_COLORS = { 1: '#FF5C1A', 2: '#00C4B4', 3: '#FFD600', 4: '#7C3AED', 5: '#F43F8E' };

export default function EmojiQuiz() {
  const [emojis, setEmojis] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timeLeft, setTimeLeft] = useState(15);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correctBanner, setCorrectBanner] = useState(null);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [myTeamAnswered, setMyTeamAnswered] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const teamId = Number(localStorage.getItem('factor1-teamId'));

  useEffect(() => {
    const onQuestion = (data) => {
      setEmojis(data.emojis);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(Math.round(data.timeMs / 1000));
      setGuess('');
      setFeedback(null);
      setCorrectBanner(null);
      setRevealedAnswer(null);
      setMyTeamAnswered(false);
      inputRef.current?.focus();
    };

    const onCorrect = (data) => {
      setCorrectBanner(data);
      if (data.teamId === teamId) {
        setMyTeamAnswered(true);
        setFeedback({ type: 'correct', message: 'Your team got it!' });
      }
    };

    const onWrong = () => {
      setFeedback({ type: 'wrong', message: 'Nope, try again!' });
      setTimeout(() => setFeedback((f) => (f?.type === 'wrong' ? null : f)), 1200);
    };

    const onTimeUp = (data) => {
      setRevealedAnswer(data.answer);
      setTimeLeft(0);
    };

    socket.on('emoji:question', onQuestion);
    socket.on('guess:correct', onCorrect);
    socket.on('guess:wrong', onWrong);
    socket.on('emoji:timeUp', onTimeUp);

    return () => {
      socket.off('emoji:question', onQuestion);
      socket.off('guess:correct', onCorrect);
      socket.off('guess:wrong', onWrong);
      socket.off('emoji:timeUp', onTimeUp);
    };
  }, [teamId]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questionNumber]);

  const handleGuess = (e) => {
    e.preventDefault();
    if (!guess.trim() || myTeamAnswered || timeLeft <= 0) return;
    socket.emit('guess:submit', { guess: guess.trim() });
    setGuess('');
  };

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-amber-400' : 'text-f1-teal';
  const timerProgress = questionNumber > 0 ? (timeLeft / 15) * 100 : 100;

  if (!emojis && !revealedAnswer) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-lg">Get ready...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-6 gap-6">
      {/* Progress bar */}
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-sm font-medium">
            Question {questionNumber} / {totalQuestions}
          </span>
          <span className={`font-syne font-bold text-xl ${timerColor}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timerProgress}%`,
              backgroundColor: timeLeft <= 5 ? '#f87171' : timeLeft <= 10 ? '#fbbf24' : '#00C4B4',
            }}
          />
        </div>
      </div>

      {/* Emoji display */}
      <div className="flex items-center justify-center min-h-[140px]">
        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl select-none leading-tight text-center">
          {emojis}
        </span>
      </div>

      {/* Guess the movie label */}
      <p className="text-slate-400 text-sm tracking-widest uppercase">Guess the movie</p>

      {/* Input area */}
      {!myTeamAnswered && timeLeft > 0 && !revealedAnswer && (
        <form onSubmit={handleGuess} className="w-full max-w-md flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type your answer..."
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl bg-f1-card border border-slate-600 text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-f1-teal focus:ring-1 focus:ring-f1-teal"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-f1-orange text-white font-syne font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Guess
          </button>
        </form>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`px-4 py-2 rounded-lg text-center font-semibold ${
            feedback.type === 'correct'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Team answered waiting state */}
      {myTeamAnswered && timeLeft > 0 && !revealedAnswer && (
        <p className="text-emerald-400 font-medium">Waiting for other teams...</p>
      )}

      {/* Correct guess banner */}
      {correctBanner && correctBanner.teamId !== teamId && (
        <div className="px-4 py-2 rounded-lg bg-f1-card border border-slate-600 text-center">
          <span style={{ color: TEAM_COLORS[correctBanner.teamId] }} className="font-semibold">
            {correctBanner.teamName}
          </span>
          <span className="text-slate-300"> got it right! </span>
          <span className="text-slate-500 text-sm">({correctBanner.playerName})</span>
        </div>
      )}

      {/* Revealed answer on time-up */}
      {revealedAnswer && (
        <div className="px-6 py-3 rounded-xl bg-f1-card border border-slate-600 text-center">
          <p className="text-slate-400 text-sm mb-1">The answer was</p>
          <p className="text-white font-syne font-bold text-2xl capitalize">{revealedAnswer}</p>
        </div>
      )}
    </div>
  );
}
