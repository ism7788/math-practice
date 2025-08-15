import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum([
    'SCHOOL_MANAGER',
    'SUBJECT_SUPERVISOR',
    'SUBJECT_TEACHER',
    'STUDENT',
  ]),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  className: z.string().optional(),
  subject: z.string().optional(),
});

async function getRequester() {
  const cookieStore = await cookies();              // ⬅️ await is required in Next 15
  const token = cookieStore.get('mp_token')?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET!;
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return { id: String(payload.sub), email: String(payload.email || '') };
}

export async function POST(req: Request) {
  try {
    // 0) Authn
    const requester = await getRequester();
    if (!requester) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1) Ensure requester is ADMIN in some school
    const adminMembership = await prisma.schoolMembership.findFirst({
      where: { userId: requester.id, role: Role.ADMIN },
      include: { school: true },
    });
    if (!adminMembership) {
      return NextResponse.json({ error: 'Forbidden (admin only)' }, { status: 403 });
    }
    const schoolId = adminMembership.schoolId;

    // 2) Validate body
    const raw = await req.json();
    const data = BodySchema.parse(raw);
    const email = data.email.trim().toLowerCase();

    // Guard: students should have a gradeLevel
    if (data.role === 'STUDENT' && typeof data.gradeLevel !== 'number') {
      return NextResponse.json(
        { error: 'gradeLevel is required for STUDENT' },
        { status: 400 }
      );
    }

    // 3) Upsert user + set password
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: data.name ?? undefined, passwordHash },
      create: { email, name: data.name ?? null, passwordHash },
    });

    // 4) Upsert membership in admin’s school
    await prisma.schoolMembership.upsert({
      where: { userId_schoolId: { userId: user.id, schoolId } },
      update: {
        role: data.role as Role,
        gradeLevel: data.role === 'STUDENT' ? data.gradeLevel ?? null : null,
        className: data.role === 'STUDENT' ? data.className ?? null : null,
        subject:
          data.role === 'SUBJECT_TEACHER' || data.role === 'SUBJECT_SUPERVISOR'
            ? data.subject ?? 'Math'
            : null,
      },
      create: {
        userId: user.id,
        schoolId,
        role: data.role as Role,
        gradeLevel: data.role === 'STUDENT' ? data.gradeLevel ?? null : null,
        className: data.role === 'STUDENT' ? data.className ?? null : null,
        subject:
          data.role === 'SUBJECT_TEACHER' || data.role === 'SUBJECT_SUPERVISOR'
            ? data.subject ?? 'Math'
            : null,
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      schoolId,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', issues: err.issues }, { status: 400 });
    }
    console.error('create-user error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
