// app/page.tsx
import CardTable from "./components/CardTable";
import forbidden from "../data/forbidden.json";
import limited from "../data/limited.json";
import semiLimited from "../data/semi_limited.json";
import './globals.css';

// スタンダードで構築することという記載があったほうが良いか？
export default function Page() {
  return (
    <main style={{ padding: "1.5rem" }}>
      <h1 style={{ fontFamily: 'HOTReisho', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem' }}>
        NR杯リミットレギュレーション一覧
        <span style={{ fontSize: '1rem', color: 'gray' }}>
          （最終更新: 2025年9月4日）
        </span>
      </h1>
      <h2 style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'gray' }}>
        マスターデュエルのSTANDARDレギュレーションで禁止制限になっているカードは記載していません。(例: ティアラメンツ・メイルゥなど)
      </h2>
      <CardTable title="禁止カード" data={forbidden} color="red" iconPath="/img/forbidden.png" />
      <CardTable title="制限カード" data={limited} color="orange" iconPath="/img/limited.png" />
      <CardTable title="準制限カード" data={semiLimited} color="blue" iconPath="/img/semi_limited.png" />
    </main>
  );
}
