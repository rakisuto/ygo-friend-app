import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN not configured' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
