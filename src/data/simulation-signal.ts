export function signalDirection(intent: string): "left" | "right" | null {
  switch (intent.trim().toLowerCase()) {
    case "turning right":
    case "changing lanes right":
      return "right";
    case "turning left":
    case "changing lanes left":
      return "left";
    default:
      return null;
  }
}

export function signalIsActive(hasPlayed: boolean, phase: string): boolean {
  return hasPlayed && (phase === "playing" || phase === "decision");
}