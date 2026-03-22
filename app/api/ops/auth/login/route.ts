import { NextRequest, NextResponse } from 'next/server';
import { checkApiRateLimit } from '@/lib/rate-limit';
import {
  OPS_AUTH_COOKIE,
  createOpsCookieValue,
  isOpsAuthConfigured,
  isValidOpsPassword,
} from '@/lib/opsAuth';

export async function POST(request: NextRequest) {
  const limitResult = await checkApiRateLimit(request, 'ops-login', 5, 60);
  if (!limitResult.success) {
    return NextResponse.json(
      { ok: false, error: 'too_many_attempts' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  if (!isOpsAuthConfigured()) {
    return NextResponse.json({ ok: false, error: 'ops_auth_not_configured' }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!isValidOpsPassword(password)) {
      return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 });
    }

    const cookieValue = createOpsCookieValue();
    if (!cookieValue) {
      return NextResponse.json({ ok: false, error: 'ops_auth_not_configured' }, { status: 503 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: OPS_AUTH_COOKIE,
      value: cookieValue,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }
}
