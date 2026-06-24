import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import type { BanRule } from '@/app/types/draft';

const KEY = 'draft:ban-rules';

export async function GET() {
  try {
    const rules = await kv.get<BanRule[]>(KEY);
    return NextResponse.json(rules ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rules: BanRule[] = await req.json();
    await kv.set(KEY, rules);
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
