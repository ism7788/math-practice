// src/content/g4/perimeter/index.ts
import type { Item } from '@/lib/quiz';

const rnd = (a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;

function rectItem(level:'easy'|'medium'|'hard'): Item {
  const L = level==='easy' ? rnd(2,12) : level==='medium' ? rnd(5,18) : rnd(10,25);
  const W = level==='easy' ? rnd(2,12) : level==='medium' ? rnd(5,18) : rnd(8,20);
  const P = 2*(L+W);

  const choices = [
    { text: String(P) },
    { text: String(2*L+W) },
    { text: String(L+2*W) },
    { text: String(2*(L+W)+2) },
  ];

  return {
    id:`peri-rect-${level}-${L}-${W}`,
    type:'mc',
    stem:{ text:`Find the perimeter of a rectangle with length ${L} and width ${W}.` },
    choices,
    correct:[0],
    difficulty: level==='easy'?35: level==='medium'?65:90,
    hint:{ text:'Perimeter of rectangle: P = 2(L + W).' },
    explain:{ text:`P = 2(${L}+${W}) = 2×${L+W} = ${P}.` },
  };
}

function triItem(level:'easy'|'medium'|'hard'): Item {
  let a=3,b=4,c=5;
  do {
    a = level==='easy' ? rnd(2,10) : level==='medium' ? rnd(4,14) : rnd(6,20);
    b = level==='easy' ? rnd(2,10) : level==='medium' ? rnd(4,14) : rnd(6,20);
    c = level==='easy' ? rnd(2,10) : level==='medium' ? rnd(4,14) : rnd(6,20);
  } while (!(a+b>c && a+c>b && b+c>a));

  const P = a+b+c;
  const choices = [
    { text: String(P) },
    { text: String(P+2) },
    { text: String(P-1) },
    { text: String(a+b*2) },
  ];

  return {
    id:`peri-tri-${level}-${a}-${b}-${c}`,
    type:'mc',
    stem:{ text:`Find the perimeter of a triangle with side lengths ${a}, ${b}, and ${c}.` },
    choices,
    correct:[0],
    difficulty: level==='easy'?40: level==='medium'?70:95,
    hint:{ text:'Perimeter is the sum of all side lengths.' },
    explain:{ text:`P = ${a} + ${b} + ${c} = ${P}.` },
  };
}

export function buildBank(): Item[] {
  const items: Item[] = [];
  const lvls: ('easy'|'medium'|'hard')[] = ['easy','easy','medium','medium','hard','hard'];
  for (const lv of lvls) items.push(rectItem(lv), triItem(lv));
  return items;
}
