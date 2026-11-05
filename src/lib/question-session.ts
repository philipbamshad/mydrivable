import { directQuestion } from './mock-exam'
import { canonicalConcept } from '@/data/dmv/question-concepts'

type SessionQuestion = { conceptId?: string; sign?: unknown; q: string; options: string[]; correct: number }

/** Ignore incidental phrasing and shuffled choices when selecting a session. */
export function questionFamily(q: SessionQuestion): string {
  const text = directQuestion(q.q).toLowerCase().replace(/[^a-z0-9½]+/g, ' ').trim()
  if (/minimum age.*(?:learner|permit)|(?:learner|permit).*minimum age/.test(text)) return 'learner-permit-age'
  if (/octagon/.test(text)) return 'stop-sign-shape'
  if (q.conceptId) return canonicalConcept(q.conceptId)
  return text + (q.sign ? JSON.stringify(q.sign) : "")
}

export function uniqueQuestionSession<T extends SessionQuestion>(questions: T[], count: number, random = Math.random): T[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const families = new Set<string>()
  const answers = new Set<string>()
  const result: T[] = []
  for (const question of shuffled) {
    const family = questionFamily(question)
    const choices = JSON.stringify([...question.options].sort())
    // Equal option sets and keyed answer are typically separately authored
    // phrasings of the same question; numerical questions keep their text.
    const answerFamily = `${choices}:${question.options[question.correct]}`
    const numeric = question.options.every(o => /^[\d\s½.$%+-]+$/.test(o))
    if (families.has(family) || (!numeric && answers.has(answerFamily))) continue
    families.add(family); answers.add(answerFamily); result.push(question)
    if (result.length === count) break
  }
  return result
}