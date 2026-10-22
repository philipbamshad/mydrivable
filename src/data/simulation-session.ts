export type SimulationClip = {
  id: string;
  videoUrl: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createSimulationSession(
  clips: readonly SimulationClip[],
  random: () => number = Math.random,
): SimulationClip[] {
  return shuffle(clips, random).map((clip) => {
    const answers = shuffle(clip.options.map((text, index) => ({ text, index })), random);
    return {
      ...clip,
      options: answers.map((answer) => answer.text),
      correct: answers.findIndex((answer) => answer.index === clip.correct),
    };
  });
}