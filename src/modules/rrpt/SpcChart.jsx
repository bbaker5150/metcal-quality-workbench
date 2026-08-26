import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
} from 'recharts';

// ---------------------------------------------------------------------------
// Cross-site SPC for one artifact.
// ---------------------------------------------------------------------------
// Plotted in z rather than engineering units, which is what makes a single
// chart legible across artifacts measured in ohms, volts, and degrees: z is
// already normalised by sigma_pt, so the ±2 and ±3 lines mean the same thing
// on every series. The signed z is used here even though the tiers are set on
// |z| — direction is the whole diagnostic value of the plot, since a lab
// reading consistently high is a different problem from one that scatters.

const BANDS = [
  { y1: -2, y2: 2, fill: 'var(--color-pass-600)', opacity: 0.07 },
  { y1: 2, y2: 3, fill: 'var(--color-evaluate-600)', opacity: 0.09 },
  { y1: -3, y2: -2, fill: 'var(--color-evaluate-600)', opacity: 0.09 },
];

const POINT_FILL = {
  PASS: 'var(--color-pass-600)',
  EVALUATE: 'var(--color-evaluate-600)',
  FAIL: 'var(--color-fail-600)',
};

function Dot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6.5} fill={POINT_FILL[payload.status]} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={3.5} fill={POINT_FILL[payload.status]} />
    </g>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="surface rounded-lg px-3 py-2 text-[0.76rem] shadow-md">
      <p className="font-semibold">{p.site}</p>
      <p className="muted tnum mt-0.5">z = {p.z.toFixed(2)} · {p.status}</p>
      <p className="muted tnum">{p.average} {p.unit}</p>
      <p className="muted mt-0.5">{p.date}</p>
    </div>
  );
}

export default function SpcChart({ points, unit }) {
  // A signed z beyond the plotted window would vanish silently, so the domain
  // opens up to contain the worst point rather than clipping it.
  const worst = points.reduce((m, p) => Math.max(m, Math.abs(p.z)), 3);
  const bound = Math.ceil(worst + 0.5);

  return (
    <div>
      {/* The chart gets its own fixed box. Recharts needs a measurable height
          to draw into at all, and anything sharing that box overflows it —
          the caption used to land on top of the footer below. */}
      <div className="h-60 px-2 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          {BANDS.map((b) => (
            <ReferenceArea
              key={`${b.y1}:${b.y2}`}
              y1={b.y1} y2={b.y2}
              fill={b.fill} fillOpacity={b.opacity}
              stroke="none" ifOverflow="hidden"
            />
          ))}
          <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="site"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border-subtle)' }}
            tickLine={false}
          />
          <YAxis
            domain={[-bound, bound]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={34}
            label={{ value: 'z', angle: 0, position: 'insideTopLeft', fontSize: 11, fill: 'var(--text-muted)' }}
          />
          <ReferenceLine y={0} stroke="var(--text-muted)" strokeOpacity={0.45} />
          {[2, -2].map((y) => (
            <ReferenceLine key={y} y={y} stroke="var(--color-evaluate-600)" strokeDasharray="4 3" strokeOpacity={0.7} />
          ))}
          {[3, -3].map((y) => (
            <ReferenceLine key={y} y={y} stroke="var(--color-fail-600)" strokeDasharray="4 3" strokeOpacity={0.7} />
          ))}
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-subtle)' }} />
          <Line
            type="linear" dataKey="z" stroke="var(--color-signal-500)" strokeWidth={1.5}
            dot={false} activeDot={false} isAnimationActive={false} legendType="none"
          />
          <Scatter dataKey="z" shape={<Dot />} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
      <p className="muted px-5 pb-3 pt-2 text-[0.72rem] leading-relaxed">
        Signed z against σ<sub>pt</sub>. Dashed lines are the ±2 evaluate and ±3 fail limits;
        {' '}{unit} readings normalised.
      </p>
    </div>
  );
}
