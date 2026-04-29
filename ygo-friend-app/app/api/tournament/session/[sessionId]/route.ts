import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { kv } from '@/lib/kv';
import type { Season } from '@/app/tournament/types';

const KEY = 'tournament:season';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const season = await kv.get<Season>(KEY);
    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    const patch = await req.json();
    season.sessions = season.sessions.map(s =>
      s.id === params.sessionId ? { ...s, ...patch } : s
    );
    await kv.set(KEY, season);
    revalidatePath('/tournament');
    revalidatePath('/stats/overall');
    revalidatePath('/stats/player');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
