e on const TEAMS = {
  1: { name: 'Blaze', color: '#FF5C1A', score: 0, playerIds: [] },
  2: { name: 'Surge', color: '#00C4B4', score: 0, playerIds: [] },
  3: { name: 'Volt', color: '#FFD600', score: 0, playerIds: [] },
  4: { name: 'Nova', color: '#7C3AED', score: 0, playerIds: [] },
  5: { name: 'Pulse', color: '#F43F8E', score: 0, playerIds: [] },
};

const ROOM_ID = 'factor1-game';

let state = {
  phase: 'lobby',
  players: {},
  teams: JSON.parse(JSON.stringify(TEAMS)),
  hostSocketId: null,
  currentRound: null,
  currentQuestion: null,
  roundState: {},
};

export function getState() {
  return state;
}

export function getRoomId() {
  return ROOM_ID;
}

export function resetState() {
  state = {
    phase: 'lobby',
    players: {},
    teams: JSON.parse(JSON.stringify(TEAMS)),
    hostSocketId: null,
    currentRound: null,
    currentQuestion: null,
    roundState: {},
  };
  return state;
}

export function setPhase(phase) {
  state.phase = phase;
  return state.phase;
}

export function setHost(socketId) {
  state.hostSocketId = socketId;
}

export function isHost(socketId) {
  return state.hostSocketId === socketId;
}

export function addPlayer(socketId, data) {
  const { pseudonym, email, teamId } = data;
  state.players[socketId] = {
    pseudonym,
    email: email || null,
    teamId,
    joinedAt: Date.now(),
  };
  const team = state.teams[teamId];
  if (team && !team.playerIds.includes(socketId)) {
    team.playerIds.push(socketId);
  }
  return state.players[socketId];
}

export function removePlayer(socketId) {
  const p = state.players[socketId];
  if (!p) return null;
  const team = state.teams[p.teamId];
  if (team) {
    team.playerIds = team.playerIds.filter((id) => id !== socketId);
  }
  delete state.players[socketId];
  return p;
}

export function getPlayer(socketId) {
  return state.players[socketId] || null;
}

export function getTeamsForLobby() {
  return Object.entries(state.teams).map(([id, t]) => ({
    id: Number(id),
    name: t.name,
    color: t.color,
    score: t.score,
    playerIds: t.playerIds,
    pseudonyms: t.playerIds.map((sid) => state.players[sid]?.pseudonym).filter(Boolean),
  }));
}

export function getScores() {
  return Object.fromEntries(
    Object.entries(state.teams).map(([id, t]) => [id, t.score])
  );
}

export function addScore(teamId, points) {
  const team = state.teams[teamId];
  if (team) team.score += points;
  return team?.score ?? 0;
}

export function setCurrentRound(round) {
  state.currentRound = round;
  return state.currentRound;
}

export function setCurrentQuestion(q) {
  state.currentQuestion = q;
  return state.currentQuestion;
}

export function getRoundState() {
  return state.roundState;
}

export function setRoundState(partial) {
  state.roundState = { ...state.roundState, ...partial };
  return state.roundState;
}

export function getFinalScores() {
  return Object.entries(state.teams)
    .map(([id, t]) => ({ teamId: Number(id), name: t.name, color: t.color, score: t.score }))
    .sort((a, b) => b.score - a.score);
}
