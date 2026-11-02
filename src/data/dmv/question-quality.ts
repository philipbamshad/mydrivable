type QuestionLike = { q: string; options: string[]; correct: number; explanation: string };

/** Keep interpolated numerical distractors distinct from the keyed value. */
export function distinctOptions<T extends QuestionLike>(question: T): T {
  const correctText = question.options[question.correct];
  const used = new Set<string>([correctText]);
  const options = question.options.map((option, index) => {
    if (index === question.correct) return option;
    if (!used.has(option)) { used.add(option); return option; }
    const numeric = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(option);
    if (!numeric) throw new Error(`Duplicate choice in question: ${question.q}`);
    const base = Number(numeric[2]);
    const step = option.includes("%") ? 0.01 : 1;
    let candidate = option;
    let offset = 1;
    while (used.has(candidate)) {
      const value = base + step * offset++;
      candidate = `${numeric[1]}${option.includes("%") ? value.toFixed(2) : value}${numeric[3]}`;
    }
    used.add(candidate);
    return candidate;
  });
  return { ...question, options };
}

export function orderBooleanAnswers<T extends QuestionLike>(question: T): T {
  if (question.options.length !== 2 || !question.options.includes("True") || !question.options.includes("False")) return question;
  return { ...question, options: ["True", "False"], correct: question.options[question.correct] === "True" ? 0 : 1 };
}