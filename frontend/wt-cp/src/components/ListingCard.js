import React, { useState } from "react";
import { T, label, inr, formatDateRange, dateFromApi } from "../theme";

/* One listing's self-service controls: disable/enable, delete, reprice, and
   block out specific days (independent of real bookings) — everything an
   owner needs to manage a piece without a lender ever touching it. */
export default function ListingCard({ p, theme, removing, saving, onRemove, onToggleActive, onUpdatePrice, onAddUnavailable, onRemoveUnavailable }) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(p.rent));
  const [priceError, setPriceError] = useState("");
  const [showDates, setShowDates] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangeError, setRangeError] = useState("");
  const busy = removing || saving;

  const savePrice = async () => {
    const value = Number(priceInput);
    if (!value || value <= 0) { setPriceError("Enter a price greater than 0."); return; }
    setPriceError("");
    await onUpdatePrice(p.id, value);
    setEditingPrice(false);
  };

  const submitRange = async () => {
    if (!rangeFrom || !rangeTo) { setRangeError("Pick both dates."); return; }
    if (rangeFrom >= rangeTo) { setRangeError("The end date must be after the start date."); return; }
    setRangeError("");
    await onAddUnavailable(p.id, { from: rangeFrom, to: rangeTo });
    setRangeFrom(""); setRangeTo("");
  };

  return (
    <article style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", opacity: p.active ? 1 : 0.65 }}>
      <div style={{ position: "relative", aspectRatio: "3/4", background: theme.tint, overflow: "hidden" }}>
        {p.img && (
          <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {!p.active && (
          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", background: T.ink, color: T.paper, padding: "4px 8px", borderRadius: 2 }}>
            Disabled
          </span>
        )}
      </div>
      <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
        <div>
          <span style={{ ...label, marginBottom: 7, display: "block" }}>{theme.label}{p.garment ? ` · ${p.garment}` : ""}</span>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 17, lineHeight: 1.25, margin: 0 }}>{p.name}</h3>
        </div>

        {editingPrice ? (
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 14 }}>₹</span>
              <input type="number" min="1" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} autoFocus
                style={{ width: 84, fontFamily: "Karla, sans-serif", fontSize: 14, padding: "6px 8px", border: `1px solid ${T.line}`, borderRadius: 3 }} />
              <span style={{ fontSize: 12, color: T.ink3 }}>/ day</span>
              <button onClick={savePrice} disabled={busy} style={{ marginLeft: "auto", fontFamily: "Karla, sans-serif", fontSize: 12, padding: "7px 12px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: busy ? "default" : "pointer" }}>Save</button>
              <button onClick={() => { setEditingPrice(false); setPriceInput(String(p.rent)); setPriceError(""); }} style={{ fontFamily: "Karla, sans-serif", fontSize: 12, padding: "7px 12px", border: `1px solid ${T.line}`, borderRadius: 3, background: "transparent", cursor: "pointer" }}>Cancel</button>
            </div>
            {priceError && <p style={{ fontSize: 11, color: T.err, margin: "6px 0 0" }}>{priceError}</p>}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{inr(p.rent)}</span>
            <span style={{ fontSize: 12, color: T.ink3 }}>/ day</span>
            <button onClick={() => setEditingPrice(true)} style={{ fontFamily: "Karla, sans-serif", fontSize: 11, color: T.ink2, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Edit price</button>
            <span style={{ fontSize: 11, color: T.ink3, marginLeft: "auto" }}>{p.units} unit{p.units === 1 ? "" : "s"}</span>
          </div>
        )}

        <div>
          <button onClick={() => setShowDates((v) => !v)} style={{ fontFamily: "Karla, sans-serif", fontSize: 12, color: T.ink2, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            {showDates ? "Hide" : "Manage"} unavailable dates{p.unavailableDates.length ? ` (${p.unavailableDates.length})` : ""}
          </button>
          {showDates && (
            <div style={{ marginTop: 10, padding: 10, background: T.line2, borderRadius: 3, display: "flex", flexDirection: "column", gap: 8 }}>
              {p.unavailableDates.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{formatDateRange(dateFromApi(r.from), dateFromApi(r.to))}</span>
                  <button onClick={() => onRemoveUnavailable(p.id, i)} disabled={busy} style={{ fontFamily: "Karla, sans-serif", fontSize: 11, color: T.err, background: "none", border: "none", cursor: busy ? "default" : "pointer" }}>Remove</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <input type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 12, padding: "6px 8px", border: `1px solid ${T.line}`, borderRadius: 3 }} />
                <span style={{ fontSize: 11, color: T.ink3 }}>to</span>
                <input type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 12, padding: "6px 8px", border: `1px solid ${T.line}`, borderRadius: 3 }} />
                <button onClick={submitRange} disabled={busy} style={{ fontFamily: "Karla, sans-serif", fontSize: 12, padding: "7px 12px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: busy ? "default" : "pointer" }}>Block</button>
              </div>
              {rangeError && <p style={{ fontSize: 11, color: T.err, margin: 0 }}>{rangeError}</p>}
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => onToggleActive(p.id, !p.active)} disabled={busy}
            style={{ flex: 1, fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "11px", borderRadius: 3, cursor: busy ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.ink, opacity: busy ? 0.6 : 1 }}>
            {p.active ? "Disable" : "Enable"}
          </button>
          <button onClick={() => onRemove(p.id)} disabled={busy}
            style={{ flex: 1, fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "11px", borderRadius: 3, cursor: busy ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.err, opacity: busy ? 0.6 : 1 }}>
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}
