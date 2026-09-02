import React, { useState, useEffect } from "react";
import { T, AUD, label } from "../theme";
import { Mark } from "./Icons";

export default function Splash({ onDone }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOn(true), 60);
    const b = setTimeout(onDone, 1900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [onDone]);

  return (
    <div style={{ minHeight: "100vh", background: T.paper, display: "grid", placeItems: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 52% at 50% 46%, ${AUD.women.tint}, transparent 74%)` }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ height: 1, background: T.line, width: on ? 240 : 0, margin: "0 auto", transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
        <div style={{ width: 1, background: T.line, height: on ? 28 : 0, margin: "0 auto", transition: "height .45s ease .55s" }} />
        <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(6px)", transition: "opacity .7s ease .7s, transform .7s cubic-bezier(.22,1,.36,1) .7s" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><Mark size={54} color={AUD.women.deep} /></div>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 36, letterSpacing: "-.02em", margin: 0 }}>
            Closet<span style={{ color: AUD.women.accent }}>·</span>Swap
          </p>
          <p style={{ ...label, marginTop: 14 }}>Rent from your neighbourhood</p>
        </div>
      </div>
      <button onClick={onDone} style={{ position: "absolute", bottom: 30, fontFamily: "Karla, sans-serif", fontSize: 12, color: T.ink3, background: "none", border: "none", cursor: "pointer", letterSpacing: ".06em" }}>Skip</button>
    </div>
  );
}
