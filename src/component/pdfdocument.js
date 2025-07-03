// components/pdfdocument.js
import React from "react";

export default function PDFDocument({ encounters }) {
  return (
    <div style={{ padding: "30px", fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
        Encounter Report
      </h2>
      {encounters.map((group, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{group.date}</div>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {group.items.map((item) => (
              <li key={item.id}>
                Encounter {item.id} - {item.status} - {item.duration} min
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
