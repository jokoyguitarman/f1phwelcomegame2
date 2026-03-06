// 4 Pics 1 Word — things we use at work (remote work equipment & tools)
export const fourPicsQuestions = [
  {
    id: 'fp1',
    answer: 'laptop',
    images: ['fp1-a.jpg', 'fp1-b.jpg', 'fp1-c.jpg', 'fp1-d.jpg'],
    explanation: 'Your main work machine — for calls, code, and everything in between.',
  },
  {
    id: 'fp2',
    answer: 'headphones',
    images: ['fp2-a.jpg', 'fp2-b.jpg', 'fp2-c.jpg', 'fp2-d.jpg'],
    explanation: 'Essential for focus and clear calls when working remotely.',
  },
  {
    id: 'fp3',
    answer: 'keyboard',
    images: ['fp3-a.jpg', 'fp3-b.jpg', 'fp3-c.jpg', 'fp3-d.jpg'],
    explanation: 'Where the work gets typed out — mechanical or membrane.',
  },
  {
    id: 'fp4',
    answer: 'webcam',
    images: ['fp4-a.jpg', 'fp4-b.jpg', 'fp4-c.jpg', 'fp4-d.jpg'],
    explanation: 'How your team sees you on video calls.',
  },
  {
    id: 'fp5',
    answer: 'coffee',
    images: ['fp5-a.jpg', 'fp5-b.jpg', 'fp5-c.jpg', 'fp5-d.jpg'],
    explanation: 'The fuel of remote work — and many a morning standup.',
  },
];

export const FOUR_PICS_TIMER_MS = 45000;
export const FIRST_CORRECT_POINTS = 3;
export const SECOND_CORRECT_POINTS = 1;

export function normalizeAnswer(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function checkAnswer(question, answer) {
  const expected = normalizeAnswer(question.answer);
  const given = normalizeAnswer(answer);
  return given === expected;
}
