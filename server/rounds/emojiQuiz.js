export const QUESTION_TIME_MS = 15000;
export const TOTAL_QUESTIONS = 10;

const SCORE_BY_RANK = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export function getPointsForRank(rank) {
  if (rank < 1) return 0;
  return SCORE_BY_RANK[rank - 1] ?? 1;
}

export const emojiQuestions = [
  { emojis: '🦁👑', answer: 'the lion king' },
  { emojis: '🧊🚢💔', answer: 'titanic' },
  { emojis: '🕷️🧑', answer: 'spider man' },
  { emojis: '👻👻👻🔫', answer: 'ghostbusters' },
  { emojis: '🧙‍♂️💍🌋', answer: 'lord of the rings' },
  { emojis: '🦖🏝️', answer: 'jurassic park' },
  { emojis: '🤖👍🔥', answer: 'terminator' },
  { emojis: '🧛‍♂️🩸💘', answer: 'twilight' },
  { emojis: '🏠👦🪤🎄', answer: 'home alone' },
  { emojis: '🐠🔍', answer: 'finding nemo' },
  { emojis: '👸❄️⛄', answer: 'frozen' },
  { emojis: '🚗⚡🏁', answer: 'cars' },
  { emojis: '🐀👨‍🍳🇫🇷', answer: 'ratatouille' },
  { emojis: '🧞‍♂️🪔🐒', answer: 'aladdin' },
  { emojis: '👽☎️🚲🌕', answer: 'et' },
  { emojis: '🦇🃏🌃', answer: 'the dark knight' },
  { emojis: '⬆️🏠🎈🎈', answer: 'up' },
  { emojis: '🧸🐯🍯', answer: 'winnie the pooh' },
  { emojis: '🧟‍♂️🌍🔫', answer: 'world war z' },
  { emojis: '🤠🐎🤖🌵', answer: 'toy story' },
];

export function normalizeAnswer(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkGuess(answer, guess) {
  const norm = normalizeAnswer(guess);
  const target = normalizeAnswer(answer);
  if (!norm || !target) return false;
  return norm === target || norm.replace(/\s/g, '') === target.replace(/\s/g, '');
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickQuestions(count = TOTAL_QUESTIONS) {
  const shuffled = shuffleArray(emojiQuestions);
  return shuffled.slice(0, count);
}
