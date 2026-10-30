import type { SimulationClip } from "@/data/simulation-session";

export function ScenarioThumbnail({ clip, thumbnail }: { clip: SimulationClip; thumbnail: string | null }) {
  return thumbnail ? (
    <img src={thumbnail} alt={clip.title} className="aspect-video w-full rounded-xl object-cover" />
  ) : (
    <video src={clip.videoUrl} muted playsInline preload="auto" aria-label={clip.title}
      onLoadedMetadata={(event) => { event.currentTarget.currentTime = clip.pauseAt; }}
      className="aspect-video w-full rounded-xl bg-muted object-cover" />
  );
}