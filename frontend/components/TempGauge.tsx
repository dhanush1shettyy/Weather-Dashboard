"use client";

const SIZE = 240;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

interface TempGaugeProps {
  tempC: number;
  condition: string;
  iconUrl: string;
  min?: number;
  max?: number;
}

export default function TempGauge({
  tempC,
  condition,
  iconUrl,
  min = -10,
  max = 45,
}: TempGaugeProps) {
  const clamped = Math.min(Math.max(tempC, min), max);
  const pct = (clamped - min) / (max - min);
  const offset = CIRCUMFERENCE * (1 - pct);

  const ticks = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--panel-border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--brass)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>

      <svg width={SIZE} height={SIZE} className="absolute inset-0">
        {ticks.map((i) => {
          const angle = (i / ticks.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const major = i % 5 === 0;
          const rOuter = RADIUS - STROKE / 2 - 6;
          const rInner = rOuter - (major ? 9 : 5);
          const x1 = CENTER + rOuter * Math.cos(rad);
          const y1 = CENTER + rOuter * Math.sin(rad);
          const x2 = CENTER + rInner * Math.cos(rad);
          const y2 = CENTER + rInner * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-muted)"
              strokeWidth={major ? 1.5 : 1}
              opacity={major ? 0.55 : 0.25}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <img src={iconUrl} alt={condition} className="h-9 w-9 opacity-90" />
        <span className="font-mono-ui text-[42px] font-medium leading-none">
          {Math.round(tempC)}°
        </span>
        <span
          className="font-mono-ui text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--text-muted)" }}
        >
          {condition}
        </span>
      </div>
    </div>
  );
}
