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
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>
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
