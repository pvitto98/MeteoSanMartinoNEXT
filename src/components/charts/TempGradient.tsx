import { tempColor } from "@/lib/format";

/** Vertical gradient that colours a line by the temperature it represents. */
export function TempGradient({ id, yOf, min, max, opacity = 1 }: { id: string; yOf: (t: number) => number; min: number; max: number; opacity?: number }) {
  const steps = 6;
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={yOf(max)} y2={yOf(min)}>
      {Array.from({ length: steps + 1 }, (_, i) => {
        const t = max - ((max - min) * i) / steps;
        return <stop key={i} offset={i / steps} stopColor={tempColor(t)} stopOpacity={opacity} />;
      })}
    </linearGradient>
  );
}
