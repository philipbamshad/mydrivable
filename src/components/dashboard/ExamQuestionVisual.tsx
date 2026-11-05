import { SignVisual } from "./SignVisual";
import { questionVisual, type QuestionVisual } from "@/lib/question-visual";
import type { SignSpec } from "./SignVisual";

const R = {
  red: "var(--exam-road-red)", yellow: "var(--exam-road-yellow)", green: "var(--exam-road-green)", white: "var(--exam-road-white)",
  blue: "var(--exam-road-blue)", ink: "var(--exam-road-ink)", off: "var(--exam-road-off)", asphalt: "var(--exam-road-asphalt)", orange: "var(--exam-road-orange)",
};

function Signal({ v }: { v: Extract<QuestionVisual, { kind: "signal" }> }) {
  if (v.rail) return <svg viewBox="0 0 160 160"><path d="M80 70V156" stroke={R.ink} strokeWidth="6" /><g stroke={R.white} strokeWidth="10"><path d="M35 10L125 60M125 10L35 60" /></g><g stroke={R.ink} strokeWidth="2"><path d="M35 10L125 60M125 10L35 60" /></g><rect x="30" y="80" width="100" height="40" rx="8" fill={R.ink} /><circle cx="55" cy="100" r="15" fill={R.red} /><circle cx="105" cy="100" r="15" fill={R.off} /></svg>;
  if (v.ped) return <svg viewBox="0 0 160 160"><rect x="25" y="15" width="110" height="130" rx="12" fill={R.ink} />{v.ped === "hand"
    ? <path d="M66 112V70a6 6 0 0 1 12 0V60a6 6 0 0 1 12 0v6a6 6 0 0 1 12 0v40c0 12-8 18-18 18h-6c-8 0-12-6-14-12l-8-20a6 6 0 0 1 10-4z" fill={R.orange} />
    : <g fill={R.white}><circle cx="82" cy="45" r="9" /><path d="M74 58h14l8 26-5 2-6-14-2 20 10 26-7 3-10-24-8 24-7-3 8-27 2-17-6 10-6-3z" /></g>}</svg>;
  const lens = ["red", "yellow", "green"] as const;
  return <svg viewBox="0 0 160 160"><rect x="53" y="4" width="54" height="152" rx="12" fill={R.ink} />{lens.map((color, i) => {
    const on = v.lit === color; const cy = 30 + i * 50;
    if (on && (v.arrow || v.bike)) return <g key={color}><circle cx="80" cy={cy} r="19" fill={R.off} />{v.arrow
      ? <path d={`M93 ${cy}H68m0 0l9-9m-9 9l9 9`} stroke={R[color]} strokeWidth="6" fill="none" strokeLinecap="round" />
      : <g stroke={R[color]} strokeWidth="3" fill="none"><circle cx="70" cy={cy + 5} r="6" /><circle cx="90" cy={cy + 5} r="6" /><path d={`M70 ${cy + 5}l7-12 6 12h-13m7-12h8l5 12`} /></g>}</g>;
    return <circle key={color} cx="80" cy={cy} r="19" fill={on ? R[color] : R.off} />;
  })}</svg>;
}

function Marking({ v }: { v: Extract<QuestionVisual, { kind: "marking" }> }) {
  return <svg viewBox="0 0 260 150"><rect x="10" y="5" width="240" height="140" rx="8" fill={R.asphalt} />
    {v.variant === "curb" ? <><rect x="10" y="112" width="240" height="18" fill={R[v.color]} /></>
      : v.variant === "crosswalk" ? <>{[45, 80, 115, 150, 185].map(x => <rect key={x} x={x} y="45" width="18" height="75" fill={R.white} />)}<path d="M25 25H235" stroke={R.white} strokeWidth="7" /></>
      : v.variant === "exit-arrow" ? <><path d="M130 10V140" stroke={R.white} strokeWidth="5" strokeDasharray="16 12" /><path d="M80 125L170 40M150 38h22v22" stroke={R.white} strokeWidth="9" fill="none" /></>
      : v.variant === "bike" ? <><path d="M90 10V140" stroke={R.white} strokeWidth="5" /><g stroke={R.white} strokeWidth="4" fill="none"><circle cx="150" cy="95" r="16" /><circle cx="200" cy="95" r="16" /><path d="M150 95l20-32 14 32h-34l16-24h20l14 24" /></g></>
      : <><path d="M120 10V140" stroke={R[v.color]} strokeWidth="5" strokeDasharray={v.dashed ? "16 12" : undefined} />{v.double && <path d="M132 10V140" stroke={R[v.color]} strokeWidth="5" />}</>}
  </svg>;
}

function Prohibited({ inner }: { inner: "left" | "u" }) {
  return <svg viewBox="0 0 160 160"><rect x="3" y="3" width="154" height="154" rx="8" fill={R.white} stroke={R.ink} strokeWidth="3" />
    <circle cx="80" cy="80" r="57" fill="none" stroke={R.red} strokeWidth="12" />
    {inner === "u" ? <path d="M105 118V65a25 25 0 0 0-50 0v35m-12-15l12 15 12-15" fill="none" stroke={R.ink} strokeWidth="9" /> : <path d="M108 118V78H50m16-18L48 78l18 18" fill="none" stroke={R.ink} strokeWidth="9" />}
    <path d="M40 40L120 120" stroke={R.red} strokeWidth="12" /></svg>;
}

export function ExamQuestionVisual({ question }: { question: { q: string; sign?: SignSpec } }) {
  const v = questionVisual(question);
  if (!v) return null;
  return <div className="exam-road-visual question-visual" role="img" aria-label={v.label}>
    {v.kind === "sign" ? <SignVisual s={v.spec} size={140} /> : v.kind === "prohibited" ? <Prohibited inner={v.inner} /> : v.kind === "signal" ? <Signal v={v} /> : <Marking v={v} />}
  </div>;
}
