import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const BodySchema = z.object({
  email: z.string().email(),             // student email
  newPassword: z.string().min(6).optional(), // optional custom temp password
});

async function getRequester() {
  const cookieStore = await cookies(); // Next 15: await
  const token = cookieStore.get('mp_token')?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET!;
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return { id: String(payload.sub), email: String(payload.email || '') };
}

export async function POST(req: Request) {
  try {
    // 0) who is calling?
    const requester = await getRequester();
    if (!requester) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1) must be ADMIN or SUBJECT_SUPERVISOR in some school
    const adminLikeMembership = await prisma.schoolMembership.findFirst({
      where: {
        userId: requester.id,
        role: { in: [Role.ADMIN, Role.SUBJECT_SUPERVISOR] },
      },
    });
    if (!adminLikeMembership) {
      return NextResponse.json({ error: 'Forbidden (admin/supervisor only)' }, { status: 403 });
    }
    const schoolId = adminLikeMembership.schoolId;

    // 2) validate
    const raw = await req.json();
    const { email, newPassword } = BodySchema.parse(raw);
    const targetEmail = email.trim().toLowerCase();

    // 3) find the student in the same school
    const user = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const studentMembership = await prisma.schoolMembership.findFirst({
      where: { userId: user.id, schoolId, role: Role.STUDENT },
    });
    if (!studentMembership) {
      return NextResponse.json({ error: 'Student not in your school' }, { status: 404 });
    }

    // 4) set new temp password (server can generate if not provided)
    const temp = newPassword ?? randomBytes(6).toString('base64url'); // ~8 chars, no symbols
    const passwordHash = await bcrypt.hash(temp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // 5) return the temp password ONCE (do not store plaintext)
    return NextResponse.json({
      ok: true,
      email: user.email,
      tempPassword: temp,
      note: 'Show this to the student and encourage changing it after login.',
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', issues: err.issues }, { status: 400 });
    }
    console.error('reset-password error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
