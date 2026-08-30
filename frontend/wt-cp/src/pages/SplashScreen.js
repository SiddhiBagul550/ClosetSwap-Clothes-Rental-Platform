import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, label } from "../components/AuthUI";
import "../css/AuthNew.css";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const grow = setTimeout(() => setPhase(1), 60);
    const fade = setTimeout(() => setPhase(2), 1800);
    const leave = setTimeout(() => navigate("/shopping"), 2300);
    return () => {
      clearTimeout(grow);
      clearTimeout(fade);
      clearTimeout(leave);
    };
  }, [navigate]);

  return (
    <div
      className="cs-auth-page"
      style={{
        position: "absolute",
        inset: 0,
        background: T.paper,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        opacity: phase === 2 ? 0 : 1,
        transition: "opacity .5s ease",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 46%, ${T.tint}, transparent 75%)` }} />

      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          aria-hidden="true"
          style={{ height: 1, background: T.line, width: phase ? 240 : 0, margin: "0 auto", transition: "width .9s cubic-bezier(.22,1,.36,1)" }}
        />
        <div
          aria-hidden="true"
          style={{ width: 1, background: T.line, height: phase ? 30 : 0, margin: "0 auto", transition: "height .5s ease .55s" }}
        />

        <div
          style={{
            opacity: phase ? 1 : 0,
            transform: phase ? "none" : "translateY(6px)",
            transition: "opacity .7s ease .7s, transform .7s cubic-bezier(.22,1,.36,1) .7s",
          }}
        >
          <svg viewBox="0 0 90 110" width="58" aria-hidden="true" style={{ display: "block", margin: "0 auto 22px" }}>
            <path d="M15 104 q0 -54 30 -86 q30 32 30 86 z" fill="none" stroke={T.accent} strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 36, letterSpacing: "-.02em", color: T.ink, margin: 0 }}>
            Closet<span style={{ color: T.accent }}>·</span>Swap
          </p>
          <p style={{ ...label, marginTop: 14 }}>Rent, refresh, revamp your style</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/shopping")}
        style={{
          position: "absolute",
          bottom: 28,
          fontFamily: "Karla, sans-serif",
          fontSize: 12,
          color: T.ink3,
          background: "none",
          border: "none",
          cursor: "pointer",
          letterSpacing: ".06em",
        }}
      >
        Skip
      </button>
    </div>
  );
}
