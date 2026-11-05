import { expect, it } from 'vitest'
import { buildSystemPrompt } from './system-prompt'
it('permits behind-the-wheel preparation without inventing state scoring rules', () => {
  const prompt = buildSystemPrompt('California')
  expect(prompt).toContain('Driving-test questions, maneuvers, examiner checks, scoring and critical errors are in scope')
  expect(prompt).toContain('never invent points or automatic failures')
  expect(prompt).not.toContain('Do not coach hands-on driving technique')
})