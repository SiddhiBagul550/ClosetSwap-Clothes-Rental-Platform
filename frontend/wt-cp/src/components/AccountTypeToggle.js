import React from "react";
import { T } from "../theme";

export default function AccountTypeToggle({ value, onChange }) {
  const opt = (val, lb, hint) => (
    <button type="button" onClick={() => onChange(val)}
      style={{
        flex: 1, textAlign: "left", fontFamily: "Karla, sans-serif", cursor: "pointer",
        padding: "12px 14px", borderRadius: 3, background: value === val ? T.ink : T.paper,
        border: `1px solid ${value === val ? T.ink : T.line}`, color: value === val ? T.paper : T.ink,
      }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{lb}</span>
      <span style={{ display: "block", fontSize: 11.5, marginTop: 2, color: value === val ? T.paper : T.ink3, opacity: value === val ? 0.85 : 1 }}>{hint}</span>
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
      {opt("individual", "Individual", "Renting or lending your own pieces")}
      {opt("shop", "Shop", "Renting or lending on behalf of a business")}
    </div>
  );
}
