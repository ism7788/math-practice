'use client';
import React from 'react';

export default function CircleFraction({
  parts, shaded,
  fill = '#10b981', // green
  stroke = '#111827',
  size = 160,
}: { parts: number; shaded: number; fill?: string; stroke?: string; size?: number; }) {
  const cx = size/2, cy = size/2, r = size*0.48;
  const seg = (k: number) => {
    const a0 = (2*Math.PI*k)/parts - Math.PI/2;
    const a1 = (2*Math.PI*(k+1))/parts - Math.PI/2;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="fraction circle">
      <circle cx={cx} cy={cy} r={r} fill="white" stroke={stroke}/>
      {[...Array(parts)].map((_, i) => (
        <path key={i} d={seg(i)} fill={i < shaded ? fill : 'transparent'} stroke={stroke} />
      ))}
    </svg>
  );
}
