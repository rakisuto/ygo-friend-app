import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { Tournament } from '@/app/types/tournament';

const KEY = 'tournaments:list';

export async function GET() {
  try {
    const list = await kv.get<Tournament[]>(KEY);
    return NextResponse.json(list ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body: Tournament = await req.json();
    const list = (await kv.get<Tournament[]>(KEY)) ?? [];
    if (list.some(t => t.id === body.id)) {
      return NextResponse.json({ error: '大会IDが重複しています' }, { status: 409 });
    }
    list.push(body);
    await kv.set(KEY, list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
