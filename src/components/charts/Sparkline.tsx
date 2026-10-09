import { useId } from "react";
import type { SeriesPoint } from "@/lib/types";
import { downsample, scale, smoothPath, type Pt } from "./path";
import { useWidth } from "./useWidth";

/** Tiny trend line for tiles. */
export function Sparkline({ points, color = "#fff", height = 32 }: { points: SeriesPoint[]; color?: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>(140);
  const id = useId().replace(/:/g, "");
  const data = downsample(points, 60);
  const values = data.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = scale(data[0].t, data.at(-1)!.t, 2, width - 4);
  const y = scale(min, max === min ? min + 1 : max, height - 3, 3);
  const pts: Pt[] = data.map((p) => [x(p.t), y(p.v)]);
  const line = smoothPath(pts);
  const last = pts.at(-1)!;

  return (
    <div ref={ref} style={{ width: "100%" }} aria-hidden="true">
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`sp${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line}L${last[0]},${height}L${pts[0][0]},${height}Z`} fill={`url(#sp${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="2.8" fill="#fff" />
      </svg>
    </div>
  );
}
