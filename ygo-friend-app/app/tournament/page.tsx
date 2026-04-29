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

      {season.description && (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
          }}>
            📝 大会概要
          </p>
          <p style={{
            fontSize: '0.9375rem', lineHeight: '1.8', color: '#374151',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
            margin: 0,
          }}>
            {season.description}
          </p>
        </div>
      )}

      <SessionTabs season={season} />
    </main>
  );
}
