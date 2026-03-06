import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { Link } from 'react-router-dom';

export default function JoinScreen() {
  const navigate = useNavigate();
  const [pseudonym, setPseudonym] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trim = pseudonym.trim();
    if (!trim) {
      setError('Please enter a display name.');
      return;
    }
    if (trim.length > 20) {
      setError('Display name must be 20 characters or less.');
      return;
    }
    setLoading(true);
    socket.emit('player:join', { pseudonym: trim, email: email.trim() || undefined });
  };

  useEffect(() => {
    const onSuccess = (data) => {
      setLoading(false);
      if (data.playerId) localStorage.setItem('factor1-playerId', data.playerId);
      if (data.teamId) localStorage.setItem('factor1-teamId', String(data.teamId));
      if (data.teamName) localStorage.setItem('factor1-teamName', data.teamName);
      if (data.teamColor) localStorage.setItem('factor1-teamColor', data.teamColor);
      navigate('/lobby', { state: { ...data, providedEmail: !!email.trim() } });
    };
    const onErr = (data) => {
      setLoading(false);
      setError(data.message || 'Something went wrong.');
    };
    socket.on('join:success', onSuccess);
    socket.on('join:error', onErr);
    return () => {
      socket.off('join:success', onSuccess);
      socket.off('join:error', onErr);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-f1-dark flex flex-col items-center justify-center p-6 font-dm">
      <div className="w-full max-w-md">
        <h1 className="font-syne text-3xl md:text-4xl font-bold text-white text-center mb-1">
          Factor1
        </h1>
        <p className="text-f1-orange text-center text-lg mb-8">Let's play.</p>
        <h2 className="font-syne text-xl text-white mb-6 text-center">Enter the game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Display name (required)</label>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              maxLength={20}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-f1-card border border-slate-700 text-white placeholder-slate-500 focus:border-f1-orange focus:ring-1 focus:ring-f1-orange outline-none"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Email (optional) — get a rejoin link if you close this tab
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-f1-card border border-slate-700 text-white placeholder-slate-500 focus:border-f1-orange focus:ring-1 focus:ring-f1-orange outline-none"
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-f1-orange text-white font-syne font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Joining…' : 'Join the Game'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Are you the host?{' '}
          <Link to="/host" className="text-f1-teal hover:underline">Go to host dashboard</Link>
        </p>
      </div>
    </div>
  );
}
