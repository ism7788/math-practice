'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type RoleOpt =
  | 'SCHOOL_MANAGER'
  | 'SUBJECT_SUPERVISOR'
  | 'SUBJECT_TEACHER'
  | 'STUDENT';

export default function CreateUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Welcome123'); // temp default
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleOpt>('STUDENT');
  const [gradeLevel, setGradeLevel] = useState<number | ''>('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('Math');
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);

    const body: any = { email, password, name, role };
    if (role === 'STUDENT') {
      body.gradeLevel = typeof gradeLevel === 'string' ? Number(gradeLevel) : gradeLevel;
      body.className = className;
    } else if (role === 'SUBJECT_TEACHER' || role === 'SUBJECT_SUPERVISOR') {
      body.subject = subject || 'Math';
    }

    try {
      const res = await fetch('/api/auth/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Failed to create user');
      } else {
        setMsg(`✅ Created: ${data.user.email}`);
        // quick cleanup
        setEmail('');
        setName('');
        setClassName('');
        setGradeLevel('');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Admin tools — Create user</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Temp Password</Label>
            <Input id="password" type="text" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={role}
              onChange={(e)=>setRole(e.target.value as RoleOpt)}
            >
              <option value="STUDENT">Student</option>
              <option value="SUBJECT_TEACHER">Subject Teacher</option>
              <option value="SUBJECT_SUPERVISOR">Subject Supervisor</option>
              <option value="SCHOOL_MANAGER">School Manager</option>
            </select>
          </div>

          {role === 'STUDENT' && (
            <>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Input
                  id="grade"
                  type="number"
                  min={1}
                  max={12}
                  value={gradeLevel}
                  onChange={(e)=>setGradeLevel(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="className">Class/Section (optional)</Label>
                <Input id="className" value={className} onChange={e=>setClassName(e.target.value)} />
              </div>
            </>
          )}

          {(role === 'SUBJECT_TEACHER' || role === 'SUBJECT_SUPERVISOR') && (
            <div className="md:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={e=>setSubject(e.target.value)} />
            </div>
          )}
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create user'}
        </Button>
      </form>
    </Card>
  );
}
