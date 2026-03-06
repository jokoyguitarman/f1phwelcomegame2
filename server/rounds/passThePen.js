export const passThePenWords = [
  'meeting', 'deadline', 'coffee', 'laptop', 'teamwork', 'presentation', 'brainstorm',
  'launch', 'feedback', 'onboarding', 'strategy', 'sprint', 'milestone', 'headphones', 'monitor',
  'pizza', 'weekend', 'webcam', 'mouse', 'charger', 'roadmap', 'celebration', 'notebook',
];

export const DRAW_TURN_MS = 15000;
export const GUESS_CORRECT_GUESSING_TEAM_POINTS = 3;
export const GUESS_CORRECT_DRAWING_TEAM_POINTS = 1;

export function normalizeAnswer(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function checkGuess(word, guess) {
  return normalizeAnswer(guess) === normalizeAnswer(word);
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
