// Run with: npx ts-node --project tsconfig.json scripts/seed-tournaments.ts
// Or via: npx tsx scripts/seed-tournaments.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.UPSTASH_REDIS_REST_URL!;
const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

const initialData = [
  {
    id: '202605',
    name: '2026年5月大会',
    format: 'individual',
    status: 'finished',
    winner: null,
    archiveUrl: '/tournamentlist/archive/202605',
  },
  {
    id: '202607',
    name: '2026年7月大会',
    format: 'team',
    status: 'upcoming',
    winner: null,
    archiveUrl: '/tournamentlist/archive/202607',
  },
];

async function seed() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', 'tournaments:list', JSON.stringify(initialData)]),
  });
  const data = await res.json();
  if (data.error) {
    console.error('Error:', data.error);
    process.exit(1);
  }
  console.log('Seeded tournaments:list successfully');
}

seed();
