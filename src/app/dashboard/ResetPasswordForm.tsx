'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [custom, setCustom] = useState(''); // optional new password
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword: custom || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || 'Failed to reset');
      } else {
        setMsg(`✅ ${data.email} new temp password: ${data.tempPassword}`);
        setEmail('');
        setCustom('');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Admin/Supervisor — Reset student password</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Student Email</Label>
            <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="custom">New Temp Password (optional)</Label>
            <Input id="custom" type="text" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Leave empty to auto-generate" />
          </div>
        </div>

        {msg && <p className="text-sm">{msg}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </Card>
  );
}
