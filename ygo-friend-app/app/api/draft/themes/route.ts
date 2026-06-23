import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { Theme } from '@/app/types/draft';

const KEY = 'draft:themes';

export async function GET() {
  try {
    const themes = await kv.get<Theme[]>(KEY);
    return NextResponse.json(themes ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const themes: Theme[] = await req.json();
    await kv.set(KEY, themes);
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
