// Discord Webhook への投稿。
// 本番用の DISCORD_WEBHOOK_URL を優先し、無ければテスト用の TEST_DISCORD_WEBHOOK_URL を使う。
// Webhook URL は秘密情報(知っていれば誰でも投稿できる)なので、サーバー側でのみ読み、画面やログには出さない。

const WEBHOOK_PATTERN = /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/;

function webhookUrl(): string | null {
  const url = process.env.DISCORD_WEBHOOK_URL || process.env.TEST_DISCORD_WEBHOOK_URL;
  return url ? url.trim() : null;
}

function isAllowedUrl(url: string): boolean {
  if (WEBHOOK_PATTERN.test(url)) return true;
  // ローカル開発のモック検証用(本番では許可しない)
  return process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+\//.test(url);
}

export type DiscordResult = { ok: true } | { ok: false; error: string };

export async function postToDiscord(content: string): Promise<DiscordResult> {
  const url = webhookUrl();
  if (!url) return { ok: false, error: 'Discord の Webhook URL が設定されていません' };
  if (!isAllowedUrl(url)) return { ok: false, error: 'Discord の Webhook URL の形式が正しくありません' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 名前などに含まれる @everyone や @ユーザー で誰かに通知が飛ばないようにする
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, error: `Discord への投稿に失敗しました (HTTP ${res.status})` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Discord に接続できませんでした' };
  }
}
