import type { Item } from '@/app/skill/[id]/player';
import rawCfg from './config.json';

type Level = 'easy' | 'medium' | 'hard';
type SideKind = 'equilateral' | 'isosceles' | 'scalene';
type AngleKind = 'acute' | 'right' | 'obtuse';

type Config = {
  count?: number;
  minSide?: number;
  maxSide?: number;
  withVisualAt?: 'never' | 'always' | 'medium+';
  mix?: { sides?: number; angles?: number };
};

const cfg: Config = (rawCfg as Config) ?? {};
const COUNT = cfg.count ?? 12;
const MIN_SIDE = cfg.minSide ?? 2;
const MAX_SIDE = cfg.maxSide ?? 12;
const MIX_SIDES = cfg.mix?.sides ?? 0.5;   // angles weight = 1 - MIX_SIDES
const VISUAL_RULE = cfg.withVisualAt ?? 'medium+';

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const colors = ['#ef4444', '#3b82f6', '#10b981'] as const;

const useVisualFor = (lv: Level) => VISUAL_RULE === 'always' ? true : VISUAL_RULE === 'never' ? false : lv !== 'easy';

/* Sides */
function genSides(level: Level): { a: number; b: number; c: number; kind: SideKind } {
  const kind = (level === 'easy'
    ? pick(['equilateral', 'isosceles', 'scalene'] as const)
    : pick(['isosceles', 'scalene', 'equilateral'] as const)
  ) as SideKind;

  let a = 3, b = 4, c = 5;

  if (kind === 'equilateral') {
    a = b = c = rnd(MIN_SIDE, Math.min(MAX_SIDE, 8));
  } else if (kind === 'isosceles') {
    a = b = rnd(MIN_SIDE, MAX_SIDE - 1);
    c = rnd(Math.max(MIN_SIDE, a - 1), Math.min(MAX_SIDE, a + a - 1));
    if (c === a) c = Math.max(MIN_SIDE, a - 1);
  } else {
    do { a = rnd(MIN_SIDE, MAX_SIDE); b = rnd(MIN_SIDE, MAX_SIDE); c = rnd(MIN_SIDE, MAX_SIDE); }
    while (new Set([a, b, c]).size < 3 || !(a + b > c && a + c > b && b + c > a));
  }

  if (!(a + b > c && a + c > b && b + c > a)) return genSides(level);
  return { a, b, c, kind };
}

function sidesItem(lv: Level, idx: number): Item {
  const s = genSides(lv);
  const correctIdx = s.kind === 'equilateral' ? 0 : s.kind === 'isosceles' ? 1 : 2;
  const useVisual = useVisualFor(lv);
  const color = pick(colors);

  return {
    id: `tri-sides-${idx}`,
    type: 'mc',
    visual: useVisual ? { kind:'triangle-sides', a:s.a, b:s.b, c:s.c, color } : undefined, // SPEC
    stem: useVisual
      ? { text: 'Classify the triangle by its sides.' }
      : { text: `Classify the triangle with side lengths ${s.a}, ${s.b}, and ${s.c}.` },
    choices: ['Equilateral', 'Isosceles', 'Scalene'].map((text) => ({ text })),
    correct: [correctIdx],
    difficulty: lv === 'easy' ? 35 : lv === 'medium' ? 65 : 92,
    hint: { text: 'Equilateral: all equal. Isosceles: two equal. Scalene: all different.' },
    explain: { text: `Sides ${s.a}, ${s.b}, ${s.c} → ${['Equilateral', 'Isosceles', 'Scalene'][correctIdx]}.` },
  };
}

/* Angles */
function genAngles(level: Level): { A: number; B: number; C: number; kind: AngleKind } {
  let A = 60, B = 60, C = 60;
  let kind: AngleKind = (level === 'easy'
    ? pick(['right', 'acute', 'obtuse'] as const)
    : pick(['acute', 'obtuse', 'right'] as const)
  );

  if (kind === 'right') {
    const rightAt = pick(['A', 'B', 'C'] as const);
    const x = rnd(20, 70), y = 90 - x;
    if (rightAt === 'A') { A = 90; B = x; C = y; }
    if (rightAt === 'B') { B = 90; A = x; C = y; }
    if (rightAt === 'C') { C = 90; A = x; B = y; }
  } else if (kind === 'acute') {
    A = rnd(40, 80); B = rnd(40, 80); C = 180 - A - B;
    if (C <= 20 || C >= 120 || A >= 90 || B >= 90 || C >= 90) return genAngles(level);
  } else {
    const big = rnd(91, 120);
    const rest = 180 - big;
    const x = rnd(30, rest - 30);
    const y = rest - x;
    A = big; B = x; C = y;
  }
  return { A, B, C, kind };
}

function anglesItem(lv: Level, idx: number): Item {
  const a = genAngles(lv);
  const correctIdx = a.kind === 'acute' ? 0 : a.kind === 'right' ? 1 : 2;
  const useVisual = useVisualFor(lv);
  const color = pick(colors);

  return {
    id: `tri-angles-${idx}`,
    type: 'mc',
    visual: useVisual ? { kind:'triangle-angles', type: a.kind, color } : undefined, // SPEC
    stem: useVisual
      ? { text: 'Classify the triangle by its angles.' }
      : { text: `Classify the triangle with angles ${a.A}°, ${a.B}°, and ${a.C}°.` },
    choices: ['Acute', 'Right', 'Obtuse'].map((text) => ({ text })),
    correct: [correctIdx],
    difficulty: lv === 'easy' ? 35 : lv === 'medium' ? 65 : 92,
    hint: { text: 'Acute: all < 90°. Right: one = 90°. Obtuse: one > 90°.' },
    explain: { text: `Angles ${a.A}°, ${a.B}°, ${a.C}° → ${['Acute','Right','Obtuse'][correctIdx]}.` },
  };
}

/* Bank */
export function buildBank(): Item[] {
  const levels: Level[] = ['easy','easy','medium','medium','hard','hard'];
  const want = Math.max(1, COUNT);
  const sidesWeight = Math.max(0, Math.min(1, MIX_SIDES));

  const items: Item[] = [];
  let i = 0;
  while (items.length < want) {
    const lv = levels[i % levels.length];
    const type = Math.random() < sidesWeight ? 'sides' : 'angles';
    items.push(type === 'sides' ? sidesItem(lv, i) : anglesItem(lv, i));
    i++;
  }
  return items;
}
