export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        colorScheme: 'only light',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        color: '#0f172a',
      }}
    >
      {children}
    </div>
  );
}
