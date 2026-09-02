import React from "react";
import { T } from "../theme";

/* Lightweight single-topic modal for footer links (sizing, damage policy,
   areas covered) that don't need LegalModal's terms/privacy tabs. */
export default function InfoModal({ title, paragraphs, chips, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,18,15,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, borderRadius: 4, maxWidth: 520, width: "100%", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px 0" }}>
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: T.ink }}>{title}</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 20, color: T.ink3, lineHeight: 1 }}>×</span>
        </div>
        <div style={{ padding: "18px 26px 26px", overflowY: "auto" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 13, color: T.ink2, lineHeight: 1.6, margin: "0 0 12px" }}>{p}</p>
          ))}
          {chips && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {chips.map((c) => (
                <span key={c} style={{ fontSize: 12, color: T.ink2, background: T.line2, borderRadius: 999, padding: "5px 11px" }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
