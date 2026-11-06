// Vercel連携(Upstash)の接頭辞付き変数(DB_KV_REST_API_*)を優先し、
// 無ければ KV_REST_API_*、従来の UPSTASH_REDIS_REST_* の順にフォールバックする
const url = (
  process.env.DB_KV_REST_API_URL ?? process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
)!;
const token = (
  process.env.DB_KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
)!;

async function exec(cmd: (string | number | null)[]): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    const result = await exec(['GET', key]) as string | null;
    return result ? (JSON.parse(result) as T) : null;
  },
  async set(key: string, value: unknown): Promise<void> {
    await exec(['SET', key, JSON.stringify(value)]);
  },
  async del(key: string): Promise<void> {
    await exec(['DEL', key]);
  },
};
