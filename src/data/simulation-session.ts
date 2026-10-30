export type ActionIcon = "go" | "stop" | "yield" | "left" | "right" | "wait" | "check";

export type SimulationAction = {
  id: string;
  label: string;
  icon: ActionIcon;
  originalIndex?: number;
};

export type SimulationClip = {
  id: string;
  videoUrl: string;
  pauseAt: number;
  cue: string;
  actions: SimulationAction[];
  correctAction: string;
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
    const actions = shuffle(clip.actions.map((action, index) => ({ ...action, originalIndex: index })), random);
    return {
      ...clip,
      actions,
    };
  });
}