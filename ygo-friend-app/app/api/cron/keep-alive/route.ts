import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

// Upstashの無料DBは長期間アクセスが無いとアーカイブされるため、定期的に書き込みを行って非アクティブ扱いを防ぐ
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await kv.set('system:keepalive', new Date().toISOString());
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
