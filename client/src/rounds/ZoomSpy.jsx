import { useState, useEffect } from 'react';
import socket from '../socket';
import Timer from '../components/Timer';

const STAGE_DURATIONS = [30, 20, 15, 10, 5];

export default function ZoomSpy({ questionData, setRoundState }) {
  const [stage, setStage] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [answer, setAnswer] = useState('');
  const [locked, setLocked] = useState(false);
  const [correctTeam, setCorrectTeam] = useState(null);
  const [stageStart, setStageStart] = useState(Date.now());
  const [totalStages, setTotalStages] = useState(5);

  useEffect(() => {
    if (!questionData) return;
    setStage(1);
    setTotalStages(questionData.totalStages ?? questionData.stages ?? 5);
    setImageUrl(`/${questionData.folder}/stage1.jpg`);
    setStageStart(Date.now());
    setAnswer('');
    setLocked(false);
    setCorrectTeam(null);
  }, [questionData?.questionId]);

  useEffect(() => {
    const onReveal = (data) => {
      setStage(data.stage);
      setImageUrl(data.imageUrl ? `/${data.imageUrl.replace(/^\//, '')}` : imageUrl);
      setStageStart(Date.now());
    };
    const onLock = () => setLocked(true);
    const onCorrect = (data) => {
      setCorrectTeam(data);
      setLocked(true);
    };
    socket.on('question:reveal', onReveal);
    socket.on('question:lock', onLock);
    socket.on('answer:correct', onCorrect);
    return () => {
      socket.off('question:reveal', onReveal);
      socket.off('question:lock', onLock);
      socket.off('answer:correct', onCorrect);
    };
  }, [imageUrl]);

  const duration = STAGE_DURATIONS[stage - 1] ?? 5;
  const [secondsLeft, setSecondsLeft] = useState(duration);
  useEffect(() => {
    if (!stage || locked) return;
    const end = stageStart + duration * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [stage, stageStart, duration, locked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || locked || !questionData) return;
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

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="w-full max-w-2xl mb-4">
          <Timer secondsLeft={secondsLeft} totalSeconds={duration} label={`Stage ${stage} of ${totalStages}`} />
        </div>
        <div className="flex-1 w-full max-w-3xl flex items-center justify-center overflow-hidden rounded-xl bg-f1-card">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Zoom spy"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-slate-500">No image</span>
          )}
        </div>
        {correctTeam && (
          <div
            className="mt-4 px-6 py-3 rounded-lg text-white font-syne font-bold text-lg"
            style={{ backgroundColor: correctTeam.teamColor }}
          >
            {correctTeam.teamName} got it! +{correctTeam.points} pts
          </div>
        )}
      </div>

      {!locked && (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 shrink-0">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your team's guess..."
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
