import Navbar from '@/app/components/Navbar';

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        colorScheme: 'only light',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        color: '#0f172a',
      }}
    >
      <Navbar />
      {children}
    </div>
  );
}
