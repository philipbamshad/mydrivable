import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import promoVideo from "@/assets/drivable-promo.mp4.asset.json";
import promoPoster from "@/assets/drivable-promo-poster.jpg.asset.json";

const BTN_PRIMARY = "cta-pill";

export function VideoShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setRevealed(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
    if (!next) void v.play().catch(() => setMuted(true));
  };

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="px-4 pt-4 pb-20 sm:px-6 lg:px-8"
    >
      <div
        className={`reveal mx-auto w-full max-w-[900px] ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} transition-all duration-700 ease-out`}
      >
        <div className="relative overflow-hidden rounded-[32px] border border-[#1e40af]/15 bg-white p-3 shadow-[0_40px_90px_-60px_rgba(30,64,175,0.55)]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#0f172a]">
            <video
              ref={videoRef}
              src={promoVideo.url}
              poster={promoPoster.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Drivable promo clip"
              className="block h-auto w-full object-cover"
            />

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              aria-pressed={!muted}
              className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-base text-[#1f2b4d]/70 sm:text-lg">
            One clip, one idea: practise the exact exam you'll sit, then walk in
            ready.
          </p>
          <Link
            to="/auth"
            className={`${BTN_PRIMARY} px-8 py-4 text-base`}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
