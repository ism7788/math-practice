//src\components\visuals\TriangleSides.tsx
'use client';
import React from 'react';

export default function TriangleSides({a,b,c,color='#3b82f6', size=220}:{a:number;b:number;c:number;color?:string;size?:number}) {
  // base = c
  const s = size / Math.max(a,b,c) * 0.8;
  const L = c * s;
  const x = (b*b + c*c - a*a) / (2*c);   // from A along base
  const y2 = Math.max(b*b - x*x, 1e-6);
  const y = Math.sqrt(y2);
  const Ax=0, Ay=size*0.85, Bx=L, By=size*0.85, Cx=x*s, Cy=Ay - y*s;

  const mid = (x1:number,y1:number,x2:number,y2:number)=>({x:(x1+x2)/2, y:(y1+y2)/2});
  const mAB = mid(Ax,Ay,Bx,By), mBC = mid(Bx,By,Cx,Cy), mCA = mid(Cx,Cy,Ax,Ay);

  return (
    <svg width={size} height={size*0.9} viewBox={`0 0 ${size} ${size*0.9}`}>
      <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="white" stroke="#111827"/>
      <text x={mAB.x} y={mAB.y-6} fontSize="12" textAnchor="middle" fill={color}>{c}</text>
      <text x={mBC.x+8} y={mBC.y} fontSize="12" fill={color}>{a}</text>
      <text x={mCA.x-8} y={mCA.y} fontSize="12" textAnchor="end" fill={color}>{b}</text>
    </svg>
  );
}
