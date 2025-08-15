// Generic quiz item + visual specs shared by server/content/client

export type GridSpec = {
  kind: 'grid';
  rows: number;
  cols: number;
  shaded: number;
  color: string;
};

export type CircleSpec = {
  kind: 'circle';
  parts: number;
  shaded: number;
  color: string;
};

export type TriSidesSpec = {
  kind: 'triangle-sides';
  a: number;
  b: number;
  c: number;
  color: string;
};

export type TriAnglesSpec = {
  kind: 'triangle-angles';
  type: 'right' | 'acute' | 'obtuse';
  color: string;
};

export type VisualSpec = GridSpec | CircleSpec | TriSidesSpec | TriAnglesSpec;

export type Choice = { text?: string; tex?: string };

export type Item = {
  id: string;
  type: 'mc' | 'image-mc';
  stem: { text?: string; tex?: string };
  choices: Choice[];
  correct: number[];          // indices into choices
  difficulty: number;         // 0..100
  explain?: { text?: string; tex?: string };
  hint?: { text?: string; tex?: string };
  visual?: VisualSpec;        // IMPORTANT: spec object only (no JSX)
};
