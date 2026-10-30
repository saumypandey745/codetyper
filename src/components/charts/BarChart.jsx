import React from 'react';

export function BarChart({
  data = [],
  labelKey = 'language',
  valueKey = 'avg_wpm',
  height = 240,
  unit = 'WPM'
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No language breakdown available yet.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {data.slice(0, 7).map((item, idx) => {
        const val = item[valueKey] || 0;
        const percent = Math.min(100, Math.round((val / maxVal) * 100));

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item[labelKey]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary-forest)' }}>
                {val} {unit}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary-sage), var(--color-primary-forest))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
