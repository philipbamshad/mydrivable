type Shape =
  | "octagon"
  | "triangle-down"
  | "diamond"
  | "circle"
  | "pennant"
  | "rect"
  | "pentagon";

export type SignSpec = {
  shape: Shape;
  fill: string;
  stroke: string;
  letters?: string;
  /** Draw a horizontal white bar across the sign (e.g. Do Not Enter, Wrong Way). */
  bar?: boolean;
  /** Force text color; defaults to auto (white on dark fills, black otherwise). */
  textColor?: string;
};

function autoTextColor(spec: SignSpec): string {
  if (spec.textColor) return spec.textColor;
  // Dark fills: white text; light fills: black text.
  const dark = ["#dc2626", "#b91c1c", "#000", "#000000", "#0f172a", "#1e293b"];
  return dark.includes(spec.fill.toLowerCase()) ? "#fff" : "#000";
}

export function SignVisual({ s, size = 140 }: { s: SignSpec; size?: number }) {
  const textColor = autoTextColor(s);
  const textY = s.bar ? 78 : 55;
  const fontSize = s.letters
    ? s.letters.length > 10
      ? 8
      : s.letters.length > 6
        ? 10
        : s.letters.length > 3
          ? 14
          : 22
    : 18;

  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {s.shape === "octagon" && (
          <polygon
            points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill={s.fill}
            stroke={s.stroke}
            strokeWidth="3"
          />
        )}
        {s.shape === "triangle-down" && (
          <polygon points="5,15 95,15 50,92" fill={s.fill} stroke={s.stroke} strokeWidth="4" />
        )}
        {s.shape === "diamond" && (
          <polygon points="50,5 95,50 50,95 5,50" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "pentagon" && (
          <polygon
            points="50,5 95,35 80,95 20,95 5,35"
            fill={s.fill}
            stroke={s.stroke}
            strokeWidth="3"
          />
        )}
        {s.shape === "circle" && (
          <circle cx="50" cy="50" r="45" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "pennant" && (
          <polygon points="5,15 95,40 5,65" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "rect" && (
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="4"
            fill={s.fill}
            stroke={s.stroke}
            strokeWidth="3"
          />
        )}

        {/* Horizontal white bar (Do Not Enter, Wrong Way) */}
        {s.bar && <rect x="18" y="44" width="64" height="14" rx="2" fill="#fff" />}

        {s.letters && (
          <text
            x="50"
            y={textY}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="800"
            fill={textColor}
            style={{ fontFamily: "system-ui" }}
          >
            {s.letters}
          </text>
        )}
      </svg>
    </div>
  );
}
