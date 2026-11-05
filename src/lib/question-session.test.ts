import { expect, it } from 'vitest'
import { uniqueQuestionSession, questionFamily } from './question-session'
import { buildExamPool } from './mock-exam'
import { getStatePack } from '@/data/dmv'
import { buildPillarBanks } from '@/data/dmv/practice-bank'

it('includes the exact California 15½ learner permit age as the keyed choice in every version', () => {
  const questions = getStatePack('California').questions.filter(q => /minimum age.*learner/i.test(q.q))
  expect(questions.length).toBeGreaterThan(0)
  for (const q of questions) expect(q.options[q.correct]).toBe('15½')
})
it('does not repeat questions or framed versions within an exam or practice session', () => {
  const pool = buildExamPool('California')
  const exam = uniqueQuestionSession(pool, 46, () => 0.5)
  expect(exam).toHaveLength(46)
  expect(new Set(exam.map(questionFamily)).size).toBe(46)
  for (const bank of Object.values(buildPillarBanks('California'))) {
    const practice = uniqueQuestionSession(bank, 8, () => 0.5)
    expect(practice).toHaveLength(8)
    expect(new Set(practice.map(questionFamily)).size).toBe(8)
  }
})
it('recognizes different phrasings of the permit age and octagonal stop sign', () => {
  const q = { q: "What is the minimum age to apply for a learner's permit?", options: ['14', '15½', '16', '17'], correct: 1 }
  expect(uniqueQuestionSession([q, { ...q, q: "During your morning drive, the minimum age for a learner permit is…" }], 2)).toHaveLength(1)
})
it('keeps separately authored flashing yellow meanings in one concept family', () => {
  const q = { conceptId: 'flashing-yellow', q: 'A flashing yellow light means…', options: ['Stop', 'Proceed carefully'], correct: 1 }
  expect(uniqueQuestionSession([q, { ...q, conceptId: 'BASELINE-007', q: 'What should you do at a flashing yellow signal?' }], 2)).toHaveLength(1)
})