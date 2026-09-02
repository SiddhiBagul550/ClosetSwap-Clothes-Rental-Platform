import React, { useState, useMemo } from "react";
import { T, label, inr, mapsUrl } from "../theme";
import { lenderFace, occupancyForWindow, useAvailability } from "../utils/listingHelpers";
import { Tick } from "./Icons";
import Ribbon from "./Ribbon";

export default function Card({ p, theme, liked, toggle, open }) {
  const [hover, setHover] = useState(false);
  const face = lenderFace(p.lender);
  const { loading: availLoading, bookings } = useAvailability(p.id);
  const occupiedByDay = useMemo(() => occupancyForWindow(bookings), [bookings]);
  const free = occupiedByDay.filter((occupied) => occupied < p.units).length;

  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: T.card, border: `1px solid ${hover ? theme.line : T.line}`, borderRadius: 4,
        overflow: "hidden", transition: "border-color .25s ease, transform .25s ease",
        transform: hover ? "translateY(-2px)" : "none", display: "flex", flexDirection: "column",
      }}>
      <div onClick={() => open(p)} style={{ position: "relative", aspectRatio: "3/4", background: theme.tint, cursor: "pointer", display: "grid", placeItems: "center", overflow: "hidden" }}>
        {p.img ? (
          <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 112%, ${theme.accent}30, transparent 68%)` }} />
            <svg viewBox="0 0 100 130" style={{ width: "60%", position: "relative" }} aria-hidden="true">
              <path d="M50 9 a5.5 5.5 0 1 1 .1 0 M50 20 v8 M19 121 q0 -58 31 -93 q31 35 31 93 z"
                fill="none" stroke={theme.deep} strokeOpacity=".26" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </>
        )}

        {((p.lender.type === "shop" && p.lender.verificationStatus === "verified") || p.occ) && (
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
            {p.lender.type === "shop" && p.lender.verificationStatus === "verified" && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, ...label, background: "rgba(255,255,255,.92)", padding: "5px 9px 5px 6px", borderRadius: 2, color: T.ok }}>
                <Tick c={T.ok} s={12} />
                Verified shop
              </span>
            )}
            {p.occ && (
              <span style={{ ...label, background: "rgba(255,255,255,.92)", padding: "5px 9px", borderRadius: 2, color: T.ink2 }}>
                {p.occ}
              </span>
            )}
          </div>
        )}

        <button onClick={(e) => { e.stopPropagation(); toggle(p.id); }}
          aria-label={liked ? "Remove from saved" : "Save this piece"}
          style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", padding: 0 }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill={liked ? theme.accent : "none"} stroke={liked ? theme.accent : T.ink2} strokeWidth="1.8">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>

        {p.area && (
          <a href={mapsUrl(p.area)} target="_blank" rel="noopener noreferrer" title={`Open ${p.area} in Google Maps`}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, background: "rgba(255,255,255,.92)", padding: "5px 9px", borderRadius: 2, color: T.ink, textDecoration: "none", cursor: "pointer" }}>
            {p.hasLocation ? `${p.km} km · ${p.area}` : p.area}
          </a>
        )}
      </div>

      <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
          <Tick c={face.anon ? T.ink3 : T.ok} />
          <span style={{ fontSize: 12, color: T.ink2, fontWeight: face.anon ? 400 : 500 }}>{face.display}</span>
          <span style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: T.ink3, border: `1px solid ${T.line}`, padding: "2px 6px", borderRadius: 2 }}>
            {face.kind}
          </span>
          <span style={{ fontSize: 12, color: T.ink3, marginLeft: "auto" }}>{p.lender.rating != null ? `${p.lender.rating.toFixed(1)}★` : "New"}</span>
        </div>

        <h3 onClick={() => open(p)} style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 17, lineHeight: 1.25, margin: "0 0 9px", cursor: "pointer" }}>
          {p.name}
        </h3>

        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 11 }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>{inr(p.rent)}</span>
          <span style={{ fontSize: 12, color: T.ink3 }}>/ {p.days === 1 ? "day" : `${p.days} days`}</span>
          {p.mrp != null && (
            <span style={{ fontSize: 11, color: T.ink3, textDecoration: "line-through", marginLeft: "auto" }}>{inr(p.mrp)}</span>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${T.line2}`, paddingTop: 10, marginTop: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ ...label }}>Next 14 days</span>
            <span style={{ fontSize: 11, color: T.ink2 }}>
              {availLoading ? "…" : p.units > 1 ? `${p.units} units` : `${free} free`}
            </span>
          </div>
          <Ribbon occupiedByDay={occupiedByDay} units={p.units} accent={theme.accent} />

          <div style={{ display: "flex", gap: 5, margin: "11px 0 12px", flexWrap: "wrap" }}>
            {p.sizes.map((s) => (
              <span key={s} style={{ fontSize: 11, color: T.ink2, border: `1px solid ${T.line}`, padding: "3px 8px", borderRadius: 2 }}>{s}</span>
            ))}
            <span style={{ fontSize: 11, color: T.ink3, marginLeft: "auto", alignSelf: "center" }}>{p.handoff.join(" · ")}</span>
          </div>

          <button onClick={() => open(p)}
            style={{
              width: "100%", fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "11px",
              borderRadius: 3, cursor: "pointer",
              border: p.instant ? "none" : `1px solid ${theme.accent}`,
              background: p.instant ? T.ink : theme.tint,
              color: p.instant ? T.paper : theme.deep,
            }}>
            {p.instant ? "Book instantly" : "Request to book"}
          </button>
        </div>
      </div>
    </article>
  );
}
