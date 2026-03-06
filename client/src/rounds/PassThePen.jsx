import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const COLORS = ['#000', '#fff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#78350f'];
const BRUSH_SIZES = [4, 10, 22];

export default function PassThePen({ questionData, roundState, setRoundState }) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(1);
  const [word, setWord] = useState('');
  const [drawerName, setDrawerName] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [canDraw, setCanDraw] = useState(false);
  const [correctTeam, setCorrectTeam] = useState(null);
  const teamId = Number(localStorage.getItem('factor1-teamId'));
  const isDrawingTeam = roundState?.drawingTeamId === teamId;
  const isCurrentDrawer = roundState?.playerId === socket.id;

  useEffect(() => {
    const onTurn = (data) => {
      setRoundState?.({ ...roundState, ...data });
      setWord(data.word || '');
      setDrawerName(data.pseudonym || '');
      setTimeLeft(data.timeLeft ?? 15);
      setStrokes(Array.isArray(data.strokes) ? data.strokes : []);
      setCanDraw(data.drawingTeamId === teamId && data.playerId === socket.id);
    };
    const onStroke = (data) => {
      setStrokes((prev) => [...prev, data]);
    };
    const onClear = () => setStrokes([]);
    const onCorrect = (data) => setCorrectTeam(data);
    socket.on('draw:turn', onTurn);
    socket.on('draw:stroke', onStroke);
    socket.on('draw:clear', onClear);
    socket.on('guess:correct', onCorrect);
    return () => {
      socket.off('draw:turn', onTurn);
      socket.off('draw:stroke', onStroke);
      socket.off('draw:clear', onClear);
      socket.off('guess:correct', onCorrect);
    };
  }, [teamId, roundState]);

  useEffect(() => {
    if (!canDraw || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [canDraw, timeLeft]);

  const canvas = canvasRef.current;
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);
    strokes.forEach((s) => {
      if (s.type === 'start') {
        ctx.beginPath();
        ctx.strokeStyle = s.color || '#fff';
        ctx.lineWidth = BRUSH_SIZES[s.size ?? 1] ?? 10;
        ctx.moveTo(s.x * w, s.y * h);
      } else if (s.type === 'move') {
        ctx.lineTo(s.x * w, s.y * h);
        ctx.stroke();
      }
    });
  }, [canvas, strokes]);

  const getCoords = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  const emitStroke = (type, x, y) => {
    if (!canDraw) return;
    const payload = { ...getCoords({ clientX: x, clientY: y }), type, color, size: brushSize };
    socket.emit('draw:stroke', payload);
  };

  const handleMouseDown = (e) => {
    if (!canDraw) return;
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    const payload = { x, y, type: 'start', color, size: brushSize };
    socket.emit('draw:stroke', payload);
    setStrokes((prev) => [...prev, payload]);
  };
  const handleMouseMove = (e) => {
    if (!isDrawing || !canDraw) return;
    const { x, y } = getCoords(e);
    const payload = { x, y, type: 'move', color, size: brushSize };
    socket.emit('draw:stroke', payload);
    setStrokes((prev) => [...prev, payload]);
  };
  const handleMouseUp = () => {
    if (isDrawing && canDraw) {
      const { x, y } = getCoords({ clientX: 0, clientY: 0 });
      socket.emit('draw:stroke', { x, y, type: 'end', color, size: brushSize });
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (canDraw) socket.emit('draw:clear');
  };

  const [guess, setGuess] = useState('');
  const handleGuess = (e) => {
    e.preventDefault();
    if (!guess.trim()) return;
    socket.emit('guess:submit', { guess: guess.trim() });
    setGuess('');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-4">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">
            {drawerName ? `${drawerName} is drawing` : 'Waiting...'} — {timeLeft}s
          </span>
          {isDrawingTeam && word && (
            <span className="text-f1-teal font-semibold">Word: {word}</span>
          )}
        </div>
        <div className="flex-1 min-h-0 rounded-xl bg-f1-card overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            style={{ cursor: canDraw ? 'crosshair' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        {canDraw && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="w-8 h-8 rounded-full border-2 border-slate-600"
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
            {BRUSH_SIZES.map((s, i) => (
              <button
                key={i}
                type="button"
                className="px-2 py-1 rounded bg-slate-700 text-white text-sm"
                onClick={() => setBrushSize(i)}
              >
                {i === 0 ? 'S' : i === 1 ? 'M' : 'L'}
              </button>
            ))}
            <button
              type="button"
              className="px-3 py-1 rounded bg-slate-600 text-white text-sm"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-2">
        {!isDrawingTeam && (
          <form onSubmit={handleGuess} className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Guess the word..."
              className="flex-1 px-3 py-2 rounded-lg bg-f1-card border border-slate-700 text-white text-sm"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-f1-orange text-white text-sm font-medium">
              Guess
            </button>
          </form>
        )}
        {correctTeam && (
          <div className="p-3 rounded-lg bg-f1-card border border-f1-teal/50">
            <p className="text-f1-teal font-semibold">{correctTeam.guessingTeamName} guessed it!</p>
            <p className="text-slate-400 text-sm">+3 pts guessing team, +1 pt drawing team</p>
          </div>
        )}
      </div>
    </div>
  );
}
