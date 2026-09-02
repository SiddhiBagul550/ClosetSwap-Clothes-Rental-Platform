import React, { useState, useMemo, useEffect } from "react";
import * as api from "../api";

/* ============================================================
   Closet Swap — booking flow
   Dates → handoff → review → request sent.
   Availability comes from GET /bookings/availability/:productId and
   submitting posts a real request to POST /bookings — the lender accepts
   or declines it later from the "Requests" screen. Every listing here is an
   individual (the backend has no shop-account concept yet), so requests
   always need the lender's yes; the isShop branches below are dead for now
   but kept generic in case that ever changes.
   ============================================================ */

const T = {
  paper: "#FBFAF8", card: "#FFFFFF", ink: "#211E2B", ink2: "#5D5869", ink3: "#918C9C",
  line: "#EAE6EA", line2: "#F3F0F3", err: "#A6474B", ok: "#4C6B41",
};

const COURIER = 120;

const label = { fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: T.ink3, fontWeight: 500 };
const inr = (n) => "₹" + n.toLocaleString("en-IN");
const mapsUrlForQuery = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapsUrl = (area) => mapsUrlForQuery(`${area}, Pune, India`);

/* Local calendar-day key, deliberately not UTC-based (toISOString would shift
   the date whenever the browser's timezone isn't UTC). Used both for the
   calendar's own day cells and for turning /bookings/availability's dates
   back into keys, so the two always agree on what "day" means. */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toLocalDate = (val) => new Date(`${String(val).slice(0, 10)}T00:00:00`);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const nights = (a, b) => Math.round((b - a) / 86400000);

/* Turns GET /bookings/availability/:productId into a day -> occupied-units
   map. The owner's own blackout ranges (blockedDates) are folded in here
   too, marked as occupying every unit since they're a hard block regardless
   of how many identical units exist. */
function bookedMapFromAvailability(data, units) {
  const map = {};
  (data?.bookings || []).forEach((b) => {
    const start = toLocalDate(b.fromDate);
    const end = toLocalDate(b.toDate);
    for (let d = new Date(start); d < end; d = addDays(d, 1)) {
      const key = iso(d);
      map[key] = (map[key] || 0) + 1;
    }
  });
  (data?.blockedDates || []).forEach((r) => {
    const start = toLocalDate(r.fromDate);
    const end = toLocalDate(r.toDate);
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      map[iso(d)] = units;
    }
  });
  return map;
}

/* A day is unusable when every unit is out. */
function dayState(map, units, d) {
  const key = iso(d);
  const out = map[key] || 0;
  if (out >= units) return "full";
  if (out > 0) return "partial";
  return "free";
}

function leadDays(handoff) { return handoff === "Courier" ? 2 : 1; }

function Tick({ c = T.ok, s = 14 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={c} opacity=".14" />
      <path d="M7.5 12.3l3 3 6-6.5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GarmentGlyph({ theme }) {
  return (
    <svg viewBox="0 0 100 130" style={{ height: "76%", position: "relative" }} aria-hidden="true">
      <path d="M50 9 a5.5 5.5 0 1 1 .1 0 M50 20 v8 M19 121 q0 -58 31 -93 q31 35 31 93 z"
        fill="none" stroke={theme.deep} strokeOpacity=".26" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Calendar ---------------- */
function Month({ year, month, booked, units, from, to, onPick, minStart, theme }) {
  const first = new Date(year, month, 1);
  const pad = (first.getDay() + 6) % 7;               // Monday-first
  const len = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(pad).fill(null), ...Array.from({ length: len }, (_, i) => new Date(year, month, i + 1))];

  return (
    <div>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, margin: "0 0 12px", textAlign: "center" }}>
        {first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={{ ...label, textAlign: "center", padding: "0 0 6px" }}>{d}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const st = dayState(booked, units, d);
          const tooSoon = d < minStart;
          const dead = st === "full" || tooSoon;
          const inRange = from && to && d > from && d < to;
          const edge = (from && +d === +from) || (to && +d === +to);

          let bg = "transparent", col = T.ink, bd = "1px solid transparent";
          if (dead) { col = T.ink3; }
          if (st === "partial" && !dead) { bd = `1px solid ${theme.line}`; }
          if (inRange) { bg = theme.tint; }
          if (edge) { bg = T.ink; col = T.paper; }

          return (
            <button key={i} disabled={dead} onClick={() => onPick(d)}
              title={st === "full" ? "Fully booked" : st === "partial" ? `${units - (booked[iso(d)] || 0)} of ${units} free` : tooSoon ? "Too soon for this handover" : "Available"}
              style={{
                position: "relative", aspectRatio: "1", fontFamily: "Karla, sans-serif", fontSize: 13,
                border: bd, borderRadius: 3, background: bg, color: col,
                cursor: dead ? "not-allowed" : "pointer", opacity: dead ? 0.4 : 1,
                textDecoration: st === "full" ? "line-through" : "none",
              }}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Flow ---------------- */
export default function BookingFlow({ listing, theme, user, onNeedLogin, onClose, resume }) {
  const [step, setStep] = useState(resume ? 3 : 1);
  const [from, setFrom] = useState(resume?.from ?? null);
  const [to, setTo] = useState(resume?.to ?? null);
  const [handoff, setHandoff] = useState(resume?.handoff ?? null);
  const [deliveryAddress, setDeliveryAddress] = useState(resume?.deliveryAddress ?? "");
  const [size, setSize] = useState(resume?.size ?? null);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null); // { units, bookings } | null while loading
  const [availabilityError, setAvailabilityError] = useState("");

  const isShop = listing.lender.type === "shop";
  const isOwnListing = !!user && listing.owner === user.id;
  const units = availability?.units ?? listing.units;
  const baseDays = listing.baseDays ?? listing.days;
  const minDays = listing.minDays ?? 1;
  const extraDay = listing.extraDay ?? Math.round((listing.rent / baseDays) * 0.3 / 10) * 10;

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const booked = useMemo(() => bookedMapFromAvailability(availability, units), [availability, units]);
  const minStart = addDays(today, leadDays(handoff || (listing.handoff.includes("Courier") ? "Courier" : "Collect")));

  useEffect(() => {
    let cancelled = false;
    setAvailability(null);
    setAvailabilityError("");
    api.fetchAvailability(listing.id)
      .then((data) => { if (!cancelled) setAvailability(data); })
      .catch(() => { if (!cancelled) setAvailabilityError("Couldn't load availability for this piece — is the backend running?"); });
    return () => { cancelled = true; };
  }, [listing.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (d) => {
    setErr("");
    if (!from || (from && to)) { setFrom(d); setTo(null); return; }
    if (d <= from) { setFrom(d); return; }
    // no blocked day may sit inside the range
    for (let x = new Date(from); x <= d; x = addDays(x, 1)) {
      const st = dayState(booked, units, x);
      if (st === "full") { setErr("That stretch runs into days the piece isn't free. Pick a shorter range."); return; }
    }
    if (nights(from, d) < minDays) { setErr(`This lender's minimum is ${minDays} days.`); return; }
    setTo(d);
  };

  const days = from && to ? nights(from, to) : 0;
  const extra = Math.max(0, days - baseDays);
  const rent = listing.rent + extra * extraDay;
  const courier = handoff === "Courier" ? COURIER : 0;
  const deposit = listing.deposit || 0;
  const total = rent + courier + deposit;

  const next = async () => {
    if (step === 1) {
      if (!from || !to) return setErr("Pick a pick-up and a return day.");
      if (!size) return setErr("Choose a size.");
      setErr(""); setStep(2); return;
    }
    if (step === 2) {
      if (!handoff) return setErr("Choose how you'll get it.");
      if (handoff === "Courier" && deliveryAddress.trim().length < 15) {
        return setErr("Add your complete delivery address — house/flat, street, area, city and pincode — so the courier can find you.");
      }
      setErr(""); setStep(3); return;
    }
    if (step === 3) {
      if (!user) { onNeedLogin({ from, to, size, handoff, deliveryAddress }); return; }
      if (isOwnListing) return;
      setErr("");
      setSubmitting(true);
      try {
        await api.createBooking({
          productId: listing.id,
          fromDate: iso(from),
          toDate: iso(to),
          size,
          handoff,
          deliveryAddress: handoff === "Courier" ? deliveryAddress : undefined,
        });
        setStep(4);
      } catch (error) {
        setErr(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const btn = (primary) => ({
    fontFamily: "Karla, sans-serif", fontSize: 15, fontWeight: 500, padding: "14px 26px", borderRadius: 3, cursor: "pointer",
    border: primary ? "none" : `1px solid ${T.line}`,
    background: primary ? T.ink : "transparent", color: primary ? T.paper : T.ink2,
  });

  const Row = ({ k, v, strong, muted }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: strong ? 16 : 14, fontWeight: strong ? 600 : 400, marginBottom: 8 }}>
      <span style={{ color: strong ? T.ink : T.ink2 }}>{k}</span>
      <span style={{ color: muted ? T.ok : T.ink }}>{v}</span>
    </div>
  );

  const hours = listing.lender.hours || (isShop ? "10:30 – 8:30, most days" : "arrange a time in chat once confirmed");

  return (
    <div role="dialog" aria-modal="true" aria-label={`Book ${listing.name}`} className="csbk-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(33,30,43,.4)", display: "grid", placeItems: "center", zIndex: 80, padding: 20 }}
      onClick={onClose}>
      <style>{`
        .csbk *{box-sizing:border-box}
        .csbk button:focus-visible{outline:2px solid ${theme.deep};outline-offset:2px}
        @media (prefers-reduced-motion:reduce){.csbk *{transition:none!important}}
        .csbk-grid{display:grid;grid-template-columns:1fr 320px;gap:36px;align-items:start}
        .csbk-cal{display:grid;grid-template-columns:1fr 1fr;gap:26px}
        @media(max-width:820px){
          .csbk-grid{grid-template-columns:1fr}
          .csbk-cal{grid-template-columns:1fr}
          .csbk-grid aside{position:static}
        }
        @media(max-width:640px){
          .csbk-backdrop{padding:0!important}
          .csbk{width:100vw!important;height:100vh!important;height:100dvh!important;border-radius:0!important;border:none!important}
          .csbk main{padding:20px 16px 28px!important}
        }
        @media(max-width:480px){
          .csbk-topbar{padding:12px 16px!important;gap:12px!important}
          .csbk-steps{gap:10px!important}
          .csbk-steps span{font-size:10px!important}
          .csbk-actions{flex-direction:column!important}
          .csbk-actions button{width:100%}
        }
      `}</style>

      <div className="csbk" onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1000px,100%)", height: "min(92vh,880px)", background: T.paper, borderRadius: 6,
          border: `1px solid ${T.line}`, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
        <div className="csbk-topbar" style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 28px", borderBottom: `1px solid ${T.line}`, background: T.card, flexShrink: 0 }}>
          <button onClick={onClose} aria-label="Close booking" style={{ background: "none", border: "none", fontSize: 22, color: T.ink2, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>×</button>
          <div className="csbk-steps" style={{ display: "flex", gap: 22, marginLeft: "auto", overflowX: "auto" }}>
            {["Dates", "Handover", "Review", "Done"].map((s, i) => (
              <span key={s} style={{
                fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase",
                color: step === i + 1 ? T.ink : T.ink3, fontWeight: step === i + 1 ? 600 : 400,
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {step > i + 1 && <Tick s={12} />}{s}
              </span>
            ))}
          </div>
        </div>

        <main style={{ overflowY: "auto", padding: "32px 28px 40px" }}>
          <div className="csbk-grid">
            <div>
              {step === 1 && (
                <>
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-.02em", margin: "0 0 8px" }}>When do you need it?</h1>
                  <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 24px", maxWidth: 480, lineHeight: 1.6 }}>
                    {availabilityError ? availabilityError : units === 1
                      ? "This is a one-off piece."
                      : `This lender holds ${units} identical units, so part-booked days are still available.`}
                    {" "}Minimum {minDays} {minDays === 1 ? "day" : "days"}.
                  </p>

                  <div className="csbk-cal" style={{ marginBottom: 20 }}>
                    <Month year={today.getFullYear()} month={today.getMonth()} booked={booked} units={units} from={from} to={to} onPick={pick} minStart={minStart} theme={theme} />
                    <Month year={addMonths(today, 1).getFullYear()} month={addMonths(today, 1).getMonth()} booked={booked} units={units} from={from} to={to} onPick={pick} minStart={minStart} theme={theme} />
                  </div>

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: T.ink2, borderTop: `1px solid ${T.line}`, paddingTop: 16, marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: T.ink }} /> Your dates</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 12, height: 12, borderRadius: 2, border: `1px solid ${theme.line}` }} /> Part booked</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, opacity: .5 }}><s>12</s> Fully booked</span>
                  </div>

                  <p style={{ ...label, marginBottom: 10 }}>Size</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {listing.sizes.map((s) => (
                      <button key={s} onClick={() => { setSize(s); setErr(""); }}
                        style={{ fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 18px", borderRadius: 3, cursor: "pointer",
                          border: `1px solid ${size === s ? theme.accent : T.line}`, background: size === s ? theme.tint : "transparent", color: size === s ? theme.deep : T.ink2 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-.02em", margin: "0 0 8px" }}>How will you get it?</h1>
                  <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>
                    {isShop ? listing.lender.name : "The lender"}
                    {listing.hasLocation ? ` is in ${listing.area}, ${listing.km} km from you.` : "'s exact location is shared once you agree on a handover."}
                  </p>

                  <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
                    {listing.handoff.map((h) => {
                      const on = handoff === h;
                      const copy = h === "Courier"
                        ? ["Couriered both ways", `${inr(COURIER)} · arrives the morning of ${from ? fmt(from) : "pick-up"} · book at least 2 days ahead`]
                        : ["Collect it yourself", `Free · ${isShop ? hours : "arrange a time in chat once confirmed"}${listing.hasLocation ? ` · ${listing.km} km` : ""}`];
                      return (
                        <button key={h} onClick={() => { setHandoff(h); setErr(""); }}
                          style={{ textAlign: "left", fontFamily: "Karla, sans-serif", padding: "18px 20px", borderRadius: 4, cursor: "pointer",
                            border: `1px solid ${on ? theme.accent : T.line}`, background: on ? theme.tint : T.card }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                            <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1px solid ${on ? theme.deep : T.line}`, background: on ? theme.deep : "transparent", display: "grid", placeItems: "center" }}>
                              {on && <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.paper }} />}
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 500, color: T.ink }}>{copy[0]}</span>
                          </span>
                          <span style={{ fontSize: 13, color: T.ink2, paddingLeft: 24, display: "block" }}>{copy[1]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {listing.handoff.length === 1 && (
                    <p style={{ fontSize: 13, color: T.ink3, margin: "16px 0 0", maxWidth: 480, lineHeight: 1.6 }}>
                      This lender only offers collection. If that doesn't work, filter for pieces that courier.
                    </p>
                  )}

                  {handoff === "Courier" && (
                    <div style={{ marginTop: 22, maxWidth: 560 }}>
                      <p style={{ ...label, marginBottom: 10 }}>Delivery address</p>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => { setDeliveryAddress(e.target.value); setErr(""); }}
                        placeholder="House/flat no., street, area, landmark, city, pincode"
                        rows={3}
                        style={{
                          width: "100%", fontFamily: "Karla, sans-serif", fontSize: 14, padding: "12px 14px",
                          borderRadius: 4, border: `1px solid ${T.line}`, resize: "vertical", color: T.ink,
                        }}
                      />
                      <p style={{ fontSize: 12, color: T.ink3, margin: "8px 0 0", lineHeight: 1.6 }}>
                        Needed so the courier can deliver it to you and collect it for return.
                      </p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-.02em", margin: "0 0 8px" }}>Check it over</h1>
                  <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>
                    {isShop ? "Booking is confirmed the moment you pay." : "Nothing is charged until the lender accepts."}
                  </p>

                  <div style={{ border: `1px solid ${T.line}`, borderRadius: 4, padding: "22px 24px", marginBottom: 18, background: T.card }}>
                    {[["Piece", `${listing.name} · size ${size}`],
                      ["Dates", `${fmt(from)} → ${fmt(to)} · ${days} days`],
                      ["Handover", handoff === "Courier" ? "Couriered both ways" : "You collect"],
                      ...(handoff === "Courier" ? [["Deliver to", deliveryAddress]] : []),
                      ["Lender", isShop ? `${listing.lender.name} · rental shop` : "Verified lender · individual"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 18, padding: "9px 0", borderBottom: `1px solid ${T.line2}` }}>
                        <span style={{ ...label, width: 96, flexShrink: 0, paddingTop: 3 }}>{k}</span>
                        <span style={{ fontSize: 14 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {!isShop && (
                    <div style={{ border: `1px solid ${theme.line}`, background: theme.tint, borderRadius: 4, padding: "16px 18px", marginBottom: 18 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 6px" }}>You're sending a request, not a booking</p>
                      <p style={{ fontSize: 13, color: T.ink2, margin: 0, lineHeight: 1.6 }}>
                        The lender has 12 hours to accept. Your card is held, not charged. If they decline or run out of time, the hold drops off and we'll show you three similar pieces nearby.
                      </p>
                      <p style={{ fontSize: 13, color: T.ink2, margin: "10px 0 0", lineHeight: 1.6 }}>
                        No need to rush anything outside the app — take your time getting to know a lender first.
                      </p>
                    </div>
                  )}

                  <p style={{ fontSize: 12, color: T.ink3, lineHeight: 1.6, maxWidth: 520 }}>
                    Minor wear is covered. Damage beyond repair is charged at the piece's stated value{listing.mrp != null ? `, up to ${inr(listing.mrp)}` : ""}.
                  </p>
                </>
              )}

              {step === 4 && (
                <div style={{ maxWidth: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <Tick c={theme.deep} s={22} />
                    <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-.02em", margin: 0 }}>Request sent</h1>
                  </div>

                  <p style={{ fontSize: 15, color: T.ink2, lineHeight: 1.65, margin: "0 0 24px" }}>
                    The lender has been notified. Nothing has been charged — check <b>My bookings</b> to see when they respond.
                  </p>
                  <div style={{ border: `1px solid ${T.line}`, borderRadius: 4, padding: "20px 22px", background: T.card, marginBottom: 18 }}>
                    <p style={{ ...label, marginBottom: 12 }}>Waiting on</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Tick c={T.ink3} s={16} />
                      <span style={{ fontSize: 15 }}>Verified lender</span>
                      <span style={{ ...label, border: `1px solid ${T.line}`, padding: "3px 7px", borderRadius: 2 }}>Individual</span>
                    </div>
                    <p style={{ fontSize: 13, color: T.ink2, margin: "10px 0 0" }}>
                      {listing.lender.rating != null ? `${listing.lender.rating.toFixed(1)}★ · ${listing.lender.rentals} rentals` : "New lender"}
                      {listing.hasLocation ? ` · ${listing.area}, ${listing.km} km away` : ""}
                    </p>
                    <p style={{ fontSize: 12, color: T.ink3, margin: "12px 0 0", paddingTop: 12, borderTop: `1px solid ${T.line2}`, lineHeight: 1.6 }}>
                      Their name, phone and address stay hidden until they accept.
                    </p>
                  </div>
                  <button onClick={onClose} style={btn(true)}>Done</button>
                </div>
              )}

              {err && step < 4 && (
                <p role="alert" style={{ fontSize: 13, color: T.err, margin: "18px 0 0" }}>{err}</p>
              )}

              {step < 4 && (
                <div className="csbk-actions" style={{ display: "flex", gap: 10, marginTop: 30, borderTop: `1px solid ${T.line}`, paddingTop: 24 }}>
                  {step > 1 && <button onClick={() => { setStep(step - 1); setErr(""); }} style={btn(false)}>Back</button>}
                  <button onClick={next} disabled={submitting || (step === 3 && isOwnListing)}
                    title={step === 3 && isOwnListing ? "You can't book your own listing" : undefined}
                    style={{
                      ...btn(true),
                      opacity: submitting ? 0.7 : (step === 3 && isOwnListing) ? 0.5 : 1,
                      cursor: submitting ? "default" : (step === 3 && isOwnListing) ? "not-allowed" : "pointer",
                    }}>
                    {step === 3 ? (isOwnListing ? "You can't book your own listing" : submitting ? "Sending…" : "Send request") : "Continue"}
                  </button>
                </div>
              )}
            </div>

            {/* Sticky summary */}
            <aside style={{ position: "sticky", top: 0, border: `1px solid ${T.line}`, borderRadius: 4, background: T.card, overflow: "hidden" }}>
              <div style={{ aspectRatio: "4/3", background: theme.tint, display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
                {listing.img ? (
                  <img src={listing.img} alt={listing.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 80% at 50% 115%, ${theme.accent}30, transparent 66%)` }} />
                    <GarmentGlyph theme={theme} />
                  </>
                )}
              </div>

              <div style={{ padding: "18px 20px" }}>
                <p style={{ ...label, marginBottom: 6 }}>{[listing.occ, listing.garment].filter(Boolean).join(" · ")}</p>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 19, lineHeight: 1.25, margin: "0 0 16px" }}>{listing.name}</h2>
                {listing.description && (
                  <p style={{ fontSize: 13, color: T.ink2, lineHeight: 1.6, margin: "-8px 0 16px" }}>{listing.description}</p>
                )}

                {isShop && listing.lender.address ? (
                  // Shops are public businesses, so the full pickup address shows as soon as
                  // the listing is opened. Individual lenders stay area-only here — their
                  // exact address only appears once they've accepted a booking (My bookings).
                  <div style={{ margin: "-8px 0 16px" }}>
                    <p style={{ fontSize: 13, color: T.ink2, margin: "0 0 6px", lineHeight: 1.5 }}>{listing.lender.address}</p>
                    <a href={mapsUrlForQuery(listing.lender.address)} target="_blank" rel="noopener noreferrer" title="See on Google Maps"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.deep, textDecoration: "none" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                      </svg>
                      <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>See on Maps</span>
                    </a>
                  </div>
                ) : listing.area && (
                  <a href={mapsUrl(listing.area)} target="_blank" rel="noopener noreferrer" title={`Open ${listing.area} in Google Maps`}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.deep, textDecoration: "none", margin: "-8px 0 16px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                    </svg>
                    <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>
                      {listing.area}, Pune{listing.hasLocation ? ` · ${listing.km} km from you` : ""}
                    </span>
                  </a>
                )}

                {from && to ? (
                  <>
                    <Row k={`Rent, ${baseDays} days`} v={inr(listing.rent)} />
                    {extra > 0 && <Row k={`${extra} extra ${extra === 1 ? "day" : "days"}`} v={inr(extra * extraDay)} />}
                    {handoff === "Courier" && <Row k="Two-way courier" v={inr(COURIER)} />}
                    <Row k="Cleaning on return" v="Included" muted />
                    {deposit > 0 && <Row k="Deposit, refundable" v={inr(deposit)} />}
                    <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10, marginTop: 6 }}>
                      <Row k={isShop ? "Due now" : "Held, not charged"} v={inr(total)} strong />
                    </div>
                    {deposit > 0 && (
                      <p style={{ fontSize: 12, color: T.ink3, margin: "8px 0 0", lineHeight: 1.55 }}>
                        {inr(deposit)} of that comes back within 3 days of return.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>{inr(listing.rent)}</p>
                    <p style={{ fontSize: 13, color: T.ink3, margin: 0 }}>for {baseDays} days · {inr(extraDay)} each extra day</p>
                    <p style={{ fontSize: 13, color: T.ink2, margin: "16px 0 0", lineHeight: 1.6 }}>Pick your dates and the full cost appears here — no surprises at the end.</p>
                  </>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
