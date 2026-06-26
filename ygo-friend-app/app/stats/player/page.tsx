import { kv } from '@/lib/kv';
import type { Season } from '@/app/tournament/types';
import PlayerStatsClient from './PlayerStatsClient';

export const revalidate = 0;

export default async function PlayerStatsPage() {
  let season: Season | null = null;
  try {
    season = await kv.get<Season>('tournament:season');
  } catch {
    // KV error
  }

  return (
    <main className="page-main" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          個人成績
        </h1>
        {season && (
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {season.name} — 参加プレイヤー: {season.players.map(p => p.name).join('・')}
          </p>
        )}
      </div>

      {!season ? (
        <p style={{ color: '#94a3b8' }}>スケジュールはまだ生成されていません。</p>
      ) : (
        <PlayerStatsClient season={season} />
      )}
    </main>
  );
}
