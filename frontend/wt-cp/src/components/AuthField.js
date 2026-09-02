import React from "react";
import { T } from "../theme";

export default function AuthField({ id, lb, hint, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 }}>{lb}</label>
      {children}
      {error ? <p style={{ fontSize: 12, color: T.err, margin: "6px 0 0" }}>{error}</p>
        : hint ? <p style={{ fontSize: 12, color: T.ink3, margin: "6px 0 0" }}>{hint}</p> : null}
    </div>
  );
}
