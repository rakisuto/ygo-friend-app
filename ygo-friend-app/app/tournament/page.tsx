import { kv } from '@/lib/kv';
import type { Season } from './types';
import SessionTabs from './components/SessionTabs';

export const revalidate = 0;

export default async function TournamentPage() {
  let season: Season | null = null;
  try {
    season = await kv.get<Season>('tournament:season');
  } catch {
    // KV接続エラー時はnullとして扱う
  }

  if (!season) {
    return (
      <main className="page-main">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>対戦表</h1>
        <p style={{ color: '#94a3b8' }}>スケジュールはまだ生成されていません。</p>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          {season.name}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          参加プレイヤー: {season.players.map(p => p.name).join('・')}
        </p>
      </div>
      <SessionTabs season={season} />
    </main>
  );
}
