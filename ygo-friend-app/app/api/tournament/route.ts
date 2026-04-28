import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { Season } from '@/app/tournament/types';

const KEY = 'tournament:season';

export async function GET() {
  try {
    const season = await kv.get<Season>(KEY);
    return NextResponse.json(season ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const season: Season = await req.json();
    await kv.set(KEY, season);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('KV save error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
