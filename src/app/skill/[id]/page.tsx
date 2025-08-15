// src/app/skill/[id]/page.tsx
// Server Component: chooses which skill module to load, builds the question bank,
// and renders the client-only Player wrapper.
//
// 🧭 How to add a NEW skill (read the comments below around REGISTRY):
// 1) Create:  src/content/<grade>/<skill-id>/index.ts
//    - It must `export function buildBank(): Item[]`
//    - Each Item uses only plain data + optional VisualSpec objects (no JSX)
// 2) Add the skill to `src/content/skills.ts` so it shows on the dashboard:
//      { id: '<skill-id>', title: 'Nice Title', grade: 4 },
// 3) Add one line in the REGISTRY below to map the id to your content module.
// Done. You never touch the Player again.

import { notFound } from 'next/navigation';
import { SKILLS } from '@/content/skills';
import ClientPlayer from './ClientPlayer';
import type { Item } from '@/lib/quiz';

// ---------------------------------------------------------------
// Helpers used by the FRACTIONS fallback sample (kept here so
// the page works even if a skill id isn't registered yet).
// You do not need these in new skills; new skills live in /content.
const rnd = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a + 1)) + a;

const sample = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const colors = ['#ef4444', '#3b82f6', '#10b981'] as const;
type Color = (typeof colors)[number];

const frac = (n: number, d: number) => `\\frac{${n}}{${d}}`;

const gcd = (a: number, b: number) => {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
};

const simplify = (n: number, d: number) => {
  const g = gcd(n, d);
  return [Math.floor(n / g), Math.floor(d / g)] as const;
};

const isEquivalent = (n: number, d: number, a: number, b: number) =>
  n * b === d * a;

function uniqFracDistractors(n: number, d: number, count: number) {
  const set = new Set<string>();
  const out: { tex: string }[] = [];
  while (out.length < count) {
    const nn0 = Math.max(1, n + rnd(-2, 2));
    const dd0 = Math.max(2, d + rnd(-2, 2));
    const [sn, sd] = simplify(nn0, dd0);
    const key = `${sn}/${sd}`;
    if (isEquivalent(sn, sd, n, d) || set.has(key)) continue;
    set.add(key);
    out.push({ tex: frac(sn, sd) });
  }
  return out;
}

// ---------------------------------------------------------------
// FRACTIONS "equivalent fractions" fallback (legacy sample skill)
// Visuals are passed as SPEC OBJECTS (not JSX). The Client Player
// renders the actual SVGs.
function genEqText(level: 'easy' | 'medium' | 'hard'): Item {
  let a = 1,
    b = 2;
  if (level === 'easy') {
    a = rnd(1, 4);
    b = rnd(a + 1, 8);
  } else if (level === 'medium') {
    a = rnd(2, 8);
    b = rnd(a + 2, 12);
  } else {
    a = rnd(3, 12);
    b = rnd(a + 2, 18);
  }
  {
    const g = gcd(a, b);
    a /= g;
    b /= g;
  }

  const k = level === 'hard' ? rnd(4, 9) : rnd(2, 5);
  const correct = { tex: `\\frac{${a * k}}{${b * k}}` };

  const used = new Set<string>([`${a * k}/${b * k}`]);
  const distractors: { tex: string }[] = [];
  while (distractors.length < 3) {
    const pattern = rnd(1, 4);
    let n = a * k,
      d = b * k;

    if (pattern === 1) n = Math.max(1, n + rnd(1, Math.max(2, Math.floor(k))));
    else if (pattern === 2)
      d = Math.max(2, d + rnd(1, Math.max(2, Math.floor(k))));
    else if (pattern === 3) {
      n = a * (k + 1);
      d = b * k;
    } else {
      n = a * k;
      d = b * (k + 1);
    }

    const [sn, sd] = simplify(n, d);
    const key = `${sn}/${sd}`;
    if (isEquivalent(sn, sd, a, b) || used.has(key)) continue;
    used.add(key);
    distractors.push({ tex: `\\frac{${sn}}{${sd}}` });
  }

  return {
    id: `eq-text-${Math.random()}`,
    type: 'mc',
    stem: {
      tex: `\\text{Which fraction is equivalent to } \\frac{${a}}{${b}}\\,?`,
    },
    choices: [correct, ...distractors],
    correct: [0],
    difficulty: level === 'easy' ? 40 : level === 'medium' ? 70 : 95,
    hint: {
      tex: `\\text{Multiply numerator and denominator by the SAME number.}`,
    },
    explain: {
      tex: `\\text{Multiply top & bottom by } ${k}:\\; \\frac{${a}}{${b}}=\\frac{${a * k}}{${b * k}}.`,
    },
  };
}

function genEqGrid(level: 'easy' | 'medium' | 'hard'): Item {
  const rows = level === 'easy' ? 2 : level === 'medium' ? 3 : rnd(3, 4);
  const cols = level === 'easy' ? 2 : level === 'medium' ? 4 : rnd(4, 5);
  const total = rows * cols;
  const shaded = rnd(1, total - 1);
  const [n, d] = simplify(shaded, total);
  const color: Color = sample(colors);

  return {
    id: `eq-grid-${Math.random()}`,
    type: 'image-mc',
    visual: { kind: 'grid', rows, cols, shaded, color }, // SPEC
    stem: { text: 'What fraction of the grid is shaded?' },
    choices: [{ tex: frac(n, d) }, ...uniqFracDistractors(n, d, 3)],
    correct: [0],
    difficulty: level === 'easy' ? 30 : level === 'medium' ? 60 : 90,
    hint: {
      tex: `\\text{Count shaded squares (numerator) and total squares (denominator).}`,
    },
    explain: {
      tex: `\\text{Shaded}=${shaded}\\,,\\; \\text{total}=${total}\\Rightarrow ${frac(
        shaded,
        total
      )}= ${frac(n, d)}.`,
    },
  };
}

function genEqCircle(level: 'easy' | 'medium' | 'hard'): Item {
  const parts = level === 'easy' ? 2 : level === 'medium' ? 4 : [6, 8, 10, 12][rnd(0, 3)];
  const shaded = rnd(1, parts - 1);
  const [n, d] = simplify(shaded, parts);
  const color: Color = sample(colors);

  return {
    id: `eq-circle-${Math.random()}`,
    type: 'image-mc',
    visual: { kind: 'circle', parts, shaded, color }, // SPEC
    stem: { text: 'What fraction of the circle is shaded?' },
    choices: [{ tex: frac(n, d) }, ...uniqFracDistractors(n, d, 3)],
    correct: [0],
    difficulty: level === 'easy' ? 35 : level === 'medium' ? 65 : 92,
    hint: { tex: `\\text{Each slice is } ${frac(1, parts)}\\text{. Count shaded slices.}` },
    explain: { tex: `\\text{Shaded}=${shaded}\\,,\\; \\text{parts}=${parts}\\Rightarrow ${frac(n, d)}.` },
  };
}

function buildFractionsBank(): Item[] {
  const levels: ('easy'|'medium'|'hard')[] = ['easy','easy','medium','medium','hard','hard'];
  const out: Item[] = [];
  for (const lv of levels) out.push(genEqText(lv), genEqGrid(lv), genEqCircle(lv));
  return out.slice(0, 12);
}
// ---------------------------------------------------------------

// 🔌 Skill loader registry
// Map skill-id -> dynamic import that exposes `buildBank()`.
// 👉 When you add a new skill module in /content, add ONE line here.
const REGISTRY: Record<string, () => Promise<{ buildBank: () => Item[] }>> = {
  'g4-triangles-classify': () => import('@/content/g4/triangles-classify'),
  'g4-add-100':            () => import('@/content/g4/add-100'),
  'g4-perimeter':          () => import('@/content/g4/perimeter'),
  // ⬆️ Add future skills like:
  // 'g4-multiplication-1digit': () => import('@/content/g4/multiplication-1digit'),
  // 'g5-decimals-add-sub':     () => import('@/content/g5/decimals-add-sub'),
};

export default async function SkillPage({
  params,
}: {
  // Next 15 dynamic route params are async (await them)
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Look up metadata (title/grade) from the catalog
  const skill = SKILLS.find((s) => s.id === id);
  if (!skill) notFound();

  // Load content module if registered; otherwise use the FRACTIONS fallback.
  let items: Item[];
  const loader = REGISTRY[id];
  if (loader) {
    const mod = await loader();
    items = mod.buildBank(); // ← content modules must export buildBank(): Item[]
  } else {
    // Fallback demo so the page never 404s for an unregistered id.
    items = buildFractionsBank();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ClientPlayer items={items} title={skill.title} />
    </div>
  );
}
