import React from "react";
import { T } from "../theme";

/* Points at the navbar "Set area" control on first visit, so new users
   notice they can pick an area, distance and rental dates from there
   instead of stumbling onto it. Dismisses itself once, permanently,
   via localStorage — and immediately if the user opens the panel it
   points at. */
export default function WhereCoachmark({ theme, onDismiss }) {
  return (
    <div role="status" style={{
      position: "absolute", top: "calc(100% + 14px)", left: "calc(100% + 14px)", width: "min(250px, calc(100vw - 48px))", zIndex: 45,
      background: T.ink, color: T.paper, borderRadius: 6, padding: "14px 16px",
      boxShadow: "0 10px 28px rgba(0,0,0,.22)",
    }}>
      <div aria-hidden="true" style={{ position: "absolute", top: -6, left: 24, width: 12, height: 12, background: T.ink, transform: "rotate(45deg)" }} />
      <button onClick={onDismiss} aria-label="Dismiss"
        style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", color: T.paper, opacity: .6, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 6 }}>
        ✕
      </button>
      <p style={{ fontFamily: "Karla, sans-serif", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px", paddingRight: 12 }}>
        Set your <b>area</b>, travel distance and rental <b>dates</b> here — the rail updates to match.
      </p>
      <button onClick={onDismiss}
        style={{ fontFamily: "Karla, sans-serif", fontSize: 12, fontWeight: 500, padding: "7px 14px", border: "none", borderRadius: 999, background: theme.accent, color: T.ink, cursor: "pointer" }}>
        Got it
      </button>
    </div>
  );
}
