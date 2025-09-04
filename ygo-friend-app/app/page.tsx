// app/page.tsx
import forbidden from "../data/forbidden.json";
import limited from "../data/limited.json";
import semiLimited from "../data/semi_limited.json";

function CardTable({
  title,
  data,
  color,
  iconPath,
}: {
  title: string;
  data: Record<string, { name: string; url?: string }[]>;
  color: string;
  iconPath?: string;
}) {
  const maxRows = Math.max(
    data.monster.length,
    data.spell.length,
    data.trap.length,
    data.extra.length
  );

  const renderCell = (card?: { name: string; url?: string }) => {
    if (!card) return "";
    return card.url ? (
      <a href={card.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        {card.name}
      </a>
    ) : (
      card.name
    );
  };

return (
    <section className="mb-12">
      <div className="flex items-center mb-4">
        <h2 className={`text-2xl font-semibold mr-2 ${color}`}>{title}</h2>
        {iconPath && (
          <img src={iconPath} alt={`${title}アイコン`} className="w-6 h-6" />
        )}
      </div>
      <table className="w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">モンスター</th>
            <th className="border p-2">魔法</th>
            <th className="border p-2">罠</th>
            <th className="border p-2">EX</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, i) => (
            <tr key={i}>
              <td className="border p-2">{renderCell(data.monster[i])}</td>
              <td className="border p-2">{renderCell(data.spell[i])}</td>
              <td className="border p-2">{renderCell(data.trap[i])}</td>
              <td className="border p-2">{renderCell(data.extra[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function Page() {
  return (
    <main className="p-6 space-y-12">
      <h1 className="text-3xl font-bold">リミットレギュレーション一覧</h1>

      <CardTable title="禁止カード" data={forbidden} color="text-red-600" iconPath="/img/forbidden.png" />
      <CardTable title="制限カード" data={limited} color="text-yellow-600" iconPath="/img/limited.png"  />
      <CardTable title="準制限カード" data={semiLimited} color="text-blue-600" iconPath="/img/semi_limited.png" />
    </main>
  );
}
