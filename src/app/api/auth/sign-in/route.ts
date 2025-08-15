import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';

const BodySchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = BodySchema.parse(json);

    const emailNorm = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (!user) {
      if (dev) console.log('sign-in: no user for', emailNorm);
      return NextResponse.json(
        { error: dev ? 'No account with that email' : 'Invalid credentials' },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      if (dev) console.log('sign-in: password mismatch for', emailNorm);
      return NextResponse.json(
        { error: dev ? 'Wrong password' : 'Invalid credentials' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server misconfigured: JWT_SECRET missing' },
        { status: 500 }
      );
    }

    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(secret));

    const res = NextResponse.json({ ok: true });
    res.cookies.set('mp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: err.issues.map(i => ({ path: i.path, message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('sign-in error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
