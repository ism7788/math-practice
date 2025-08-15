'use client';
import React from 'react';

export default function GridFraction({
  rows, cols, shaded,
  fill = '#ef4444', // red
  stroke = '#111827',
  size = 160,
}: { rows: number; cols: number; shaded: number; fill?: string; stroke?: string; size?: number; }) {
  const cellW = size / cols, cellH = size / rows;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="fraction grid">
      <rect x="0" y="0" width={size} height={size} fill="white" stroke={stroke} />
      {[...Array(rows * cols)].map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const x = c * cellW, y = r * cellH;
        const isShaded = i < shaded;
        return (
          <g key={i}>
            {isShaded && <rect x={x+1} y={y+1} width={cellW-2} height={cellH-2} fill={fill} opacity={0.8} />}
            <rect x={x} y={y} width={cellW} height={cellH} fill="none" stroke={stroke} strokeWidth={1}/>
          </g>
        );
      })}
    </svg>
  );
}
