import CardBackground from '@/app/components/CardBackground';

export default function Tournament202607Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CardBackground />
      <div style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(255, 255, 255, 0.93)',
        borderRadius: '16px',
        margin: '0 12px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      }}>
        {children}
      </div>
    </div>
  );
}
