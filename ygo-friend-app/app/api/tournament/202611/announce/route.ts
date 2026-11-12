import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { postToDiscord } from '@/lib/discord';
import { buildAnnouncement, type AnnounceKind } from '@/lib/tournament/announce';
import type { Season } from '@/app/tournament/types';

const KEY = 'tournament:season:202611';

// 管理画面の「アナウンス」ボタンから呼ばれる。保存済みのデータから文面を作り、Discord に投稿する。
// (結果の保存は、呼び出し側が先に /api/tournament/202611/session/[sessionId] で済ませる)
export async function POST(req: NextRequest) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ error: 'ADMIN_PIN is not configured on the server' }, { status: 500 });
  }
  if (req.headers.get('x-admin-pin') !== adminPin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { sessionId?: unknown; matchNumber?: unknown; kind?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 });
  }
  const { sessionId, matchNumber, kind } = body;
  if (typeof sessionId !== 'string' || typeof matchNumber !== 'number' || (kind !== 'start' && kind !== 'result')) {
    return NextResponse.json({ error: 'リクエストの内容が正しくありません' }, { status: 400 });
  }

  try {
    const season = await kv.get<Season>(KEY);
    if (!season) return NextResponse.json({ error: '大会データが見つかりません' }, { status: 404 });

    const built = buildAnnouncement(season, sessionId, matchNumber, kind as AnnounceKind);
    if (!built.ok) return NextResponse.json({ error: built.error }, { status: 400 });

    const posted = await postToDiscord(built.content);
    if (!posted.ok) return NextResponse.json({ error: posted.error }, { status: 502 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('announce error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
