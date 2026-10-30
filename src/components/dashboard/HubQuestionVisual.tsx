import { ExamQuestionVisual } from "./ExamQuestionVisual";
import type { HubQuestion } from "@/lib/test-hub";

export function HubQuestionVisual({ question }: { question: HubQuestion }) {
  if (/red circle.*(?:slash|line through)|no (?:left|u) turn/i.test(question.q)) {
    return <div className="exam-road-visual mb-5 grid h-44 place-items-center rounded-2xl bg-muted" role="img" aria-label="Prohibited turn sign">
      <svg viewBox="0 0 160 160" className="h-36 w-36" aria-hidden="true">
        <rect x="3" y="3" width="154" height="154" rx="8" fill="var(--exam-road-white)" stroke="var(--exam-road-ink)" strokeWidth="3" />
        <circle cx="80" cy="80" r="57" fill="none" stroke="var(--exam-road-red)" strokeWidth="12" />
        {/u turn/i.test(question.q) ? <path d="M105 118V65a25 25 0 0 0-50 0v35m-12-15l12 15 12-15" fill="none" stroke="var(--exam-road-ink)" strokeWidth="9" /> : <path d="M108 118V78H50m16-18L48 78l18 18" fill="none" stroke="var(--exam-road-ink)" strokeWidth="9" />}
        <path d="M40 40L120 120" stroke="var(--exam-road-red)" strokeWidth="12" />
      </svg>
    </div>;
  }
  return <ExamQuestionVisual question={question} />;
}