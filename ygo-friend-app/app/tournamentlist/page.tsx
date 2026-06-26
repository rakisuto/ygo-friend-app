import Link from 'next/link';

export default function TournamentListPage() {
  return (
    <main className="page-main" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          大会一覧
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link
          href="/tournamentlist/archive/202607"
          style={{
            display: 'block',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            textDecoration: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
            2026年7月
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            身内戦 2026年7月大会
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '4px' }}>
            2人チーム戦 / 大会結果・プレイヤー成績・総合成績
          </div>
        </Link>
        <Link
          href="/tournamentlist/archive/202605"
          style={{
            display: 'block',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            textDecoration: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
            2026年5月
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            身内戦 2026年5月大会
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '4px' }}>
            大会結果・プレイヤー成績・総合成績
          </div>
        </Link>
      </div>
    </main>
  );
}
