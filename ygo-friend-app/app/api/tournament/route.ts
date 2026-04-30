import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured on the server' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
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

export async function PATCH(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured on the server' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const season = await kv.get<Season>(KEY);
    if (!season) return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    const patch = await req.json();
    const updated: Season = { ...season, ...patch };
    await kv.set(KEY, updated);
    revalidatePath('/tournament');
    revalidatePath('/stats/overall');
    revalidatePath('/stats/player');
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured on the server' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await kv.del(KEY);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
