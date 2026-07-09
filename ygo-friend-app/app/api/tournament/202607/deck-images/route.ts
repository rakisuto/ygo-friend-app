import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { kv } from '@/lib/kv';
import type { DeckImageMap } from '@/app/tournament/types';

const KEY = 'tournament:202607:deckImages';

export async function GET() {
  try {
    const map = await kv.get<DeckImageMap>(KEY);
    return NextResponse.json(map ?? {});
  } catch {
    return NextResponse.json({});
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
    const { deckName, mapping } = await req.json() as { deckName: string; mapping: DeckImageMap[string] | null };
    const current = (await kv.get<DeckImageMap>(KEY)) ?? {};
    if (mapping) {
      current[deckName] = mapping;
    } else {
      delete current[deckName];
    }
    await kv.set(KEY, current);
    revalidatePath('/tournamentlist/archive/202607');
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
