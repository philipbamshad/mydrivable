type Shape = "octagon" | "triangle-down" | "diamond" | "circle" | "pennant" | "rect" | "pentagon";

export type SignSymbol = "merge" | "crossroad" | "curve" | "curve-speed" | "deer" | "truck-grade" | "truck" | "slippery" | "two-way" | "roundabout" | "school" | "pedestrian";

export type SignSpec = {
  shape: Shape;
  fill: string;
  stroke: string;
  /** Sign text; use "\n" for explicit line breaks. */
  letters?: string;
  /** Pictogram drawn in the sign's text color. */
  symbol?: SignSymbol;
  /** Draw a horizontal white bar across the sign (e.g. Do Not Enter, Wrong Way). */
  bar?: boolean;
  /** Force text color; defaults to auto (white on dark fills, black otherwise). */
  textColor?: string;
};

function autoTextColor(spec: SignSpec): string {
  if (spec.textColor) return spec.textColor;
  const dark = ["#dc2626", "#b91c1c", "#000", "#000000", "#0f172a", "#1e293b"];
  return dark.includes(spec.fill.toLowerCase()) ? "#fff" : "#000";
}

function wrap(letters: string): string[] {
  if (letters.includes("\n") || letters.length <= 8) return letters.split("\n");
  const lines: string[] = [];
  for (const word of letters.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= 9) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  return lines;
}

function Symbol({ name, ink }: { name: SignSymbol; ink: string }) {
  const s = { fill: "none", stroke: ink, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "merge": return <g {...s}><path d="M57 74V30M49 38l8-9 8 9" /><path d="M38 72c0-12 6-18 19-26" /></g>;
    case "crossroad": return <g {...s} strokeWidth={7} strokeLinecap="butt"><path d="M50 26V74M26 50H74" /></g>;
    case "curve": return <g {...s}><path d="M44 74V60c0-10 12-12 12-22v-8M48 36l8-9 8 9" /></g>;
    case "curve-speed": return <g><g {...s} strokeWidth={4.5}><path d="M45 58V50c0-8 10-10 10-18v-6M48 31l7-8 7 8" /></g><rect x="36" y="62" width="28" height="13" rx="2" fill="var(--exam-road-white)" stroke={ink} strokeWidth="1.5" /><text x="50" y="72" textAnchor="middle" fontSize="8" fontWeight="800" fill={ink} style={{ fontFamily: "system-ui" }}>35 MPH</text></g>;
    case "two-way": return <g {...s}><path d="M41 72V30M33 38l8-9 8 9M59 28v42M51 62l8 9 8-9" /></g>;
    case "roundabout": return <g {...s} strokeWidth={4.5}><path d="M50 34a16 16 0 0 1 14 8M64 58a16 16 0 0 1-14 8M36 58a16 16 0 0 1 0-16" /><path d="M58 36l6 6-8 1M56 68l-6-2 4-6M32 46l4-4 4 5" /></g>;
    case "slippery": return <g fill={ink}><rect x="38" y="30" width="24" height="15" rx="4" /><rect x="35" y="42" width="30" height="8" rx="2" /><circle cx="41" cy="51" r="3.5" /><circle cx="59" cy="51" r="3.5" /><path d="M40 58c-5 4 5 8 0 13M60 58c5 4-5 8 0 13" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" /></g>;
    case "deer": return <g fill={ink}><path d="M30 52c6-6 18-8 28-6l8-8 4 2-2 4 6 2-2 3-6-1-4 8 6 12-4 1-7-10-12 2-6 10-4-1 4-11-6-4z" /><path d="M66 38l-3-8M66 38l4-7M69 35l5-3" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" /></g>;
    case "truck-grade": return <g><path d="M28 70L72 56" stroke={ink} strokeWidth="3" /><g fill={ink} transform="rotate(-18 50 50)"><rect x="34" y="42" width="24" height="13" /><rect x="58" y="46" width="9" height="9" rx="1" /><circle cx="40" cy="57" r="3" /><circle cx="62" cy="57" r="3" /></g><text x="50" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink} style={{ fontFamily: "system-ui" }}>8%</text></g>;
    case "truck": return <g fill={ink}><rect x="26" y="28" width="32" height="20" /><path d="M58 34h10l6 7v7H58z" /><circle cx="34" cy="51" r="4" /><circle cx="66" cy="51" r="4" /></g>;
    case "school": return <g fill={ink}><circle cx="42" cy="38" r="5" /><circle cx="60" cy="42" r="4.5" /><path d="M38 46h8l3 14-3 1 0 14h-3l-1-12-1 12h-3V61l-3-1zM56 50h8l2 12-3 1v12h-3l-1-10-1 10h-3V63l-2-1z" /></g>;
    case "pedestrian": return <g fill={ink}><circle cx="52" cy="30" r="5" /><path d="M47 38h8l5 14-3 1-3-8-1 10 6 15-4 2-6-14-5 14-4-2 5-16 1-9-4 6-3-2z" /></g>;
  }
}

export function SignVisual({ s, size = 140 }: { s: SignSpec; size?: number }) {
  const textColor = autoTextColor(s);
  const lines = s.letters ? (s.bar ? [s.letters] : wrap(s.letters)) : [];
  const maxLen = Math.max(1, ...lines.map(l => l.length));
  const width = s.shape === "diamond" || s.shape === "triangle-down" ? 52 : s.shape === "pennant" ? 46 : 74;
  const fontSize = s.bar ? (s.letters!.length > 10 ? 8 : 10) : Math.min(22, Math.floor((width / maxLen) * 1.7), Math.floor((s.shape === "diamond" ? 48 : 72) / lines.length / 1.1));
  const lineHeight = fontSize * 1.1;
  const centerY = s.shape === "triangle-down" ? 40 : s.shape === "pennant" ? 42 : 50;
  const firstY = s.bar ? 78 : centerY - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.36;
  const textX = s.shape === "pennant" ? 38 : 50;
  const withSymbolText = s.symbol && lines.length > 0;

  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {s.shape === "octagon" && <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.shape === "triangle-down" && <polygon points="5,15 95,15 50,92" fill={s.fill} stroke={s.stroke} strokeWidth="4" />}
        {s.shape === "diamond" && <polygon points="50,5 95,50 50,95 5,50" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.shape === "pentagon" && <polygon points="50,5 95,35 95,95 5,95 5,35" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.shape === "circle" && <circle cx="50" cy="50" r="45" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.shape === "pennant" && <polygon points="3,18 97,50 3,82" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.shape === "rect" && <rect x="10" y="6" width="80" height="88" rx="4" fill={s.fill} stroke={s.stroke} strokeWidth="3" />}
        {s.bar && <rect x="18" y="44" width="64" height="14" rx="2" fill="#fff" />}
        {s.symbol && <Symbol name={s.symbol} ink={textColor} />}
        {withSymbolText ? (
          <text x="50" y="80" textAnchor="middle" fontSize="11" fontWeight="800" fill={textColor} style={{ fontFamily: "system-ui" }}>{lines.join(" ")}</text>
        ) : lines.length > 0 && (
          <text textAnchor="middle" fontSize={fontSize} fontWeight="800" fill={textColor} style={{ fontFamily: "system-ui" }}>
            {lines.map((line, i) => <tspan key={i} x={textX} y={firstY + i * lineHeight}>{line}</tspan>)}
          </text>
        )}
      </svg>
    </div>
  );
}
