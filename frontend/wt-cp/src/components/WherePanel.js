import React, { useState, useRef, useEffect } from "react";
import { T, label, toInputValue } from "../theme";
import { AREAS, areasWithinRadius, MAX_RADIUS_KM } from "../constants/areas";

/* Area, radius and dates used to gate the whole app behind a full first
   screen. They now live in one popover opened from the navbar, so browsing
   starts immediately and these stay adjustable, not mandatory. */
export default function WherePanel({ theme, area, setArea, areaCounts = {}, radius, setRadius, dateFrom, setDateFrom, dateTo, setDateTo, onDone }) {
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);
  const areaMenuRef = useRef(null);

  useEffect(() => {
    if (!areaMenuOpen) return;
    const onClick = (e) => { if (areaMenuRef.current && !areaMenuRef.current.contains(e.target)) setAreaMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setAreaMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [areaMenuOpen]);

  const chooseArea = (a) => { setArea(a); setAreaMenuOpen(false); };

  return (
    <div className="cs-where-panel" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: "min(320px, calc(100vw - 48px))", background: T.card, border: `1px solid ${T.line}`, borderRadius: 6, padding: "20px 22px", zIndex: 40, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
      <p style={{ ...label, marginBottom: 14 }}>Where & when</p>

      <p id="area-label" style={{ display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 }}>Your area in Pune</p>
      <div ref={areaMenuRef} style={{ position: "relative" }}>
        <button type="button" aria-haspopup="listbox" aria-expanded={areaMenuOpen} aria-labelledby="area-label"
          onClick={() => setAreaMenuOpen((o) => !o)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 12px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: area ? T.ink : T.ink3, cursor: "pointer" }}>
          <span>{area || "Choose an area"}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" style={{ flexShrink: 0, transform: areaMenuOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}>
            <path d="M1 1 L5 5 L9 1" stroke={T.ink3} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {areaMenuOpen && (
          <ul role="listbox" aria-labelledby="area-label"
            style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, margin: 0, padding: 4, listStyle: "none", maxHeight: 260, overflowY: "auto", background: T.card, border: `1px solid ${T.line}`, borderRadius: 6, boxShadow: "0 8px 20px rgba(0,0,0,.14)", zIndex: 50 }}>
            {AREAS.map((a) => {
              const count = areaCounts[a] || 0;
              const selected = a === area;
              return (
                <li key={a} role="option" aria-selected={selected} tabIndex={0}
                  onClick={() => chooseArea(a)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chooseArea(a); } }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = T.line2; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 13.5, padding: "8px 10px", borderRadius: 4, cursor: "pointer",
                    background: selected ? theme.tint : "transparent", color: selected ? theme.deep : T.ink, fontWeight: selected ? 600 : 400 }}>
                  <span>{a}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? T.ink2 : T.ink3, background: T.line2, borderRadius: 999, padding: "2px 8px", minWidth: 22, textAlign: "center", flexShrink: 0 }}>
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button style={{ background: "none", border: "none", padding: 0, marginTop: 8, fontFamily: "Karla, sans-serif", fontSize: 12, color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
        Use my current location
      </button>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label htmlFor="rad" style={{ fontSize: 12, color: T.ink2, fontWeight: 500 }}>How far will you travel?</label>
          <span style={{ fontSize: 12, color: T.ink }}>{radius >= MAX_RADIUS_KM ? "All Pune" : `${radius} km`}</span>
        </div>
        <input id="rad" type="range" min="2" max={MAX_RADIUS_KM} step="1" value={radius} onChange={(e) => setRadius(+e.target.value)}
          style={{ width: "100%", accentColor: theme.deep }} />

        {area && (
          <p style={{ fontSize: 12, color: T.ink3, margin: "8px 0 0", lineHeight: 1.5 }}>
            {radius >= MAX_RADIUS_KM ? "All of Pune: " : `Within ${radius} km: `}
            {areasWithinRadius(area, radius).map((x) => x.area).join(", ")}
          </p>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, color: T.ink2, fontWeight: 500, marginBottom: 6 }}>Dates</p>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, color: T.ink3, marginBottom: 4 }}>From</label>
            <input type="date" value={toInputValue(dateFrom)}
              onChange={(e) => {
                const d = new Date(`${e.target.value}T00:00:00`);
                setDateFrom(d);
                if (d > dateTo) setDateTo(d);
              }}
              style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 13, padding: "6px 8px", border: `1px solid ${T.line}`, borderRadius: 3 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, color: T.ink3, marginBottom: 4 }}>To</label>
            <input type="date" value={toInputValue(dateTo)} min={toInputValue(dateFrom)}
              onChange={(e) => setDateTo(new Date(`${e.target.value}T00:00:00`))}
              style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 13, padding: "6px 8px", border: `1px solid ${T.line}`, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      <button onClick={onDone}
        style={{ width: "100%", marginTop: 20, fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "11px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
        Show the rail
      </button>
    </div>
  );
}
