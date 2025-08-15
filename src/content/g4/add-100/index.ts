import type { Item } from '@/lib/quiz';

const rnd = (a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;

function mkChoices(correct:number): { text: string }[] {
  const set = new Set<number>([correct]);
  const outs: { text:string }[] = [{ text: String(correct) }];
  // off-by-carry style distractors
  const cands = [correct+1, correct-1, correct+10, correct-10, correct+9, correct-9];
  for (const v of cands) {
    if (v >= 0 && !set.has(v)) { set.add(v); outs.push({ text: String(v) }); }
    if (outs.length === 4) break;
  }
  while (outs.length < 4) {
    const v = correct + rnd(-12, 12);
    if (v >= 0 && !set.has(v)) { set.add(v); outs.push({ text: String(v) }); }
  }
  return outs;
}

function addExplain(a:number,b:number) {
  const aT = Math.floor(a/10)*10, aO = a%10;
  const bT = Math.floor(b/10)*10, bO = b%10;
  return {
    tex: `\\text{Add tens and ones: } ${a}+${b}
          = (${aT}+${bT}) + (${aO}+${bO})
          = ${aT+bT} + ${aO+bO} = ${a+b}.`
  };
}

function genEasy(): Item {
  // no-carry two-digit or one/two digit small sums
  let a=rnd(10,29), b=rnd(10,29);
  while ((a%10)+(b%10) >= 10 || a+b>60) { a=rnd(10,29); b=rnd(10,29); }
  const correct = a+b;
  return {
    id:`add-e-${a}-${b}`,
    type:'mc',
    stem:{ tex:`${a}+${b}=\\ ?` },
    choices: mkChoices(correct),
    correct:[0],
    difficulty: 35,
    hint:{ text:'Add ones, then tens.' },
    explain: addExplain(a,b),
  };
}

function genMedium(): Item {
  // sometimes carry in ones
  let a=rnd(20,59), b=rnd(20,59);
  while (a+b>100 || (a%10)+(b%10)<10) { a=rnd(20,59); b=rnd(20,59); }
  const correct=a+b;
  return {
    id:`add-m-${a}-${b}`,
    type:'mc',
    stem:{ tex:`${a}+${b}=\\ ?` },
    choices: mkChoices(correct),
    correct:[0],
    difficulty: 70,
    hint:{ text:'Add ones (carry if ≥10), then tens.' },
    explain: addExplain(a,b),
  };
}

function genHard(): Item {
  // larger values but ≤100; usually with carry
  let a=rnd(30,79), b=rnd(20,69);
  while (a+b>100 || (a%10)+(b%10)<10) { a=rnd(30,79); b=rnd(20,69); }
  const correct=a+b;
  return {
    id:`add-h-${a}-${b}`,
    type:'mc',
    stem:{ tex:`${a}+${b}=\\ ?` },
    choices: mkChoices(correct),
    correct:[0],
    difficulty: 92,
    hint:{ text:'Break into tens and ones; carry as needed.' },
    explain: addExplain(a,b),
  };
}

export function buildBank(): Item[] {
  // 12 items: 4 each
  const items: Item[] = [];
  for (let i=0;i<4;i++) items.push(genEasy());
  for (let i=0;i<4;i++) items.push(genMedium());
  for (let i=0;i<4;i++) items.push(genHard());
  return items;
}
