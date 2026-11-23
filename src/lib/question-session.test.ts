import { expect, it } from 'vitest'
import { uniqueQuestionSession, questionFamily, questionText, recentQuestionHistory } from './question-session'
import { buildExamPool } from './mock-exam'
import { getStatePack } from '@/data/dmv'
import { buildPillarBanks } from '@/data/dmv/practice-bank'
import stateRules from '@/data/dmv/state-rules.json'

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
it('never repeats an ID or identical question text even when concept IDs differ', () => {
  const q = { id: 'one', conceptId: 'a', q: 'When must you stop?', options: ['Always', 'At red'], correct: 1 }
  expect(uniqueQuestionSession([q, { ...q, id: 'two', conceptId: 'b', options: ['At red', 'Never'], correct: 0 }], 2)).toHaveLength(1)
  expect(uniqueQuestionSession([q, { ...q, conceptId: 'c', q: 'A different prompt?', options: ['Yes', 'No'] }], 2)).toHaveLength(1)
})
it('prefers unseen questions across exam and topic history, then oldest seen without resetting history', () => {
  const make = (id: string) => ({ id, conceptId: id, q: `${id} question?`, options: ['1', '2'], correct: 0 })
  const old = make('old'), latest = make('latest'), unseen = make('unseen')
  const history = recentQuestionHistory([{ feature: 'exam', created_at: '2026-11-20', payload: [old] }, { feature: 'signs', created_at: '2026-11-23', payload: [latest] }])
  expect(uniqueQuestionSession([latest, old, unseen], 3, () => 0.5, history).map(q => q.id)).toEqual(['unseen', 'old', 'latest'])
})
it('keeps every generated California exam prompt unique by text', () => {
  const exam = uniqueQuestionSession(buildExamPool('California'), 46)
  expect(exam).toHaveLength(46)
  expect(new Set(exam.map(questionText)).size).toBe(46)
})
it('selects unique ID/text/concept questions in every state exam and topic bank', () => {
  for (const state of Object.keys(stateRules)) {
    const pack = getStatePack(state)
    const exam = uniqueQuestionSession(buildExamPool(state),pack.rules.questionsCount,() => 0.5)
    expect(exam.length,state).toBe(pack.rules.questionsCount)
    expect(new Set(exam.map(questionText)).size,state).toBe(exam.length)
    expect(new Set(exam.map(questionFamily)).size,state).toBe(exam.length)
    for (const bank of Object.values(buildPillarBanks(state))) {
      const quiz = uniqueQuestionSession(bank,8,() => 0.5)
      expect(quiz.length,state).toBe(8)
      expect(new Set(quiz.map(questionText)).size,state).toBe(8)
    }
  }
})