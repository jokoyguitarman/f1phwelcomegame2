import { useState, useEffect } from 'react';
import socket from '../socket';
import Timer from '../components/Timer';

const TOTAL_SECONDS = 45;

export default function FourPicsOneWord({ questionData, setRoundState }) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (!questionData?.images) return;
    setRevealed(false);
    setCorrectAnswer('');
    setExplanation('');
    setAnswer('');
    setStartTime(Date.now());
    setSecondsLeft(TOTAL_SECONDS);
  }, [questionData?.questionId]);

  useEffect(() => {
    const onReveal = (data) => {
      if (data.answer) setCorrectAnswer(data.answer);
      if (data.explanation) setExplanation(data.explanation);
      setRevealed(true);
    };
    socket.on('question:reveal', onReveal);
    return () => socket.off('question:reveal', onReveal);
  }, []);

  useEffect(() => {
    if (revealed) return;
    const end = startTime + TOTAL_SECONDS * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startTime, revealed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || revealed || !questionData) return;
    socket.emit('answer:submit', { answer: answer.trim(), questionId: questionData.questionId });
    setAnswer('');
  };

  if (!questionData) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        Waiting for host to load a question...
      </div>
    );
  }

  const images = questionData.images || [];

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <Timer secondsLeft={secondsLeft} totalSeconds={TOTAL_SECONDS} label="Time left" />
      </div>
      <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto mb-6">
        {images.map((img, i) => (
          <div key={i} className="aspect-square rounded-lg bg-f1-card overflow-hidden">
            <img
              src={`/images/four-pics/${img}`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.background = '#334155';
              }}
            />
          </div>
        ))}
      </div>

      {revealed && (
        <div className="max-w-xl mx-auto mb-4 p-4 rounded-lg bg-f1-card border border-f1-teal/30">
          <p className="font-syne text-f1-teal font-bold uppercase">{correctAnswer}</p>
          <p className="text-slate-400 text-sm mt-1">{explanation}</p>
        </div>
      )}

      {!revealed && (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="One word..."
            className="flex-1 px-4 py-3 rounded-lg bg-f1-card border border-slate-700 text-white placeholder-slate-500 focus:border-f1-orange outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-f1-orange text-white font-syne font-semibold hover:opacity-90"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
