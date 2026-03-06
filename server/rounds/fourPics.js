export const fourPicsQuestions = [
  {
    id: 'fp1',
    answer: 'empowerment',
    images: ['fp1-a.jpg', 'fp1-b.jpg', 'fp1-c.jpg', 'fp1-d.jpg'],
    explanation: 'Delegation with guidance and taking ownership of your role.',
  },
  {
    id: 'fp2',
    answer: 'honesty',
    images: ['fp2-a.jpg', 'fp2-b.jpg', 'fp2-c.jpg', 'fp2-d.jpg'],
    explanation: 'Being truthful, honest and staying true to your word.',
  },
  {
    id: 'fp3',
    answer: 'courage',
    images: ['fp3-a.jpg', 'fp3-b.jpg', 'fp3-c.jpg', 'fp3-d.jpg'],
    explanation: 'Being brave and resilient in the face of challenges and growth opportunities with open communication.',
  },
  {
    id: 'fp4',
    answer: 'fairness',
    images: ['fp4-a.jpg', 'fp4-b.jpg', 'fp4-c.jpg', 'fp4-d.jpg'],
    explanation: 'Believe in fair and equal treatment of all without bias.',
  },
  {
    id: 'fp5',
    answer: 'respect',
    images: ['fp5-a.jpg', 'fp5-b.jpg', 'fp5-c.jpg', 'fp5-d.jpg'],
    explanation: 'Treating others with consideration, dignity and empathy.',
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
