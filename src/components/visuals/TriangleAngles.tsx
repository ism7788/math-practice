'use client';
import React from 'react';

type Kind = 'right' | 'acute' | 'obtuse';

export default function TriangleAngles({
  type,
  color = '#10b981',
  size = 220,
  showLabels = false, // set true if you want small degree labels
}: {
  type: Kind;
  color?: string;
  size?: number;
  showLabels?: boolean;
}) {
  // Base points (we pick simple layouts so it's readable)
  const Ax = 20, Ay = size * 0.8;
  const Bx = size - 20, By = size * 0.8;
  let Cx = size * 0.55, Cy = size * 0.2;

  // Make the shape match the requested type
  if (type === 'right') {
    // right angle near A
    Cx = Ax + 0;    // vertical above A
    Cy = size * 0.35;
  } else if (type === 'obtuse') {
    // obtuse near B (pulled inward)
    Cx = size * 0.7;
    Cy = size * 0.35;
  } else {
    // acute: slightly higher C
    Cx = size * 0.52;
    Cy = size * 0.24;
  }

  // --- geometry helpers
  const ang = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
    // angle at B of triangle ABC
    const abx = ax - bx, aby = ay - by;
    const cbx = cx - bx, cby = cy - by;
    const dot = abx * cbx + aby * cby;
    const la = Math.hypot(abx, aby);
    const lc = Math.hypot(cbx, cby);
    let theta = Math.acos(Math.min(1, Math.max(-1, dot / (la * lc))));
    return (theta * 180) / Math.PI; // degrees
  };

  const angleA = ang(Bx, By, Ax, Ay, Cx, Cy);
  const angleB = ang(Ax, Ay, Bx, By, Cx, Cy);
  const angleC = ang(Ax, Ay, Cx, Cy, Bx, By);

  // Which vertex is “special”?
  const rightAt =
    Math.abs(angleA - 90) < 3 ? 'A' :
    Math.abs(angleB - 90) < 3 ? 'B' :
    Math.abs(angleC - 90) < 3 ? 'C' : null;

  const obtuseAt =
    angleA > 90 ? 'A' :
    angleB > 90 ? 'B' :
    angleC > 90 ? 'C' : null;

  // Arc path (interior angle at vertex P with legs toward U and V)
  function arcPath(
    px: number, py: number,
    ux: number, uy: number,
    vx: number, vy: number,
    r: number
  ) {
    const a1 = Math.atan2(uy - py, ux - px);
    const a2 = Math.atan2(vy - py, vx - px);
    // choose the smaller interior sweep
    let diff = a2 - a1;
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    const start = a1;
    const end = a1 + diff;
    const x1 = px + r * Math.cos(start);
    const y1 = py + r * Math.sin(start);
    const x2 = px + r * Math.cos(end);
    const y2 = py + r * Math.sin(end);
    const largeArc = Math.abs(diff) > Math.PI / 2 ? 1 : 0; // bigger visual for obtuse
    const sweep = diff >= 0 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  }

  // Draw helpers
  const drawRightSquare = (vx: number, vy: number, legDirX: number, legDirY: number, s: number) => {
    // unit vector along one leg (normalize)
    const len = Math.hypot(legDirX, legDirY) || 1;
    const ux = (legDirX / len) * s;
    const uy = (legDirY / len) * s;
    // rotate by +90° for the other side
    const vx2 = -uy;
    const vy2 = ux;
    const p1x = vx + ux, p1y = vy + uy;
    const p2x = p1x + vx2, p2y = p1y + vy2;
    const p3x = vx + vx2, p3y = vy + vy2;
    return (
      <path
        d={`M ${vx} ${vy} L ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} Z`}
        fill="none"
        stroke={color}
      />
    );
  };

  // choose radii
  const rSmall = 18;
  const rBig = 28;

  // points
  const A = { x: Ax, y: Ay }, B = { x: Bx, y: By }, C = { x: Cx, y: Cy };

  return (
    <svg width={size} height={size * 0.9} viewBox={`0 0 ${size} ${size * 0.9}`}>
      <polygon
        points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
        fill="white"
        stroke="#111827"
      />

      {/* Acute: show small arcs at all three vertices */}
      {type === 'acute' && (
        <>
          <path d={arcPath(A.x, A.y, B.x, B.y, C.x, C.y, rSmall)} stroke={color} fill="none" />
          <path d={arcPath(B.x, B.y, A.x, A.y, C.x, C.y, rSmall)} stroke={color} fill="none" />
          <path d={arcPath(C.x, C.y, A.x, A.y, B.x, B.y, rSmall)} stroke={color} fill="none" />
        </>
      )}

      {/* Right: draw a little square at the right vertex */}
      {type === 'right' && rightAt && (
        <>
          {rightAt === 'A' &&
            drawRightSquare(A.x, A.y, B.x - A.x, B.y - A.y, 16)}
          {rightAt === 'B' &&
            drawRightSquare(B.x, B.y, A.x - B.x, A.y - B.y, 16)}
          {rightAt === 'C' &&
            drawRightSquare(C.x, C.y, A.x - C.x, A.y - C.y, 16)}
          {showLabels && (
            <text x={A.x + 22} y={A.y - 12} fontSize="12" fill={color}>90°</text>
          )}
        </>
      )}

      {/* Obtuse: big arc at obtuse vertex */}
      {type === 'obtuse' && obtuseAt && (
        <>
          {obtuseAt === 'A' && (
            <path d={arcPath(A.x, A.y, B.x, B.y, C.x, C.y, rBig)} stroke={color} fill="none" />
          )}
          {obtuseAt === 'B' && (
            <path d={arcPath(B.x, B.y, A.x, A.y, C.x, C.y, rBig)} stroke={color} fill="none" />
          )}
          {obtuseAt === 'C' && (
            <path d={arcPath(C.x, C.y, A.x, A.y, B.x, B.y, rBig)} stroke={color} fill="none" />
          )}
        </>
      )}

      {/* Optional small degree labels (off by default) */}
      {showLabels && (
        <>
          <text x={A.x + 6} y={A.y - 8} fontSize="11" fill="#6b7280">
            {Math.round(angleA)}°
          </text>
          <text x={B.x - 18} y={B.y - 8} fontSize="11" fill="#6b7280" textAnchor="end">
            {Math.round(angleB)}°
          </text>
          <text x={C.x} y={C.y + 14} fontSize="11" fill="#6b7280">
            {Math.round(angleC)}°
          </text>
        </>
      )}
    </svg>
  );
}
