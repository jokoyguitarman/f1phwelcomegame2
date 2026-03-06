import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  getState,
  getRoomId,
  resetState,
  setPhase,
  setHost,
  isHost,
  addPlayer,
  removePlayer,
  getPlayer,
  getTeamsForLobby,
  addScore,
  setCurrentRound,
  setCurrentQuestion,
  getRoundState,
  setRoundState,
  getFinalScores,
  getScores,
} from './gameState.js';
import { assignTeam } from './teamAssignment.js';
import {
  passThePenWords,
  DRAW_TURN_MS,
  GUESS_CORRECT_GUESSING_TEAM_POINTS,
  GUESS_CORRECT_DRAWING_TEAM_POINTS,
  checkGuess,
  shuffleArray,
} from './rounds/passThePen.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const ROOM = getRoomId();
const MIN_PLAYERS_TO_START = 1;

function broadcast(event, payload) {
  io.to(ROOM).emit(event, payload);
}

function broadcastExcept(socketId, event, payload) {
  io.to(ROOM).except(socketId).emit(event, payload);
}

function getUsedPseudonyms() {
  return new Set(Object.values(getState().players).map((p) => p.pseudonym?.toLowerCase()));
}

function getTeamById(teamId) {
  const state = getState();
  const t = state.teams[teamId];
  return t ? { id: teamId, name: t.name, color: t.color } : null;
}

io.on('connection', (socket) => {
  socket.join(ROOM);
  const state = getState();

  socket.on('player:join', ({ pseudonym, email }) => {
    const trimmed = String(pseudonym || '').trim();
    if (!trimmed || trimmed.length > 20) {
      socket.emit('join:error', { message: 'Please enter a display name (max 20 characters).' });
      return;
    }
    const used = getUsedPseudonyms();
    if (used.has(trimmed.toLowerCase())) {
      socket.emit('join:error', { message: 'That name is already taken. Choose another.' });
      return;
    }
    const teamId = assignTeam();
    const team = getTeamById(teamId);
    addPlayer(socket.id, { pseudonym: trimmed, email: email || null, teamId });
    socket.emit('join:success', {
      playerId: socket.id,
      teamId,
      teamName: team.name,
      teamColor: team.color,
      allTeams: getTeamsForLobby(),
    });
    broadcastExcept(socket.id, 'lobby:update', {
      teams: getTeamsForLobby(),
      playerCount: Object.keys(getState().players).length,
    });
  });

  socket.on('host:startGame', () => {
    if (!isHost(socket.id)) return;
    const state = getState();
    const count = Object.keys(state.players).length;
    if (count < MIN_PLAYERS_TO_START) {
      socket.emit('host:error', { message: `Need at least ${MIN_PLAYERS_TO_START} players to start.` });
      return;
    }
    setHost(socket.id);
    setPhase('round1');
    setCurrentRound(1);
    setCurrentQuestion(null);
    setRoundState({});
    broadcast('game:start', { phase: 'round1' });
    startPassThePenRound();
  });

  socket.on('host:nextQuestion', () => {
    if (!isHost(socket.id)) return;
    const state = getState();
    if (state.phase === 'round1') {
      setRoundState({ ...getRoundState(), guessed: true });
      nextPassThePenTurn();
    }
  });

  socket.on('host:endRound', () => {
    if (!isHost(socket.id)) return;
    const state = getState();
    const scores = getScores();
    broadcast('round:end', { scores });
    if (state.phase === 'round1') {
      setPhase('results');
      broadcast('game:end', { finalScores: getFinalScores() });
    }
  });

  function startPassThePenRound() {
    const state = getState();
    const teamIds = [1, 2, 3, 4, 5];
    const order = shuffleArray(teamIds);
    const words = [...passThePenWords];
    shuffleArray(words);
    setRoundState({
      drawOrder: order,
      drawWordIndex: 0,
      words,
      drawerIndexByTeam: {},
      currentDrawTeamIndex: 0,
      strokes: [],
      guessed: false,
      drawingTeamId: order[0],
    });
    broadcast('round:start', { round: 1, questionData: { round: 'passThePen' } });
    nextPassThePenTurn();
  }

  function nextPassThePenTurn() {
    const state = getState();
    if (state.phase !== 'round1') return;
    const rs = state.roundState;
    const order = rs.drawOrder || [1, 2, 3, 4, 5];
    const words = rs.words || passThePenWords;
    let wordIndex = rs.drawWordIndex ?? 0;
    let teamIndex = rs.currentDrawTeamIndex ?? 0;

    if (rs.guessed || wordIndex >= words.length) {
      teamIndex++;
      wordIndex++;
      if (teamIndex >= order.length) {
        setPhase('results');
        broadcast('game:end', { finalScores: getFinalScores() });
        return;
      }
      setRoundState({
        ...rs,
        drawWordIndex: wordIndex,
        currentDrawTeamIndex: teamIndex,
        drawingTeamId: order[teamIndex],
        strokes: [],
        guessed: false,
        drawerIndexByTeam: {},
      });
    }

    const drawingTeamId = order[teamIndex];
    const word = words[wordIndex];
    const drawerIds = (getState().teams[drawingTeamId]?.playerIds || []);
    const drawerOrder = shuffleArray(drawerIds);
    const drawerIndex = 0;
    const currentDrawerId = drawerOrder[drawerIndex];
    const drawerPlayer = getPlayer(currentDrawerId);

    setRoundState({
      ...getRoundState(),
      passThePenDrawerOrder: drawerOrder,
      passThePenDrawerIndex: drawerIndex,
      passThePenWord: word,
      passThePenTurnStart: Date.now(),
    });

    broadcast('draw:turn', {
      playerId: currentDrawerId,
      pseudonym: drawerPlayer?.pseudonym ?? 'Someone',
      timeLeft: DRAW_TURN_MS / 1000,
      drawingTeamId,
      word,
      strokes: rs.strokes || [],
    });
    setTimeout(() => passThePenRotateDrawer(), DRAW_TURN_MS);
  }

  function passThePenRotateDrawer() {
    const state = getState();
    if (state.phase !== 'round1') return;
    const rs = state.roundState;
    if (rs.guessed) return;
    const drawerOrder = rs.passThePenDrawerOrder || [];
    let drawerIndex = (rs.passThePenDrawerIndex ?? 0) + 1;
    if (drawerIndex >= drawerOrder.length) {
      setRoundState({ ...rs, guessed: true });
      nextPassThePenTurn();
      return;
    }
    const currentDrawerId = drawerOrder[drawerIndex];
    const drawerPlayer = getPlayer(currentDrawerId);
    setRoundState({ ...rs, passThePenDrawerIndex: drawerIndex, passThePenTurnStart: Date.now() });
    broadcast('draw:turn', {
      playerId: currentDrawerId,
      pseudonym: drawerPlayer?.pseudonym ?? 'Someone',
      timeLeft: DRAW_TURN_MS / 1000,
      drawingTeamId: rs.drawingTeamId,
      word: rs.passThePenWord,
      strokes: rs.strokes || [],
    });
    setTimeout(() => passThePenRotateDrawer(), DRAW_TURN_MS);
  }

  socket.on('draw:stroke', (data) => {
    const player = getPlayer(socket.id);
    if (!player) return;
    const state = getState();
    if (state.phase !== 'round1') return;
    const rs = state.roundState;
    if (rs.drawingTeamId !== player.teamId) return;
    const drawerOrder = rs.passThePenDrawerOrder || [];
    const currentIndex = rs.passThePenDrawerIndex ?? 0;
    if (drawerOrder[currentIndex] !== socket.id) return;
    const strokes = [...(rs.strokes || []), data];
    setRoundState({ ...rs, strokes });
    broadcastExcept(socket.id, 'draw:stroke', data);
  });

  socket.on('draw:clear', () => {
    const player = getPlayer(socket.id);
    if (!player) return;
    const state = getState();
    if (state.phase !== 'round1') return;
    const rs = state.roundState;
    if (rs.drawingTeamId !== player.teamId) return;
    const drawerOrder = rs.passThePenDrawerOrder || [];
    if (drawerOrder[rs.passThePenDrawerIndex ?? 0] !== socket.id) return;
    setRoundState({ ...rs, strokes: [] });
    broadcast('draw:clear', {});
  });

  socket.on('guess:submit', ({ guess }) => {
    const player = getPlayer(socket.id);
    if (!player) return;
    const state = getState();
    if (state.phase !== 'round1') return;
    const rs = state.roundState;
    if (rs.guessed) return;
    const word = rs.passThePenWord;
    if (!word) return;
    const correct = checkGuess(word, guess);
    if (!correct) return;
    setRoundState({ ...rs, guessed: true });
    addScore(player.teamId, GUESS_CORRECT_GUESSING_TEAM_POINTS);
    addScore(rs.drawingTeamId, GUESS_CORRECT_DRAWING_TEAM_POINTS);
    const team = getTeamById(player.teamId);
    const drawTeam = getTeamById(rs.drawingTeamId);
    broadcast('guess:correct', {
      guessingTeamId: player.teamId,
      guessingTeamName: team.name,
      drawingTeamId: rs.drawingTeamId,
      drawingTeamName: drawTeam.name,
    });
    setTimeout(() => nextPassThePenTurn(), 3000);
  });

  socket.on('host:setHost', () => {
    setHost(socket.id);
    socket.emit('host:confirmed', {});
    socket.emit('lobby:update', {
      teams: getTeamsForLobby(),
      playerCount: Object.keys(getState().players).length,
    });
  });

  socket.on('host:awardPoints', ({ teamId, points }) => {
    if (!isHost(socket.id)) return;
    addScore(teamId, points);
    broadcast('scores:update', { scores: getScores() });
  });

  socket.on('disconnect', () => {
    const wasHost = isHost(socket.id);
    removePlayer(socket.id);
    if (wasHost) setHost(null);
    broadcast('lobby:update', {
      teams: getTeamsForLobby(),
      playerCount: Object.keys(getState().players).length,
    });
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Factor1 Game server on http://localhost:${PORT}`);
});
