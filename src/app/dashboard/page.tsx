import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { PrismaClient, Role } from '@prisma/client';
import CreateUserForm from './CreateUserForm';
import ResetPasswordForm from './ResetPasswordForm';
import StudentHome from './StudentHome';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mp_token')?.value;
  if (!token) redirect('/sign-in');

  let email = '', userId = '';
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    email = String(payload.email || '');
    userId = String(payload.sub || '');
  } catch { redirect('/sign-in'); }

  const [adminMem, supervisorMem, teacherMem, studentMem] = await Promise.all([
    prisma.schoolMembership.findFirst({ where: { userId, role: Role.ADMIN } }),
    prisma.schoolMembership.findFirst({ where: { userId, role: Role.SUBJECT_SUPERVISOR } }),
    prisma.schoolMembership.findFirst({ where: { userId, role: Role.SUBJECT_TEACHER } }),
    prisma.schoolMembership.findFirst({ where: { userId, role: Role.STUDENT } }),
  ]);

  const canCreateUsers = !!adminMem;
  const canReset = !!(adminMem || supervisorMem);
  const canPreviewSkills = !!(teacherMem || supervisorMem || studentMem);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 space-y-6">
      <div className="w-full max-w-md text-center space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Signed in as <span className="font-mono">{email}</span></p>
        <form action="/api/auth/sign-out" method="post" className="mt-4">
          <button className="px-4 py-2 border rounded">Sign out</button>
        </form>
      </div>

      {canCreateUsers && (
        <div className="w-full flex items-center justify-center">
          <CreateUserForm />
        </div>
      )}
      {canReset && (
        <div className="w-full flex items-center justify-center">
          <ResetPasswordForm />
        </div>
      )}

      {canPreviewSkills && (
        <StudentHome grade={studentMem?.gradeLevel ?? null} />
      )}

      {!canCreateUsers && !canReset && !canPreviewSkills && (
        <p className="text-sm text-muted-foreground">
          You are signed in. Ask an admin for access to tools.
        </p>
      )}
    </div>
  );
}
