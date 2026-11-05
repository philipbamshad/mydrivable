import type { ReactNode } from "react";
import "./study-question.css";

export function StudyQuestionFrame({ children }: { children: ReactNode }) {
  return <div className="study-question-frame mx-auto w-full">{children}</div>;
}