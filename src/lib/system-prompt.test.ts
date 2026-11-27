import { expect, it } from 'vitest'
import { buildSystemPrompt } from './system-prompt'

it('permits behind-the-wheel preparation without inventing state scoring rules', () => {
  const prompt = buildSystemPrompt('California')
  expect(prompt).toContain('Driving-test questions, maneuvers, examiner checks, scoring and critical errors are in scope')
  expect(prompt).toContain('never invent points or automatic failures')
  expect(prompt).not.toContain('Do not coach hands-on driving technique')
})

it('locks Coach to the active state and teen permit facts', () => {
  const prompt = buildSystemPrompt('California')
  expect(prompt).toContain('ACTIVE JURISDICTION: California')
  expect(prompt).toContain('Never ask the user which state they are in')
  expect(prompt).toContain('Under-18 permit exam: 46 questions, must answer 38 correctly (83% passing)')
  expect(prompt).toContain('within 18 inches, not 1 foot')
  expect(prompt).toContain('Never describe driving at or below a posted school-zone limit as speeding')
  expect(prompt).not.toContain('Delaware')
  expect(prompt).not.toContain('Adult BAC limit:')
  expect(prompt).not.toContain('Commercial driver BAC limit:')
})

it('uses Delaware\'s 25 mph business-district limit', () => {
  const prompt = buildSystemPrompt('Delaware')
  expect(prompt).toContain('Jurisdiction: Delaware (DE)')
  expect(prompt).toContain('urban/business 25 mph')
  expect(prompt).not.toContain('California')
})
