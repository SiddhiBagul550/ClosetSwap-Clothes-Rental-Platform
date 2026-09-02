import React from "react";
import { T } from "../theme";
import { LEGAL_CONTENT } from "../constants/legal";

export default function LegalModal({ tab, setTab, onClose }) {
  const content = LEGAL_CONTENT[tab];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,18,15,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, borderRadius: 4, maxWidth: 520, width: "100%", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px 0" }}>
          <div style={{ display: "flex", gap: 18 }}>
            {["terms", "privacy"].map((t) => (
              <span key={t} onClick={() => setTab(t)}
                style={{ fontFamily: "Fraunces, serif", fontSize: 19, cursor: "pointer", color: t === tab ? T.ink : T.ink3, borderBottom: t === tab ? `2px solid ${T.ink}` : "none", paddingBottom: 4 }}>
                {LEGAL_CONTENT[t].title}
              </span>
            ))}
          </div>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 20, color: T.ink3, lineHeight: 1 }}>×</span>
        </div>
        <div style={{ padding: "18px 26px 26px", overflowY: "auto" }}>
          <p style={{ fontSize: 12, color: T.ink3, fontStyle: "italic", margin: "0 0 16px" }}>
            Draft template - not yet reviewed by a lawyer.
          </p>
          {content.sections.map(([heading, body]) => (
            <div key={heading} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>{heading}</p>
              <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
