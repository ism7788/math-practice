'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SKILLS, skillHref } from '@/content/skills';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentHome({ grade }: { grade?: number | null }) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const base = grade ? SKILLS.filter(s => s.grade === grade) : SKILLS;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(s => s.title.toLowerCase().includes(q));
  }, [grade, query]);

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Choose a skill</h2>
          <p className="text-sm text-muted-foreground">
            {grade ? `Showing grade ${grade}` : 'Showing all grades'}
          </p>
        </div>
        <div className="w-64">
          <Label htmlFor="search" className="text-sm">Search</Label>
          <Input id="search" placeholder="type to filter…" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {visible.map(s => (
          <Card key={s.id} className="p-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Grade {s.grade}</p>
              <h3 className="text-base font-medium mt-1">{s.title}</h3>
            </div>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href={skillHref(s.id)}>Start</Link>
              </Button>
            </div>
          </Card>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills match your search.</p>
        )}
      </div>
    </div>
  );
}
