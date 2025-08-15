'use client';

import { useMemo, useState } from 'react';
import TeX from '@matejmazur/react-katex';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import GridFraction from '@/components/visuals/GridFraction';
import CircleFraction from '@/components/visuals/CircleFraction';
import TriangleSides from '@/components/visuals/TriangleSides';
import TriangleAngles from '@/components/visuals/TriangleAngles';

import type { Item, VisualSpec } from '@/lib/quiz';

function bucketLabel(d: number) { if (d <= 50) return 'EASY QUESTION'; if (d <= 90) return 'MEDIUM QUESTION'; return 'HARD QUESTION'; }
function gainFor(s: number, label: string) { const m = label==='EASY QUESTION'?0.16:label==='MEDIUM QUESTION'?0.20:0.25; return Math.min(15, Math.ceil((100-s)*m)); }
function lossFor(s: number, label: string) { const n = label==='EASY QUESTION'?0.09:label==='MEDIUM QUESTION'?0.07:0.05; return Math.min(30, Math.ceil(Math.max(4,s*n))); }
function renderText(t?: string, tex?: string) { return tex ? <TeX math={tex}/> : <span>{t}</span>; }
function arraysEqual(a:number[],b:number[]) { if(a.length!==b.length) return false; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true; }
function pickNextIndex(bank: Item[], score: number, asked: number[]) {
  const remaining = bank.map((_,i)=>i).filter(i=>!asked.includes(i));
  if (!remaining.length) return null;
  const label = bucketLabel(score);
  const inBucket = remaining.filter(i=>bucketLabel(bank[i].difficulty)===label);
  const pool = inBucket.length? inBucket : remaining;
  return pool[Math.floor(Math.random()*pool.length)];
}

export default function Player({ items, title }: { items: Item[]; title: string }) {
  // Shuffle choices client-side only
  const bank = useMemo(()=>items.map(q=>{
    const idxs = q.choices.map((_,i)=>i);
    for (let i=idxs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [idxs[i],idxs[j]]=[idxs[j],idxs[i]]; }
    const map = new Map<number,number>(); idxs.forEach((oldI,newI)=>map.set(oldI,newI));
    return { ...q, choices: idxs.map(i=>q.choices[i]), correct: q.correct.map(ci=>map.get(ci)!).sort((a,b)=>a-b) };
  }),[items]);

  const [score,setScore]=useState(0);
  const [askedIdx,setAskedIdx]=useState<number[]>([]);
  const [currentIdx,setCurrentIdx]=useState<number|null>(()=>pickNextIndex(bank,0,[]));
  const [picked,setPicked]=useState<number|null>(null);
  const [checked,setChecked]=useState(false);
  const [showHint,setShowHint]=useState(false);
  const [history,setHistory]=useState<Array<{q:Item;picked:number|null;correct:boolean}>>([]);

  if (!bank.length) return <div className="text-center"><p>No questions yet.</p><Link href="/dashboard" className="underline">Back</Link></div>;

  if (currentIdx===null) {
    const totals={easy:0,medium:0,hard:0}, ok={easy:0,medium:0,hard:0};
    history.forEach(h=>{ const bl=bucketLabel(h.q.difficulty); const k=bl==='EASY QUESTION'?'easy':bl==='MEDIUM QUESTION'?'medium':'hard'; totals[k as 'easy'|'medium'|'hard']++; if(h.correct) ok[k as 'easy'|'medium'|'hard']++; });
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 text-center">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-lg">Final smart score: <span className="font-semibold">{score}</span></p>
        <Card className="p-4"><h3 className="font-medium mb-2">By difficulty</h3>
          <div className="grid grid-cols-3 text-sm gap-2"><div>Easy: {ok.easy}/{totals.easy}</div><div>Medium: {ok.medium}/{totals.medium}</div><div>Hard: {ok.hard}/{totals.hard}</div></div>
        </Card>
        <div className="flex gap-2 justify-center">
          <Button onClick={()=>location.reload()}>Play again</Button>
          <Button asChild variant="outline"><Link href="/dashboard">Back to dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const q = bank[currentIdx]; const label = bucketLabel(q.difficulty);

  function onCheck(){
    if(picked==null) return;
    setChecked(true);
    const correct = arraysEqual([picked], q.correct);
    setHistory(h=>[...h,{q,picked,correct}]);
    setScore(s=>{ let ns = s + (correct?gainFor(s,label):-lossFor(s,label)); if (correct && ns>=96) ns=100; return Math.max(0,Math.min(100,ns)); });
  }
  function onNext(){
    if(currentIdx===null) return;
    const prev=currentIdx;
    setPicked(null); setChecked(false); setShowHint(false);
    setAskedIdx(a=>[...a,prev]);
    setCurrentIdx(pickNextIndex(bank,score,[...askedIdx,prev]));
  }

  function renderVisual(spec?: VisualSpec) {
    if (!spec) return null;
    switch (spec.kind) {
      case 'grid':
        return <GridFraction rows={spec.rows} cols={spec.cols} shaded={spec.shaded} fill={spec.color} />;
      case 'circle':
        return <CircleFraction parts={spec.parts} shaded={spec.shaded} fill={spec.color} />;
      case 'triangle-sides':
        return <TriangleSides a={spec.a} b={spec.b} c={spec.c} color={spec.color} />;
      case 'triangle-angles':
        return <TriangleAngles type={spec.type} color={spec.color} />;
      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">Smart score: {score}</p>
        <p className="text-xs uppercase tracking-wide mt-1">{label}</p>
      </div>

      <Card className="p-4 space-y-3">
        {q.visual && <div className="flex justify-center mb-2">{renderVisual(q.visual)}</div>}

        <div className="font-medium">{renderText(q.stem.text, q.stem.tex)}</div>

        <div className="space-y-2">
          {q.choices.map((c,idx)=>(
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`q-${q.id}`} checked={picked===idx} onChange={()=>setPicked(idx)} />
              <span>{renderText(c.text, c.tex)}</span>
            </label>
          ))}
        </div>

        {!checked ? (
          <Button className="mt-2" disabled={picked==null} onClick={onCheck}>Check</Button>
        ) : (
          <div className="mt-2 space-y-3">
            {arraysEqual([picked!], q.correct) ? (
              <p className="text-green-600">Correct!</p>
            ) : (
              <>
                <p className="text-red-600">Not quite. Correct answer: {renderText(q.choices[q.correct[0]].text, q.choices[q.correct[0]].tex)}</p>
                {q.hint && !showHint && <Button variant="outline" onClick={()=>setShowHint(true)}>Show hint</Button>}
                {q.hint && showHint && <div className="text-sm text-blue-700">{renderText(q.hint.text,q.hint.tex)}</div>}
              </>
            )}
            <Button onClick={onNext}>Next</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
