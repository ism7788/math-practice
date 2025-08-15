import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/sign-in', req.url));
  res.cookies.set('mp_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
