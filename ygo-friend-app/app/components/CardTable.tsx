// components/CardTable.tsx
"use client";

import { useState } from "react";
import '.././globals.css';

export default function CardTable({
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
  const [isOpen, setIsOpen] = useState(true); // 折りたたみ制御

  const maxRows = Math.max(
    data.monster.length,
    data.spell.length,
    data.trap.length,
    data.extra.length
  );

const renderCell = (
  value: string | { name: string; url?: string } | undefined
) => {
  if (!value) return null;

  if (typeof value === "string") {
    return (
      <span className="text-blue-600 visited:text-purple-600 underline transition transform active:scale-95">
        {value}
      </span>
    );
  }

  return value.url ? (
    <a
      href={value.url}
      className="text-blue-600 visited:text-purple-600 underline transition transform active:scale-95"
      target="_blank" // optional: open in new tab
      rel="noopener noreferrer"
    >
      {value.name}
    </a>
  ) : (
    <span className="text-blue-600 visited:text-purple-600 underline transition transform active:scale-95">
      {value.name}
    </span>
  );
};



  return (
    <section style={{ marginBottom: "3rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
        <h2 onClick={() => setIsOpen(!isOpen)} style={{ fontSize: "1.5rem", fontWeight: 600, marginRight: "0.5rem", cursor: "pointer", color }}>
          {isOpen ? "▼" : "▶"} {title}
        </h2>
        {iconPath && <img src={iconPath} alt={`${title}アイコン`} style={{ width: "1.5rem", height: "1.5rem" }} />}
      </div>
      {isOpen && (
        <table className="w-full text-sm table-fixed bg-white"
        style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            tableLayout: "fixed",
            padding: "1rem",
        }}
        >
        <thead style={{ backgroundColor: "#f0f0f0" }}>
        <tr>
            <th className="monster border p-2">モンスター</th>
            <th className="spell border p-2">魔法</th>
            <th className="trap border p-2">罠</th>
            <th className="extra border p-2">EX</th>
        </tr>
          </thead>
<tbody>
  {Array.from({ length: maxRows }).map((_, i) => (
    <tr key={i}>
      <td
        className="gothic text-lg p-3 leading-normal min-h-[48px] border"
        style={{
          backgroundColor: data.monster[i] ? "#fffbe6" : "white",
        }}
      >
        {renderCell(data.monster[i])}
      </td>
      <td
        className="gothic text-lg p-3 leading-normal min-h-[48px] border"
        style={{
          backgroundColor: data.spell[i] ? "#dfd" : "white",
        }}
      >
        {renderCell(data.spell[i])}
      </td>
      <td
        className="gothic text-lg p-3 leading-normal min-h-[48px] border"
        style={{
          backgroundColor: data.trap[i] ? "#f9e6ff" : "white",
        }}
      >
        {renderCell(data.trap[i])}
      </td>
      <td
        className="gothic text-lg p-3 leading-normal min-h-[48px] border"
        style={{
          backgroundColor: data.extra[i] ? "#def" : "white",
        }}
      >
        {renderCell(data.extra[i])}
      </td>
    </tr>
  ))}
</tbody>


        </table>
      )}
    </section>
  );
}
