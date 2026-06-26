import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { TournamentMeta } from '@/app/types/tournament';

function metaKey(id: string) {
  return `tournament:${id}:meta`;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  try {
    const meta = await kv.get<TournamentMeta>(metaKey(tournamentId));
    return NextResponse.json(meta ?? { status: 'upcoming', winner: null });
  } catch {
    return NextResponse.json({ status: 'upcoming', winner: null });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body: TournamentMeta = await req.json();
    await kv.set(metaKey(tournamentId), body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
