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

  const renderCell = (card?: { name: string; url?: string }) => {
    if (!card) return "";
    return card.url ? (
      <a href={card.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
        {card.name}
      </a>
    ) : (
      card.name
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
        <table
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
                className={data.monster[i] ? "border p-2 gothic" : "p-2"}
                style={data.monster[i] ? { backgroundColor: "#fffbe6" } : {}}
            >
                {renderCell(data.monster[i])}
            </td>
            <td
                className={data.spell[i] ? "border p-2 gothic" : "p-2"}
                style={data.spell[i] ? { backgroundColor: "#e6f7ff" } : {}}
            >
                {renderCell(data.spell[i])}
            </td>
            <td
                className={data.trap[i] ? "border p-2 gothic" : "p-2"}
                style={data.trap[i] ? { backgroundColor: "#f9e6ff" } : {}}
            >
                {renderCell(data.trap[i])}
            </td>
            <td
                className={data.extra[i] ? "border p-2 gothic" : "p-2"}
                style={data.extra[i] ? { backgroundColor: "#e6ffe6" } : {}}
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
