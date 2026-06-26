import Navbar from './components/Navbar';
import Link from 'next/link';

export default function TopPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: 'calc(100vh - 52px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '2rem 1rem',
          background: '#f8fafc',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            fontWeight: 800,
            color: '#1e293b',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          マスターデュエル身内戦
        </h1>

        <img
          src="/img/master-duel-logo.png"
          alt="Yu-Gi-Oh! Master Duel"
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
          }}
        />

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          <span
            style={{
              display: 'block',
              padding: '14px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#94a3b8',
              fontSize: '1rem',
              fontWeight: 500,
              textAlign: 'center',
              cursor: 'default',
            }}
          >
            📋 大会一覧
          </span>

          <Link
            href="/tournament/admin"
            style={{
              display: 'block',
              padding: '14px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#1e293b',
              fontSize: '1rem',
              fontWeight: 500,
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            ⚙️ 管理者画面
          </Link>

          <a
            href="https://www.masterduelmeta.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '14px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#2563eb',
              fontSize: '1rem',
              fontWeight: 500,
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            🔗 MasterDuelMeta
          </a>
        </nav>
      </main>
    </>
  );
}
