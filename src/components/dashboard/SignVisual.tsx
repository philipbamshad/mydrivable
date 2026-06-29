type Shape = "octagon" | "triangle-down" | "diamond" | "circle" | "pennant" | "rect";

export type SignSpec = {
  shape: Shape;
  fill: string;
  stroke: string;
  letters?: string;
};

export function SignVisual({ s, size = 140 }: { s: SignSpec; size?: number }) {
  const filter = ")";
  return (
    <div className="grid place-items-center" style={{ width: size, height: size, filter }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {s.shape === "octagon" && (
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "triangle-down" && (
          <polygon points="5,15 95,15 50,92" fill={s.fill} stroke={s.stroke} strokeWidth="4" />
        )}
        {s.shape === "diamond" && (
          <polygon points="50,5 95,50 50,95 5,50" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "circle" && (
          <circle cx="50" cy="50" r="45" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "pennant" && (
          <polygon points="5,15 95,40 5,65" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "rect" && (
          <rect x="10" y="10" width="80" height="80" rx="4" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.letters && (
          <text x="50" y="55" textAnchor="middle"
            fontSize={s.letters.length > 6 ? 9 : s.letters.length > 3 ? 14 : 22}
            fontWeight="800" fill={s.stroke === "#fff" ? "#fff" : "#000"}
            style={{ fontFamily: "system-ui" }}>
            {s.letters}
          </text>
        )}
      </svg>
    </div>
  );
}
