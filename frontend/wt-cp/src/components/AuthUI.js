import React from "react";

export const T = {
  paper: "#FBFAF8",
  card: "#FFFFFF",
  ink: "#211E2B",
  ink2: "#5D5869",
  ink3: "#918C9C",
  line: "#EAE6EA",
  line2: "#F3F0F3",
  accent: "#D99BAE",
  deep: "#8E4F63",
  tint: "#F6EFF1",
  err: "#A6474B",
};

export const label = {
  fontSize: 10,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: T.ink3,
  fontWeight: 500,
};

export function Wordmark({ size = 22, rail = true, color = T.ink, accent = T.accent }) {
  return (
    <span style={{ display: "inline-block", position: "relative", paddingTop: rail ? 14 : 0 }}>
      {rail && (
        <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "block" }}>
          <span style={{ display: "block", height: 1, background: T.line }} />
          <span style={{ display: "block", width: 1, height: 8, background: T.line, margin: "0 auto" }} />
        </span>
      )}
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: size, letterSpacing: "-.01em", color }}>
        Closet<span style={{ color: accent }}>·</span>Swap
      </span>
    </span>
  );
}

export function Field({ id, label: lb, hint, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 }}>
        {lb}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: T.err, margin: "6px 0 0" }}>{error}</p>}
      {!error && hint && <p style={{ fontSize: 12, color: T.ink3, margin: "6px 0 0" }}>{hint}</p>}
    </div>
  );
}

export const inputStyle = (bad) => ({
  width: "100%",
  fontFamily: "Karla, sans-serif",
  fontSize: 15,
  padding: "12px 13px",
  border: `1px solid ${bad ? T.err : T.line}`,
  borderRadius: 3,
  background: T.paper,
  color: T.ink,
});

export function BrandPanel() {
  return (
    <aside
      style={{
        background: T.tint,
        padding: "40px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: `1px solid ${T.line}`,
      }}
    >
      <Wordmark rail={false} size={20} />
      <div>
        <p
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: 30,
            lineHeight: 1.25,
            color: T.ink,
            margin: "0 0 18px",
            letterSpacing: "-.02em",
          }}
        >
          Somebody's wardrobe is already holding the thing you need on Saturday.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: T.ink2, margin: 0, maxWidth: 320 }}>
          Rent it from them, wear it, send it back. We handle delivery, cleaning and anything that goes wrong in between.
        </p>
      </div>
      <div style={{ display: "flex", gap: 34, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0, color: T.ink }}>1,400</p>
          <p style={{ ...label, marginTop: 4 }}>Pieces on the rail</p>
        </div>
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0, color: T.ink }}>24h</p>
          <p style={{ ...label, marginTop: 4 }}>Delivery in Pune</p>
        </div>
      </div>
    </aside>
  );
}
