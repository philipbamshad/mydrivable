import { ExamQuestionVisual } from "./ExamQuestionVisual";
import type { HubQuestion } from "@/lib/test-hub";

export function HubQuestionVisual({ question }: { question: HubQuestion }) {
  return <ExamQuestionVisual question={question} />;
}
