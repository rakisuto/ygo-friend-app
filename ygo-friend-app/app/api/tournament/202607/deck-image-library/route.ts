import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';
import type { DeckImageLibrary, DeckImageLayer, DeckImageMap } from '@/app/tournament/types';

const LIBRARY_KEY = 'tournament:202607:deckImageLibrary';
const BINDINGS_KEY = 'tournament:202607:deckImages';

function checkAuth(req: NextRequest): NextResponse | null {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured on the server' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    const library = await kv.get<DeckImageLibrary>(LIBRARY_KEY);
    return NextResponse.json(library ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;
  try {
    const { label, layers } = await req.json() as { label: string; layers: DeckImageLayer[] };
    const library = (await kv.get<DeckImageLibrary>(LIBRARY_KEY)) ?? [];
    const preset = { id: uuidv4(), label: label.trim() || '無題', layers };
    library.push(preset);
    await kv.set(LIBRARY_KEY, library);
    revalidatePath('/tournamentlist/archive/202607');
    return NextResponse.json(preset);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;
  try {
    const { id } = await req.json() as { id: string };
    const library = ((await kv.get<DeckImageLibrary>(LIBRARY_KEY)) ?? []).filter(p => p.id !== id);
    await kv.set(LIBRARY_KEY, library);

    // このプリセットを参照していたデッキ名の紐づけも解除する
    const bindings = (await kv.get<DeckImageMap>(BINDINGS_KEY)) ?? {};
    let changed = false;
    for (const [deckName, presetId] of Object.entries(bindings)) {
      if (presetId === id) { delete bindings[deckName]; changed = true; }
    }
    if (changed) await kv.set(BINDINGS_KEY, bindings);

    revalidatePath('/tournamentlist/archive/202607');
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
