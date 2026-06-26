# DMV state ruleset

This folder is the single source of truth for Drivable's state-grounded content.

**Audit these files first:**

| File | What to review |
| --- | --- |
| `state-rules.json` | All 50 states. Passing score, question count, BAC thresholds, GDL ages, phone/texting laws, supervised-hour requirements, implied-consent consequence, official handbook URL. |
| `questions-baseline.json` | ~55 federal-baseline questions used everywhere (signs, right-of-way, defensive driving). |
| `index.ts` | Type definitions + builder that merges baseline + auto-generated state-fact questions into the simulator pool. |

**Sources.** Drafted from the most recent publicly published state DMV / DPS / MVD handbooks (2024 – 2026 editions). Stable rules (signs, right-of-way, federal BAC adult 0.08%, federal commercial 0.04%) are authoritative. Time-sensitive values — phone/texting **first-offense base fine**, exact GDL hour counts, supervised-driving requirements — change yearly via legislative session; each row carries the official handbook URL so you can verify the current published number.

**Disclaimer string** rendered to users: `"Calibrated to {state}'s official DMV handbook. Always verify current fines and statutes with your state DMV."`

**Where it's consumed:**

- `src/components/dashboard/PermitExamSimulator.tsx` — pulls `count`, `passingScorePct`, and the merged question pool per state.
- `src/lib/system-prompt.ts` — injects the active state's rules JSON into the chat system prompt so the AI assistant answers from the state's facts, not generic averages.

**Roadmap.** Phase 2 (RAG) will embed each state's handbook PDF into pgvector and retrieve passages at chat time; the prompt-injected ruleset stays as the authoritative fact card.
