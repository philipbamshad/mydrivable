import { SignVisual } from "./SignVisual";
import type { ExamQuestion } from "@/lib/mock-exam";

export function ExamQuestionVisual({ question }: { question: ExamQuestion }) {
  const text = question.q.toLowerCase();
  const signal = !/sign.*(?:says|means)|'no turn on red'|"no turn on red"/.test(text) && /signal|traffic light|green arrow|red arrow|yellow arrow|flashing .*light|light turns|walking person/.test(text);
  const marking = /curb|lane line|yellow line|white line|parallel yellow|pavement|sharrow|bike lane|bicycle lane|crosswalk|limit line|lane marking/.test(text);
  const sign = /sign|octagon|inverted.*triangle/.test(text);
  if (!signal && !marking && !sign && !question.sign) return null;
  const color = /green/.test(text) ? "var(--exam-road-green)" : /yellow/.test(text) ? "var(--exam-road-yellow)" : /white/.test(text) ? "var(--exam-road-white)" : "var(--exam-road-red)";
  const signSpec = question.sign ?? {
    shape: /stop|octagon/.test(text) ? "octagon" as const : /yield|triangle/.test(text) ? "triangle-down" as const : /pentagon|school zone/.test(text) ? "pentagon" as const : /pennant/.test(text) ? "pennant" as const : /diamond|warning|merge|pedestrian|deer|curving|slippery/.test(text) ? "diamond" as const : /circle|do not enter|no left/.test(text) ? "circle" as const : "rect" as const,
    fill: /green guide/.test(text) ? "var(--exam-road-green)" : /blue/.test(text) ? "var(--exam-road-blue)" : /brown/.test(text) ? "var(--exam-road-brown)" : /orange|construction|work.zone/.test(text) ? "var(--exam-road-orange)" : /yellow|diamond|warning|merge|deer|slippery|pennant/.test(text) ? "var(--exam-road-yellow)" : /stop|red|do not enter/.test(text) ? "var(--exam-road-red)" : "var(--exam-road-white)",
    stroke: "var(--exam-road-ink)", textColor: /stop|do not enter|green guide/.test(text) ? "var(--exam-road-white)" : "var(--exam-road-ink)",
    letters: /stop|octagon/.test(text) ? "STOP" : /yield|triangle/.test(text) ? "YIELD" : /do not enter/.test(text) ? "DO NOT ENTER" : /no left/.test(text) ? "↰" : /merge/.test(text) ? "↗" : /crossroad|intersection/.test(text) ? "+" : /pedestrian|school/.test(text) ? "🚶" : /deer/.test(text) ? "🦌" : /orange|work.zone/.test(text) ? "SLOW" : /green guide/.test(text) ? "EXIT →" : question.q.match(/['"]([^'"]+)['"]/)?.[1].toUpperCase() ?? (/railroad|\brr\b/.test(text) ? "RR" : ""),
    bar: /do not enter/.test(text),
  };
  return <div className="exam-road-visual mb-5 grid h-44 place-items-center rounded-2xl bg-muted" role="img" aria-label={signal ? "Traffic signal illustration" : marking ? "Road marking illustration" : "Road sign illustration"}>
    {signal ? <svg viewBox="0 0 240 150" className="h-36 w-60" aria-hidden="true">
      {/railroad/.test(text) ? <><rect x="30" y="45" width="180" height="65" rx="12" fill="var(--exam-road-ink)" /><circle cx="75" cy="77" r="23" fill="var(--exam-road-red)" /><circle cx="165" cy="77" r="23" fill="var(--exam-road-red)" /></> : <><rect x="93" y="4" width="54" height="142" rx="12" fill="var(--exam-road-ink)" />{[27, 75, 123].map((y, i) => <circle key={y} cx="120" cy={y} r="18" fill={/not working|malfunction/.test(text) || /arrow/.test(text) ? "var(--exam-road-off)" : i === (/green/.test(text) ? 2 : /yellow/.test(text) ? 1 : 0) ? color : "var(--exam-road-off)"} />)}{/arrow/.test(text) && <path d={`M130 ${/green/.test(text) ? 123 : /yellow/.test(text) ? 75 : 27}H110m0 0l8-8m-8 8l8 8`} stroke={color} strokeWidth="4" fill="none" />}{/walking person|pedestrian/.test(text) && <text x="120" y="130" textAnchor="middle" fontSize="27" fill="var(--exam-road-white)">{/hand|don't walk/.test(text) ? "✋" : "🚶"}</text>}</>}
    </svg> : marking ? <svg viewBox="0 0 260 150" className="h-36 w-64" aria-hidden="true">
      <rect x="10" y="5" width="240" height="140" rx="8" fill="var(--exam-road-asphalt)" />
      {/curb/.test(text) ? <path d="M30 120H230" stroke={color} strokeWidth="18" /> : /crosswalk|limit line/.test(text) ? <>{[45, 80, 115, 150, 185].map(x => <rect key={x} x={x} y="45" width="18" height="75" fill="var(--exam-road-white)" />)}<path d="M25 25H235" stroke="var(--exam-road-white)" strokeWidth="7" /></> : <><path d="M120 10V140" stroke={/white|bike|bicycle|sharrow/.test(text) ? "var(--exam-road-white)" : "var(--exam-road-yellow)"} strokeWidth="5" strokeDasharray={/broken|dashed/.test(text) ? "16 12" : undefined} />{/double|parallel/.test(text) && <path d="M132 10V140" stroke="var(--exam-road-yellow)" strokeWidth="5" />}{/bike|bicycle|sharrow/.test(text) && <><circle cx="185" cy="100" r="12" fill="none" stroke="var(--exam-road-white)" strokeWidth="3" /><circle cx="225" cy="100" r="12" fill="none" stroke="var(--exam-road-white)" strokeWidth="3" /><path d="M185 100l15-25 12 25h-27l12-18h15l13 18M193 73h15M216 70h9" fill="none" stroke="var(--exam-road-white)" strokeWidth="3" /></>}</>}
    </svg> : <SignVisual s={signSpec} size={140} />}
  </div>;
}