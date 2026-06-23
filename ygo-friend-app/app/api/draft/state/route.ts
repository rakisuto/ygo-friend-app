import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { DraftState } from '@/app/types/draft';

const KEY = 'draft:state';

export async function GET() {
  try {
    const state = await kv.get<DraftState>(KEY);
    return NextResponse.json(state ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const state: DraftState = await req.json();
    await kv.set(KEY, state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await kv.del(KEY);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
