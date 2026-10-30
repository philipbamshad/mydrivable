import { useCallback, useEffect, useRef, useState } from "react";

export function useDriveSound() {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const audio = useRef<AudioContext | null>(null);

  const unlock = useCallback(() => {
    try {
      if (!audio.current) audio.current = new AudioContext();
      void audio.current.resume().catch(() => undefined);
    } catch { /* Audio is optional on unsupported devices. */ }
  }, []);

  const play = useCallback((kind: "correct" | "wrong" | "tick") => {
    const context = audio.current;
    if (mutedRef.current || !context || context.state !== "running") return;
    const notes = kind === "correct" ? [660, 880] : kind === "wrong" ? [220, 150] : [480];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.045, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.11);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.12);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }, []);

  const toggle = useCallback(() => {
    unlock();
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
  }, [unlock]);

  useEffect(() => () => { void audio.current?.close().catch(() => undefined); }, []);
  return { muted, toggle, unlock, play };
}