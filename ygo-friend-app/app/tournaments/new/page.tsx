// app/tournaments/new/page.tsx
export const dynamic = "force-dynamic";

type SP = { n1?: string; n2?: string; n3?: string; n4?: string; shuffle?: string };

const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

// SVG縦ラベル（自動フィット：下端基準で1文字ずつ積む）
// 置換：VerticalLabel
function VerticalLabel({
  text,
  x,
  startY = 150,   // 縦線末端(140)の直下から開始
  vbBottom = 260, // viewBoxの下端（後述のSVGと一致させる）
  padBottom = 8,  // 下マージン
  minFont = 10,
  maxFont = 14,
}: { text: string; x: number; startY?: number; vbBottom?: number; padBottom?: number; minFont?: number; maxFont?: number }) {
  const normalized = (text ?? "").replace(/[ー\-―−─ｰ]/g, "｜"); // 全角/半角や各種ダッシュに対応
  const chars = Array.from(normalized);

  const avail = Math.max(0, vbBottom - padBottom - startY);
  // 収めるためにフォントサイズと行間(=フォントサイズ)を自動調整
  const raw = chars.length > 0 ? Math.floor(avail / chars.length) : maxFont;
  const fontSize = Math.max(minFont, Math.min(maxFont, raw));
  const line = fontSize; // 1文字ぶん下に積む

  return (
    <text textAnchor="middle"
      fontFamily="system-ui, -apple-system, Segoe UI, Roboto, 'Hiragino Sans', 'Noto Sans JP', sans-serif"
      fontSize={fontSize} fill="#222">
      {chars.map((c, i) => (
        <tspan key={i} x={x} y={startY + i * line}>{c}</tspan>
      ))}
    </text>
  );
}




export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  // フォームの値（固定順・独立）
  const formNames = [sp.n1 ?? "3", sp.n2 ?? "2", sp.n3 ?? "4", sp.n4 ?? "1"];

  // 表示順（トーナメント側のみシャッフル適用）
  const baseOrder = [0, 1, 2, 3];
  const order = sp.shuffle ? shuffle(baseOrder) : baseOrder;
  const labels = order.map((i) => formNames[i]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeContent: "center", gap: 64, padding: 32 }}>
    {/* フォームは固定順（カードUI） */}
    <form method="GET"
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(4, 1fr)",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        background: "#fff",
        width: 820
      }}
    >
      <input name="n1" defaultValue={formNames[0]} placeholder="エントリー1"
        style={{ width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 8 }} />
      <input name="n2" defaultValue={formNames[1]} placeholder="エントリー2"
        style={{ width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 8 }} />
      <input name="n3" defaultValue={formNames[2]} placeholder="エントリー3"
        style={{ width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 8 }} />
      <input name="n4" defaultValue={formNames[3]} placeholder="エントリー4"
        style={{ width: "100%", padding: "10px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 8 }} />

      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="submit"
          style={{ padding: "10px 16px", fontSize: 14, border: "1px solid #ccc", borderRadius: 8, background: "#f7f7f7" }}>
          反映
        </button>
        <button type="submit" name="shuffle" value="1"
          style={{ padding: "10px 16px", fontSize: 14, border: "1px solid #0a7", borderRadius: 8, background: "#0db", color: "#fff" }}>
          シャッフル配置
        </button>
      </div>
    </form>

<div style={{ width: 820, display: "grid", placeItems: "center" }}>
  <svg viewBox="0 0 130 260" xmlns="http://www.w3.org/2000/svg" width={320}>
        {/* 王冠 */}
        <g fill="#ffd900">
          <polygon points="35,30 50,10 65,30 80,10 95,30 35,30" />
          <circle cx="50" cy="10" r="4" />
          <circle cx="65" cy="10" r="4" />
          <circle cx="80" cy="10" r="4" />
          <rect x="45" y="34" width="40" height="6" rx="1" />
        </g>

        {/* 枝 */}
        <g stroke="#666" strokeWidth="2" fill="none" strokeLinecap="square">
          <line x1="65" y1="46" x2="65" y2="80" />
          <line x1="35" y1="85" x2="95" y2="85" />
          <line x1="35" y1="85" x2="35" y2="115" />
          <line x1="95" y1="85" x2="95" y2="115" />
          <line x1="25" y1="115" x2="45" y2="115" />
          <line x1="85" y1="115" x2="105" y2="115" />
          <line x1="25" y1="115" x2="25" y2="140" />
          <line x1="45" y1="115" x2="45" y2="140" />
          <line x1="85" y1="115" x2="85" y2="140" />
          <line x1="105" y1="115" x2="105" y2="140" />
        </g>

        {/* ラベル（1文字ずつ縦並び） */}
<VerticalLabel text={labels[0]} x={25} startY={153} vbBottom={260} />
<VerticalLabel text={labels[1]} x={45} startY={153} vbBottom={260} />
<VerticalLabel text={labels[2]} x={85} startY={153} vbBottom={260} />
<VerticalLabel text={labels[3]} x={105} startY={153} vbBottom={260} />

      </svg>
      </div>
    </main>
  );
}
