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
  QUESTION_TIME_MS,
  CORRECT_GUESS_POINTS,
  TOTAL_QUESTIONS,
  checkGuess,
  pickQuestions,
} from './rounds/emojiQuiz.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const ROOM = getRoomId();
const MIN_PLAYERS_TO_START = 1;

let questionTimer = null;

function broadcast(event, payload) {
  io.to(ROOM).emit(event, payload);
}

function getUsedPseudonyms() {
  return new Set(Object.values(getState().players).map((p) => p.pseudonym?.toLowerCase()));
}

function getTeamById(teamId) {
  const state = getState();
  const t = state.teams[teamId];
  return t ? { id: teamId, name: t.name, color: t.color } : null;
}

function startEmojiQuiz() {
  const questions = pickQuestions(TOTAL_QUESTIONS);
  setRoundState({
    questions,
    currentIndex: 0,
    answered: {},
  });
  broadcast('round:start', { round: 1, totalQuestions: TOTAL_QUESTIONS });
  sendNextQuestion();
}

function sendNextQuestion() {
  const rs = getRoundState();
  const idx = rs.currentIndex ?? 0;
  const questions = rs.questions || [];

  if (idx >= questions.length) {
    endGame();
    return;
  }

  const q = questions[idx];
  setCurrentQuestion(idx);
  setRoundState({ ...rs, answered: {}, questionStartedAt: Date.now() });

  broadcast('emoji:question', {
    questionNumber: idx + 1,
    totalQuestions: questions.length,
    emojis: q.emojis,
    timeMs: QUESTION_TIME_MS,
  });

  broadcast('scores:update', { scores: getScores() });

  if (questionTimer) clearTimeout(questionTimer);
  questionTimer = setTimeout(() => {
    timeUpAndAdvance();
  }, QUESTION_TIME_MS);
}

function timeUpAndAdvance() {
  const rs = getRoundState();
  const idx = rs.currentIndex ?? 0;
  const questions = rs.questions || [];
  const q = questions[idx];

  broadcast('emoji:timeUp', {
    questionNumber: idx + 1,
    answer: q?.answer || '',
  });

  const nextIndex = idx + 1;
  if (nextIndex >= questions.length) {
    setTimeout(() => endGame(), 3000);
    return;
  }

  setRoundState({ ...rs, currentIndex: nextIndex, answered: {} });
  setTimeout(() => sendNextQuestion(), 3000);
}

function endGame() {
  if (questionTimer) clearTimeout(questionTimer);
  setPhase('results');
  broadcast('game:end', { finalScores: getFinalScores() });
}

io.on('connection', (socket) => {
  socket.join(ROOM);

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
    io.to(ROOM).except(socket.id).emit('lobby:update', {
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
    startEmojiQuiz();
  });

  socket.on('host:nextQuestion', () => {
    if (!isHost(socket.id)) return;
    const state = getState();
    if (state.phase !== 'round1') return;
    if (questionTimer) clearTimeout(questionTimer);
    const rs = getRoundState();
    const nextIndex = (rs.currentIndex ?? 0) + 1;
    if (nextIndex >= (rs.questions?.length || TOTAL_QUESTIONS)) {
      endGame();
      return;
    }
    setRoundState({ ...rs, currentIndex: nextIndex, answered: {} });
    sendNextQuestion();
  });

  socket.on('host:endRound', () => {
    if (!isHost(socket.id)) return;
    endGame();
  });

  socket.on('guess:submit', ({ guess }) => {
    const player = getPlayer(socket.id);
    if (!player) return;
    const state = getState();
    if (state.phase !== 'round1') return;

    const rs = getRoundState();
    const idx = rs.currentIndex ?? 0;
    const questions = rs.questions || [];
    const q = questions[idx];
    if (!q) return;

    const teamId = player.teamId;
    const answered = rs.answered || {};
    if (answered[teamId]) return;

    const correct = checkGuess(q.answer, guess);

    if (correct) {
      answered[teamId] = true;
      setRoundState({ ...rs, answered });
      addScore(teamId, CORRECT_GUESS_POINTS);
      const team = getTeamById(teamId);
      broadcast('guess:correct', {
        teamId,
        teamName: team.name,
        playerName: player.pseudonym,
        questionNumber: idx + 1,
      });
      broadcast('scores:update', { scores: getScores() });
    } else {
      socket.emit('guess:wrong', { guess });
    }
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
