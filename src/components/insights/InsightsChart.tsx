import { useState } from "react";

interface Props {
  bars: number[];
  labels: string[];
}

const VB_W = 800;
const VB_H = 200;

export function InsightsChart({ bars, labels }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const n    = bars.length;
  const gap  = VB_W * 0.008;
  const barW = (VB_W - gap * (n - 1)) / n;
  const maxVal = Math.max(...bars, 1);

  return (
    <div className="bg-[#111] rounded-xl px-5 pt-5 pb-2 mb-8" data-test="insights-chart">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H + 28}`}
        width="100%"
        className="overflow-visible"
        aria-label="Insights bar chart"
      >
        {[0, Math.round(maxVal / 2), maxVal].map((v, i) => (
          <text key={i} x={4} y={VB_H * (1 - v / maxVal) - 4} fill="#fff" fontSize={9}>
            {v}
          </text>
        ))}

        {bars.map((val, i) => {
          const barH = (val / maxVal) * VB_H;
          const x    = i * (barW + gap);
          const isHov = hoveredBar === i;
          const fill  = isHov ? "#ff5500" : i === n - 1 ? "#ff5500" : "#333";
          return (
            <g key={i}>
              <rect
                x={x} y={VB_H - barH}
                width={barW} height={Math.max(barH, 1)}
                fill={fill} rx={2}
                style={{ cursor: "pointer", transition: "fill 0.15s" }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              {isHov && val > 0 && (
                <text
                  x={x + barW / 2} y={VB_H - barH - 5}
                  fill="white" fontSize={9} textAnchor="middle"
                >
                  {val}
                </text>
              )}
            </g>
          );
        })}

        {labels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={i * (barW + gap) + barW / 2}
              y={VB_H + 18}
              fill="#fff" fontSize={9} textAnchor="middle"
            >
              {label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
