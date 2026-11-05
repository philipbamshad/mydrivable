import { answerProgress, emptyTopic, hubQuestion, HUB_TOPICS, type TopicProgress } from './test-hub';
import type { StudyAttempt } from './study-attempt';
import type { ExamQuestion } from './mock-exam';

/** Existing progress wins; replay only identities absent from legacy saved progress. */
export function withHistoricalExamAnswers(progress: { state: string; progress: TopicProgress }[], attempts: StudyAttempt[]) {
  const result = progress.map(row => ({ ...row, progress: { ...row.progress, questions: { ...row.progress.questions } } }));
  const existing = new Set(result.flatMap(row => Object.keys(row.progress.questions).map(key => `${row.state}:${key}`)));
  for (const attempt of [...attempts].filter(a => a.feature === 'exam').sort((a,b) => a.created_at.localeCompare(b.created_at))) {
    attempt.answers.forEach((answer, index) => {
      const source = attempt.payload[index] as ExamQuestion | undefined;
      if (!source || typeof answer !== 'number' || !HUB_TOPICS.includes(source.topic)) return;
      const question = hubQuestion(source, source.topic);
      if (existing.has(`${attempt.state}:${question.key}`)) return;
      let row = result.find(r => r.state === attempt.state && r.progress.topic === question.topic);
      if (!row) { row = { state: attempt.state, progress: emptyTopic(question.topic) }; result.push(row); }
      row.progress = answerProgress(row.progress, question, answer === source.correct);
    });
  }
  return result;
}