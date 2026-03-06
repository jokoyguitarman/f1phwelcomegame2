import { Routes, Route, Navigate } from 'react-router-dom';
import JoinScreen from './screens/JoinScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import HostDashboard from './host/HostDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinScreen />} />
      <Route path="/lobby" element={<LobbyScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="/host" element={<HostDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
