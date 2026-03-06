export const zoomSpyQuestions = [
  { id: 'q1', answer: 'keyboard', folder: 'images/zoom-spy/q1', stages: 5 },
  { id: 'q2', answer: 'coffee', folder: 'images/zoom-spy/q2', stages: 5 },
  { id: 'q3', answer: 'chair', folder: 'images/zoom-spy/q3', stages: 5 },
  { id: 'q4', answer: 'phone', folder: 'images/zoom-spy/q4', stages: 5 },
  { id: 'q5', answer: 'brand', folder: 'images/zoom-spy/q5', stages: 5 },
  { id: 'q6', answer: 'painting', folder: 'images/zoom-spy/q6', stages: 5 },
];

export const STAGE_DURATIONS_MS = [30000, 20000, 15000, 10000, 5000];
export const STAGE_POINTS = [5, 4, 3, 2, 1];

export function normalizeAnswer(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function checkAnswer(question, answer) {
  const expected = normalizeAnswer(question.answer);
  const given = normalizeAnswer(answer);
  return given === expected;
}
