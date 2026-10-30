import React, { useState } from 'react';

export function LineChart({
  data = [],
  xKey = 'label',
  yKey = 'value',
  secondaryYKey = null,
  height = 220,
  unit = 'WPM'
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No performance records yet. Complete a session to see your progress chart!
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 600; // SVG viewBox width

  const yValues = data.map((d) => d[yKey] || 0);
  const minY = Math.max(0, Math.floor(Math.min(...yValues) * 0.8));
  const maxY = Math.max(40, Math.ceil(Math.max(...yValues) * 1.15));

  const getX = (index) => {
    if (data.length <= 1) return padding.left + (width - padding.left - padding.right) / 2;
    return padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val) => {
    const range = maxY - minY || 1;
    return height - padding.bottom - ((val - minY) / range) * (height - padding.top - padding.bottom);
  };

  // Build SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d[yKey])}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - padding.bottom} L ${getX(0)},${height - padding.bottom} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="peacefulLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-forest)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary-forest)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const val = Math.round(minY + ratio * (maxY - minY));
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border-subtle)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-text-muted)"
                fontFamily="var(--font-mono)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill area */}
        <path d={areaPath} fill="url(#peacefulLineGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-primary-forest)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d[yKey]);
          const isHovered = hoverIndex === i;

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill="var(--color-bg-surface)"
                stroke="var(--color-primary-forest)"
                strokeWidth={isHovered ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 120ms ease' }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '16px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.75rem',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.825rem',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}>
            {data[hoverIndex][yKey]} {unit}
          </div>
          {secondaryYKey && data[hoverIndex][secondaryYKey] !== undefined && (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
              Acc: {data[hoverIndex][secondaryYKey]}%
            </div>
          )}
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.725rem' }}>
            {data[hoverIndex][xKey]}
          </div>
        </div>
      )}
    </div>
  );
}
