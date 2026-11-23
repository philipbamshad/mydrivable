import { directQuestion } from './mock-exam'
import { canonicalConcept } from '@/data/dmv/question-concepts'

type SessionQuestion = { id?: string; key?: string; conceptId?: string; sign?: unknown; q: string; options: string[]; correct: number }

export function questionText(q: SessionQuestion): string {
  return directQuestion(q.q).toLowerCase().replace(/\s+/g, ' ').trim()
}

export function questionIdentityKeys(q: SessionQuestion): string[] {
  return [`family:${questionFamily(q)}`, `text:${questionText(q)}`, ...(q.id ? [`id:${q.id}`] : []), ...(q.key ? [`id:${q.key}`] : [])]
}

export type QuestionRecency = ReadonlyMap<string, number>
export function recentQuestionHistory(attempts: { payload: unknown[]; created_at: string; feature: string }[]): Map<string, number> {
  const recent = new Map<string, number>()
  for (const attempt of attempts) {
    if (attempt.feature === 'simulation') continue
    for (const item of attempt.payload) {
      if (!item || typeof item !== 'object' || !('q' in item) || !('options' in item)) continue
      const q = item as SessionQuestion
      for (const key of questionIdentityKeys(q)) recent.set(key, Math.max(recent.get(key) ?? 0, Date.parse(attempt.created_at) || 0))
    }
  }
  return recent
}

/** Ignore incidental phrasing and shuffled choices when selecting a session. */
export function questionFamily(q: SessionQuestion): string {
  const text = directQuestion(q.q).toLowerCase().replace(/[^a-z0-9½]+/g, ' ').trim()
  if (/minimum age.*(?:learner|permit)|(?:learner|permit).*minimum age/.test(text)) return 'learner-permit-age'
  if (/octagon/.test(text)) return 'stop-sign-shape'
  if (q.conceptId) return canonicalConcept(q.conceptId)
  return text + (q.sign ? JSON.stringify(q.sign) : "")
}

export function uniqueQuestionSession<T extends SessionQuestion>(questions: T[], count: number, random = Math.random, recent: QuestionRecency = new Map()): T[] {
  if (count <= 0) return []
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  shuffled.sort((a, b) => Math.max(0, ...questionIdentityKeys(a).map(key => recent.get(key) ?? 0)) - Math.max(0, ...questionIdentityKeys(b).map(key => recent.get(key) ?? 0)))
  const identities = new Set<string>()
  const answers = new Set<string>()
  const result: T[] = []
  for (const question of shuffled) {
    const keys = questionIdentityKeys(question)
    const choices = JSON.stringify([...question.options].sort())
    // Equal option sets and keyed answer are typically separately authored
    // phrasings of the same question; numerical questions keep their text.
    const answerFamily = `${choices}:${question.options[question.correct]}`
    const numeric = question.options.every(o => /^[\d\s½.$%+-]+$/.test(o))
    if (keys.some(key => identities.has(key)) || (!numeric && answers.has(answerFamily))) continue
    keys.forEach(key => identities.add(key)); answers.add(answerFamily); result.push(question)
    if (result.length === count) break
  }
  return result
}