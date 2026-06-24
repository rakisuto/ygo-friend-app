import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { DraftSession } from '@/app/types/draft';

const KEY = 'draft:session';

export async function GET() {
  try {
    const session = await kv.get<DraftSession>(KEY);
    return NextResponse.json(session ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: DraftSession = await req.json();
    await kv.set(KEY, session);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await kv.del(KEY);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
