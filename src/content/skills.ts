// Central list you can edit anytime.
// Add/remove items below—no other code changes needed.

export type Skill = {
  id: string;      // stable id used in URLs
  title: string;   // button title
  grade: number;   // used to filter for a student
};

export const SKILLS: Skill[] = [
  { id: 'g4-fractions-equivalent', title: 'Equivalent Fractions', grade: 4 },
  { id: 'g5-triangles-classification', title: 'Classify Triangles', grade: 5 },
  { id: 'g6-decimals-compare', title: 'Compare Decimals', grade: 6 },
  { id: 'g7-proportions-intro', title: 'Intro to Proportions', grade: 7 },
  
  { id: 'g4-triangles-classify', title: 'Classify Triangles (sides)', grade: 4 },


  { id: 'g4-add-100', title: 'Addition within 100', grade: 4 },
  { id: 'g4-perimeter', title: 'Perimeter (rectangles & triangles)', grade: 4 },



  // ↑ Add more like:
  // { id: 'g7-proportions-intro', title: 'Intro to Proportions', grade: 7 },
];

export const skillHref = (id: string) => `/skill/${id}`;
