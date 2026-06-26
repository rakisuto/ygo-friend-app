import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { Tournament } from '@/app/types/tournament';

const KEY = 'tournaments:list';

function authCheck(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) return { error: 'ADMIN_PIN is not configured', status: 500 };
  if (req.headers.get('x-admin-pin') !== adminPin) return { error: 'Unauthorized', status: 401 };
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  try {
    const list = (await kv.get<Tournament[]>(KEY)) ?? [];
    const tournament = list.find(t => t.id === tournamentId);
    if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tournament);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  const authError = authCheck(req);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });
  try {
    const list = (await kv.get<Tournament[]>(KEY)) ?? [];
    const index = list.findIndex(t => t.id === tournamentId);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body: Partial<Tournament> = await req.json();
    list[index] = { ...list[index], ...body };
    await kv.set(KEY, list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  const authError = authCheck(req);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });
  try {
    const list = (await kv.get<Tournament[]>(KEY)) ?? [];
    const filtered = list.filter(t => t.id !== tournamentId);
    if (filtered.length === list.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await kv.set(KEY, filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
