import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import BookingFlow from "./components/BookingFlow";
import * as api from "./api";
import { GARMENT_TYPES_BY_CATEGORY } from "./constants/garmentTypes";

/* ============================================================
   Closet Swap — peer-to-peer + shop clothing rental marketplace
   Single-file UI. Screens: splash, location gate, browse,
   listing detail, lend, auth.
   ============================================================ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,0,500;9..144,1,300&family=Karla:wght@300;400;500;600&display=swap');`;

const T = {
  paper: "#FBFAF8", card: "#FFFFFF", ink: "#211E2B", ink2: "#5D5869", ink3: "#918C9C",
  line: "#EAE6EA", line2: "#F3F0F3", err: "#A6474B", ok: "#4C6B41",
};

const AUD = {
  women: { label: "Women", accent: "#D99BAE", deep: "#8E4F63", tint: "#F8F0F3", line: "#F0DDE3" },
  men:   { label: "Men",   accent: "#8FA5C2", deep: "#3F5878", tint: "#F1F4F8", line: "#DDE4EE" },
  kids:  { label: "Kids",  accent: "#A6C299", deep: "#4C6B41", tint: "#F3F7F0", line: "#DFE9DA" },
};

const AREAS = ["Kothrud", "Baner", "Viman Nagar", "Koregaon Park", "Hadapsar", "Wakad", "Aundh", "Kharadi"];

/* Occasion tags and the shop-vs-individual lender split were mock-only
   concepts with nothing behind them in the backend, so the filters for them
   have been dropped rather than wired to data that doesn't exist — leaving
   them in would mean picking almost any option empties the whole rail.
   The garment filter below is instead built from whatever sub-categories are
   actually present in the fetched products, per audience.

   Listings used to be hardcoded mock data. They're now real products from
   the backend (GET /api/v1/products), reshaped to the fields this UI reads.
   The backend has no concept yet of occasion, MRP, deposit, multiple sizes,
   handoff options, instant booking, a real availability calendar, location,
   or shop-vs-individual lenders — those fall back to neutral defaults below,
   and callers that display them (Card, BookingFlow) guard for the ones that
   can be genuinely absent (mrp, lender.rating, occ). */
function toListing(p) {
  const rent = Number(p.cost_per_day) || 0;
  return {
    id: p._id,
    aud: p.category,
    name: p.name,
    garment: p.sub_category,
    occ: null,
    rent,
    mrp: null,
    days: 1,
    extraDay: rent, // flat per-day pricing: every extra day costs the same as the first
    deposit: 0,
    sizes: p.size ? [p.size] : [],
    units: Math.max(1, Number(p.available_quantity) || 1),
    area: "Pune",
    km: 0,
    hasLocation: false,
    handoff: ["Collect"],
    instant: false,
    booked: [],
    img: p.img,
    description: p.product_description,
    lender: { type: "person", rating: null, rentals: null, since: null },
  };
}

const inr = (n) => "₹" + n.toLocaleString("en-IN");
const label = { fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: T.ink3, fontWeight: 500 };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const toInputValue = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const formatDateRange = (from, to) => {
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  return sameMonth
    ? `${from.getDate()}–${to.getDate()} ${MONTHS[from.getMonth()]}`
    : `${from.getDate()} ${MONTHS[from.getMonth()]} – ${to.getDate()} ${MONTHS[to.getMonth()]}`;
};

/* Single source of truth for lender identity disclosure.
   Individuals stay anonymous until a booking is confirmed. */
function lenderFace(lender, confirmed = false) {
  if (lender.type === "shop") {
    return { display: lender.name, kind: "Rental shop", verified: true, anon: false };
  }
  return {
    display: confirmed ? lender.name || "Your lender" : "Verified lender",
    kind: "Individual",
    verified: true,
    anon: !confirmed,
  };
}

/* ---------------- Mark ---------------- */
function Mark({ size = 26, color = T.ink }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ display: "block", color }}>
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 26 L14.5 46.5 Q12.5 49.5 16 49.5 L48 49.5 Q51.5 49.5 49.5 46.5 Z" />
        <path d="M32 26 L32 21" />
        <path d="M32 21 A6 6 0 1 0 27.2 11.4" />
        <path d="M23.2 13.2 L27.4 11.3 L29.0 7.4" />
      </g>
    </svg>
  );
}

function Wordmark({ size = 21, accent = AUD.women.accent, color = T.ink }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <Mark size={size + 5} color={color} />
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: size, letterSpacing: "-.01em", color }}>
        Closet<span style={{ color: accent }}>·</span>Swap
      </span>
    </span>
  );
}

function Tick({ c = T.ok, s = 13 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={c} opacity=".14" />
      <path d="M7.5 12.3l3 3 6-6.5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Availability ribbon ---------------- */
function Ribbon({ booked, units, accent }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const out = booked.includes(i);
        const left = units - (out ? 1 : 0);
        return (
          <span key={i} title={out ? (units > 1 ? `${left} of ${units} free` : "Booked") : "Free"}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: out ? (units > 1 ? accent : T.line) : accent,
              opacity: out ? (units > 1 ? 0.35 : 1) : 0.9,
            }} />
        );
      })}
    </div>
  );
}

/* ---------------- Listing card ---------------- */
function Card({ p, theme, liked, toggle, open }) {
  const [hover, setHover] = useState(false);
  const face = lenderFace(p.lender);
  const free = 14 - p.booked.length;

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

        {p.occ && (
          <span style={{ position: "absolute", top: 12, left: 12, ...label, background: "rgba(255,255,255,.92)", padding: "5px 9px", borderRadius: 2, color: T.ink2 }}>
            {p.occ}
          </span>
        )}

        <button onClick={(e) => { e.stopPropagation(); toggle(p.id); }}
          aria-label={liked ? "Remove from saved" : "Save this piece"}
          style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", padding: 0 }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill={liked ? theme.accent : "none"} stroke={liked ? theme.accent : T.ink2} strokeWidth="1.8">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>

        {p.hasLocation && (
          <span style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, background: "rgba(255,255,255,.92)", padding: "5px 9px", borderRadius: 2, color: T.ink }}>
            {p.km} km · {p.area}
          </span>
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
            <span style={{ fontSize: 11, color: T.ink2 }}>{p.units > 1 ? `${p.units} units` : `${free} free`}</span>
          </div>
          <Ribbon booked={p.booked} units={p.units} accent={theme.accent} />

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

/* ---------------- Splash ---------------- */
function Splash({ onDone }) {
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

/* ---------------- Where & when panel ----------------
   Area, radius and dates used to gate the whole app behind a full first
   screen. They now live in one popover opened from the navbar, so browsing
   starts immediately and these stay adjustable, not mandatory. */
function WherePanel({ theme, area, setArea, radius, setRadius, dateFrom, setDateFrom, dateTo, setDateTo, onDone }) {
  return (
    <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: 320, background: T.card, border: `1px solid ${T.line}`, borderRadius: 6, padding: "20px 22px", zIndex: 40, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
      <p style={{ ...label, marginBottom: 14 }}>Where & when</p>

      <label htmlFor="area" style={{ display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 }}>Your area in Pune</label>
      <select id="area" value={area || ""} onChange={(e) => setArea(e.target.value)}
        style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 12px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: area ? T.ink : T.ink3 }}>
        <option value="">Choose an area</option>
        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      <button style={{ background: "none", border: "none", padding: 0, marginTop: 8, fontFamily: "Karla, sans-serif", fontSize: 12, color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
        Use my current location
      </button>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label htmlFor="rad" style={{ fontSize: 12, color: T.ink2, fontWeight: 500 }}>How far will you travel?</label>
          <span style={{ fontSize: 12, color: T.ink }}>{radius} km</span>
        </div>
        <input id="rad" type="range" min="2" max="25" step="1" value={radius} onChange={(e) => setRadius(+e.target.value)}
          style={{ width: "100%", accentColor: theme.deep }} />
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

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

const NON_GARMENT_SUBCATEGORIES = ["Footwear", "Accessories", "Costumes"];

/* ---------------- Lend ----------------
   Marketing copy is unchanged; the two CTA cards from the mock have been
   replaced with a real form wired to POST /api/v1/products (the one product
   write the backend actually supports — no separate shop-account flow, no
   instant-booking toggle, since neither exists server-side). */
function Lend({ theme, user, onNeedLogin, onListed }) {
  const steps = [
    ["List it in five minutes", "Photos, size, and what it cost new. We suggest a rent price from what similar pieces earn in your area."],
    ["You approve every request", "Nothing leaves your wardrobe without your yes. Shops can switch on instant booking instead."],
    ["Handover or courier", "Meet the renter, or let us pick up and drop off. You choose per listing."],
    ["Paid on return", "Money lands in your account after the piece comes back and passes inspection."],
  ];

  const emptyForm = { name: "", category: "", sub_category: "", available_quantity: "1", size: "", cost_per_day: "", product_description: "" };
  const [form, setForm] = useState(emptyForm);
  const [img, setImg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value, ...(name === "category" ? { sub_category: "" } : {}) }));
  };

  const pickImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(await readAsDataURL(file));
  };

  const inputStyle = { width: "100%", fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 12px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink };
  const fieldLabel = { display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.category || !form.sub_category || !form.size || !form.cost_per_day || !img) {
      setErr("Fill in every field and add a photo.");
      return;
    }
    if (Number(form.cost_per_day) <= 0 || Number(form.available_quantity) <= 0) {
      setErr("Cost per day and quantity must be greater than 0.");
      return;
    }
    setSubmitting(true);
    try {
      await api.createProduct({ ...form, img, owner: user.id });
      setForm(emptyForm);
      setImg("");
      setDone(true);
      onListed?.();
    } catch (error) {
      setErr(error.response?.data?.message || "Couldn't list this item, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1220, margin: "0 auto", padding: "64px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 12 }}>For shops and for anyone with a full wardrobe</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(34px,4.4vw,54px)", letterSpacing: "-.025em", lineHeight: 1.06, margin: "0 0 18px" }}>
        The outfit you wore once<br /><em style={{ fontStyle: "italic", color: theme.deep }}>can pay for itself.</em>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: T.ink2, maxWidth: 520, margin: "0 0 36px" }}>
        A wedding outfit sitting in a cupboard earns nothing. Listed here it earns around {inr(1800)} a month in Pune, and you decide who takes it and when.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 26, marginBottom: 44 }}>
        {steps.map(([h, b], i) => (
          <div key={h} style={{ borderTop: `2px solid ${theme.accent}`, paddingTop: 16 }}>
            <span style={{ ...label, display: "block", marginBottom: 8 }}>Step {i + 1}</span>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 19, margin: "0 0 8px" }}>{h}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: T.ink2, margin: 0 }}>{b}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 44 }}>
        {!user ? (
          <div style={{ background: theme.tint, border: `1px solid ${theme.line}`, borderRadius: 4, padding: "28px 30px", maxWidth: 480 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 21, margin: "0 0 8px" }}>Log in to list something</h3>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 18px", lineHeight: 1.6 }}>Takes two minutes, then you can list as many pieces as you like.</p>
            <button onClick={onNeedLogin} style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : done ? (
          <div style={{ border: `1px solid ${theme.line}`, background: theme.tint, borderRadius: 4, padding: "28px 30px", maxWidth: 480 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 21, margin: "0 0 8px" }}>Listed</h3>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 18px" }}>It's live on the rail now.</p>
            <button onClick={() => setDone(false)} style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "10px 18px", border: `1px solid ${T.line}`, borderRadius: 3, background: "transparent", color: T.ink2, cursor: "pointer" }}>
              List another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ maxWidth: 560 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 24, margin: "0 0 20px" }}>List an item</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-name">Product name</label>
                <input id="ln-name" name="name" value={form.name} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-cat">Category</label>
                <select id="ln-cat" name="category" value={form.category} onChange={change} style={inputStyle}>
                  <option value="">Choose</option>
                  {Object.keys(AUD).map((k) => <option key={k} value={k}>{AUD[k].label}</option>)}
                </select>
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-sub">Garment type</label>
                <select id="ln-sub" name="sub_category" value={form.sub_category} onChange={change} disabled={!form.category} style={inputStyle}>
                  <option value="">{form.category ? "Choose" : "Pick a category first"}</option>
                  {(GARMENT_TYPES_BY_CATEGORY[form.category] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                  {NON_GARMENT_SUBCATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-size">Size</label>
                <input id="ln-size" name="size" value={form.size} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-qty">Available quantity</label>
                <input id="ln-qty" name="available_quantity" type="number" min="1" value={form.available_quantity} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-cost">Cost per day (₹)</label>
                <input id="ln-cost" name="cost_per_day" type="number" min="1" value={form.cost_per_day} onChange={change} style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-desc">Description</label>
                <textarea id="ln-desc" name="product_description" value={form.product_description} onChange={change} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-img">Photo</label>
                <input id="ln-img" type="file" accept="image/jpeg,image/png" onChange={pickImage} style={inputStyle} />
                {img && <img src={img} alt="Preview" style={{ marginTop: 10, maxWidth: 160, borderRadius: 4, display: "block" }} />}
              </div>
            </div>

            {err && <p style={{ fontSize: 13, color: T.err, margin: "16px 0 0" }}>{err}</p>}

            <button type="submit" disabled={submitting}
              style={{ marginTop: 20, fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Listing…" : "List this item"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------------- My listings ----------------
   Shows everything the logged-in user has listed for rent, across all
   categories — pulled from GET /api/v1/products?owner=<id>, which the
   backend already supports by passing req.query straight to Product.find().
   A lighter card than the browse Card: no booking action (you can't book
   your own piece), just what's live and a way to take it down. */
function MyListings({ items, loading, error, onRetry, onRemove, removingId }) {
  return (
    <div style={{ maxWidth: 1220, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>{items.length} piece{items.length === 1 ? "" : "s"} you've listed</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 34px" }}>
        Your listings
      </h1>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading your listings…</p>
      ) : error ? (
        <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{error}</p>
          <button onClick={onRetry} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : items.length ? (
        <div className="cs-grid">
          {items.map((p) => {
            const theme = AUD[p.aud] || AUD.women;
            const removing = removingId === p.id;
            return (
              <article key={p.id} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", aspectRatio: "3/4", background: theme.tint, overflow: "hidden" }}>
                  {p.img && (
                    <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ ...label, marginBottom: 7 }}>{theme.label}{p.garment ? ` · ${p.garment}` : ""}</span>
                  <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 17, lineHeight: 1.25, margin: "0 0 9px" }}>{p.name}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 15 }}>
                    <span style={{ fontSize: 17, fontWeight: 600 }}>{inr(p.rent)}</span>
                    <span style={{ fontSize: 12, color: T.ink3 }}>/ day</span>
                    <span style={{ fontSize: 11, color: T.ink3, marginLeft: "auto" }}>{p.units} unit{p.units === 1 ? "" : "s"}</span>
                  </div>
                  <button onClick={() => onRemove(p.id)} disabled={removing}
                    style={{ marginTop: "auto", width: "100%", fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "11px", borderRadius: 3, cursor: removing ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.err, opacity: removing ? 0.6 : 1 }}>
                    {removing ? "Removing…" : "Remove listing"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>Nothing listed yet</p>
          <p style={{ fontSize: 14, color: T.ink2, margin: 0, maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
            Anything you list for rent will show up here.
          </p>
        </div>
      )}
    </div>
  );
}

function AuthField({ id, lb, hint, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 }}>{lb}</label>
      {children}
      {error ? <p style={{ fontSize: 12, color: T.err, margin: "6px 0 0" }}>{error}</p>
        : hint ? <p style={{ fontSize: 12, color: T.ink3, margin: "6px 0 0" }}>{hint}</p> : null}
    </div>
  );
}

/* ---------------- Auth ----------------
   Wired to the real backend, which only knows email + password (no phone/OTP,
   so that method has been dropped rather than left as a fake simulation).
   onDone(user) is called with the signed-in user on success. */
function Auth({ mode, setMode, theme, onDone }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState(""); const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  const inputStyle = (bad) => ({
    width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, padding: "12px 13px",
    border: `1px solid ${bad ? T.err : T.line}`, borderRadius: 3, background: T.paper, color: T.ink,
  });

  const submit = async () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
    if (pw.length < 8) e.pw = "Passwords are at least 8 characters";
    if (isSignup) {
      if (name.trim().length < 2) e.name = "Enter your name";
      if (pwConfirm !== pw) e.pwConfirm = "Passwords do not match";
      if (contactNumber.trim().length < 10) e.contactNumber = "Enter a valid contact number";
      if (address.trim().length < 1) e.address = "Enter your address";
    }
    setErr(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const user = isSignup
        ? await api.signup({ username: name, email, password: pw, passwordConfirm: pwConfirm, contactNumber, address })
        : await api.login(email, pw);
      onDone(user);
    } catch (error) {
      setErr({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth" style={{ display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)", minHeight: "calc(100vh - 70px)" }}>
      <aside style={{ background: theme.tint, padding: "44px 46px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: `1px solid ${T.line}` }}>
        <Mark size={30} color={theme.deep} />
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontStyle: "italic", fontSize: 30, lineHeight: 1.25, letterSpacing: "-.02em", margin: "0 0 18px" }}>
            Somebody three streets away already owns the thing you need on Saturday.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: T.ink2, margin: 0, maxWidth: 330 }}>
            Rent it from them or from a shop nearby. We handle the handover, the cleaning and anything that goes wrong in between.
          </p>
        </div>
        <div style={{ display: "flex", gap: 34, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
          <div><p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0 }}>1,400</p><p style={{ ...label, marginTop: 4 }}>Pieces nearby</p></div>
          <div><p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0 }}>190</p><p style={{ ...label, marginTop: 4 }}>Lenders in Pune</p></div>
        </div>
      </aside>

      <main style={{ background: T.card, padding: "48px 52px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, letterSpacing: "-.02em", margin: "0 0 6px" }}>
            {isSignup ? "Open an account" : "Welcome back"}
          </h1>
          <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>
            {isSignup ? "Two minutes, then the whole rail is yours." : "Pick up where you left off."}
          </p>

          {isSignup && (
            <AuthField id="nm" lb="Your name" error={err.name}>
              <input id="nm" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} style={inputStyle(err.name)} />
            </AuthField>
          )}

          <AuthField id="em" lb="Email address" error={err.email}>
            <input id="em" type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} style={inputStyle(err.email)} />
          </AuthField>
          <AuthField id="pwd" lb="Password" error={err.pw}>
            <input id="pwd" type="password" value={pw} autoComplete={isSignup ? "new-password" : "current-password"} onChange={(e) => setPw(e.target.value)} style={inputStyle(err.pw)} />
          </AuthField>

          {isSignup && (
            <>
              <AuthField id="pwdc" lb="Confirm password" error={err.pwConfirm}>
                <input id="pwdc" type="password" value={pwConfirm} autoComplete="new-password" onChange={(e) => setPwConfirm(e.target.value)} style={inputStyle(err.pwConfirm)} />
              </AuthField>
              <AuthField id="contact" lb="Contact number" error={err.contactNumber}>
                <input id="contact" inputMode="tel" value={contactNumber} autoComplete="tel" onChange={(e) => setContactNumber(e.target.value)} style={inputStyle(err.contactNumber)} />
              </AuthField>
              <AuthField id="addr" lb="Address" error={err.address}>
                <input id="addr" value={address} autoComplete="street-address" onChange={(e) => setAddress(e.target.value)} style={inputStyle(err.address)} />
              </AuthField>
            </>
          )}

          {err.form && <p style={{ fontSize: 13, color: T.err, margin: "-6px 0 16px" }}>{err.form}</p>}

          <button onClick={submit} disabled={loading}
            style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, fontWeight: 500, padding: "14px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
          </button>

          <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "24px 0 0" }}>
            {isSignup ? "Already renting with us? " : "New here? "}
            <span onClick={() => { setMode(isSignup ? "login" : "signup"); setErr({}); }}
              style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
              {isSignup ? "Log in" : "Create an account"}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function ClosetSwap() {
  const [screen, setScreen] = useState("splash");   // splash | app
  const [view, setView] = useState("browse");       // browse | lend | auth
  const [mode, setMode] = useState("login");
  const [area, setArea] = useState("");
  const [radius, setRadius] = useState(10);
  const [aud, setAud] = useState("women");
  const [garment, setGarment] = useState(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [dateFrom, setDateFrom] = useState(() => addDays(new Date(), 1));
  const [dateTo, setDateTo] = useState(() => addDays(new Date(), 5));
  const [whereOpen, setWhereOpen] = useState(false);
  const whereRef = useRef(null);

  useEffect(() => {
    if (!whereOpen) return;
    const onClick = (e) => { if (whereRef.current && !whereRef.current.contains(e.target)) setWhereOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [whereOpen]);

  const [user, setUser] = useState(() => api.getStoredUser());
  const [liked, setLiked] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [myListingsError, setMyListingsError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const theme = AUD[aud];
  const switchAud = (k) => { setAud(k); setGarment(null); };

  const goToAuth = (m) => { setMode(m); setView("auth"); };

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const raw = await api.fetchProducts();
      setProducts(raw.map(toListing));
    } catch (error) {
      setProductsError("Couldn't reach the server — is the backend running?");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (!user) { setLiked([]); return; }
    api.fetchUser(user.id).then((u) => setLiked(u.likeditems || [])).catch(() => setLiked([]));
  }, [user]);

  const loadMyListings = useCallback(async () => {
    if (!user) { setMyListings([]); return; }
    setMyListingsLoading(true);
    setMyListingsError("");
    try {
      const raw = await api.fetchMyProducts(user.id);
      setMyListings(raw.map(toListing));
    } catch (error) {
      setMyListingsError("Couldn't load your listings — is the backend running?");
    } finally {
      setMyListingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === "mylistings" && user) loadMyListings();
  }, [view, user, loadMyListings]);

  const removeListing = async (id) => {
    if (!window.confirm("Remove this listing? This can't be undone.")) return;
    setRemovingId(id);
    try {
      await api.deleteProduct(id);
      setMyListings((l) => l.filter((p) => p.id !== id));
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      setMyListingsError("Couldn't remove that listing, please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const toggle = async (id) => {
    if (!user) { goToAuth("login"); return; }
    const wasLiked = liked.includes(id);
    setLiked((l) => (wasLiked ? l.filter((x) => x !== id) : [...l, id]));
    try {
      await api.toggleLike(user.id, id);
    } catch {
      setLiked((l) => (wasLiked ? [...l, id] : l.filter((x) => x !== id))); // revert on failure
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setLiked([]);
    setSavedOnly(false);
    setMyListings([]);
    if (view === "mylistings") setView("browse");
  };

  const garmentOptions = useMemo(() => (
    [...new Set(products.filter((p) => p.aud === aud).map((p) => p.garment).filter(Boolean))].sort()
  ), [products, aud]);

  const results = useMemo(() => products.filter((p) =>
    p.aud === aud &&
    p.km <= radius &&
    (!garment || p.garment === garment) &&
    (!savedOnly || liked.includes(p.id))
  ), [products, aud, radius, garment, savedOnly, liked]);

  if (screen === "splash") return (<><style>{FONTS}</style><Splash onDone={() => setScreen("app")} /></>);

  return (
    <div style={{ fontFamily: "Karla, sans-serif", background: T.paper, color: T.ink, minHeight: "100vh", position: "relative" }}>
      <style>{FONTS}</style>
      <style>{`
        *{box-sizing:border-box}
        button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid ${theme.deep};outline-offset:2px}
        @media (prefers-reduced-motion:reduce){*{transition:none!important}}
        .cs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:20px}
        .cs-shell{display:grid;grid-template-columns:196px 1fr;gap:44px}
        .cs-rail{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none}
        .cs-rail::-webkit-scrollbar{display:none}
        @media(max-width:900px){.cs-shell{grid-template-columns:1fr;gap:26px}
          .cs-auth{grid-template-columns:1fr!important}
          .cs-auth aside{border-right:none!important;border-bottom:1px solid ${T.line};padding:28px 24px!important}
          .cs-auth main{padding:34px 24px!important}}
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(251,250,248,.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 32px", height: 70, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <Wordmark accent={theme.accent} />
          </button>

          <div role="tablist" aria-label="Shop for" style={{ display: "flex", gap: 2, border: `1px solid ${T.line}`, borderRadius: 999, padding: 3, background: T.card }}>
            {Object.entries(AUD).map(([k, v]) => (
              <button key={k} role="tab" aria-selected={aud === k} onClick={() => { switchAud(k); setView("browse"); }}
                style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: aud === k ? v.tint : "transparent", color: aud === k ? v.deep : T.ink2, fontWeight: aud === k ? 600 : 400, transition: "all .22s ease" }}>
                {v.label}
              </button>
            ))}
          </div>

          <div ref={whereRef} style={{ position: "relative" }}>
            <button onClick={() => setWhereOpen((o) => !o)}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 13, color: T.ink2, background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, padding: "8px 15px", cursor: "pointer" }}>
              {area || "Set area"} · {radius} km · {formatDateRange(dateFrom, dateTo)}
            </button>
            {whereOpen && (
              <WherePanel theme={theme} area={area} setArea={setArea} radius={radius} setRadius={setRadius}
                dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
                onDone={() => setWhereOpen(false)} />
            )}
          </div>

          <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: T.ink2 }}>
            <button onClick={() => setView("lend")} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "lend" ? T.ink : T.ink2, cursor: "pointer" }}>Lend yours</button>
            <button onClick={() => (user ? setView("mylistings") : goToAuth("login"))} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "mylistings" ? T.ink : T.ink2, cursor: "pointer" }}>My listings</button>
            <span onClick={() => (user ? setSavedOnly((s) => !s) : goToAuth("login"))}
              style={{ cursor: "pointer", color: savedOnly ? theme.deep : T.ink2, fontWeight: savedOnly ? 600 : 400 }}>
              Saved {liked.length > 0 && <b style={{ color: theme.deep }}>({liked.length})</b>}
            </span>
            {user ? (
              <>
                <span style={{ color: T.ink }}>Hi, {user.username?.split(" ")[0] || "there"}</span>
                <button onClick={handleLogout}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 13, background: "transparent", color: T.ink2, border: `1px solid ${T.line}`, padding: "9px 17px", borderRadius: 999, cursor: "pointer" }}>
                  Log out
                </button>
              </>
            ) : (
              <button onClick={() => goToAuth("login")}
                style={{ fontFamily: "Karla, sans-serif", fontSize: 13, background: T.ink, color: T.paper, border: "none", padding: "10px 18px", borderRadius: 999, cursor: "pointer" }}>
                Log in
              </button>
            )}
          </nav>
        </div>
      </header>

      {view === "auth" && <Auth mode={mode} setMode={setMode} theme={theme} onDone={(u) => { setUser(u); setView("browse"); }} />}
      {view === "lend" && <Lend theme={theme} user={user} onNeedLogin={() => goToAuth("login")} onListed={() => { loadProducts(); loadMyListings(); setView("browse"); }} />}

      {view === "mylistings" && (
        user ? (
          <MyListings items={myListings} loading={myListingsLoading} error={myListingsError} onRetry={loadMyListings} onRemove={removeListing} removingId={removingId} />
        ) : (
          <div style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 18px" }}>Log in to see your listings</p>
            <button onClick={() => goToAuth("login")}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        )
      )}

      {view === "browse" && (
        <>
          {/* Hero */}
          <section style={{ maxWidth: 1220, margin: "0 auto", padding: "56px 32px 34px" }}>
            <p style={{ ...label, marginBottom: 16 }}>{results.length} pieces within {radius} km of {area || "you"}</p>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(34px,4.6vw,58px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: 0, maxWidth: 720 }}>
              Dress for the occasion,<br /><em style={{ fontStyle: "italic", color: theme.deep }}>borrow it from the neighbourhood.</em>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: T.ink2, maxWidth: 480, margin: "22px 0 0" }}>
              Every piece here belongs to a shop or a person near you. Collect it yourself, or have it couriered both ways.
            </p>
          </section>

          {/* Catalogue */}
          <section style={{ maxWidth: 1220, margin: "0 auto", padding: "0 32px 80px" }}>
            <div className="cs-shell">
              <aside>
                {garmentOptions.length > 0 && (
                  <>
                    <p style={{ ...label, marginBottom: 12 }}>Garment</p>
                    <div style={{ display: "grid", gap: 2, marginBottom: 28 }}>
                      {garmentOptions.map((g) => (
                        <button key={g} onClick={() => setGarment(garment === g ? null : g)}
                          style={{ fontFamily: "Karla, sans-serif", textAlign: "left", fontSize: 14, padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: 3,
                            background: garment === g ? theme.tint : "transparent", color: garment === g ? theme.deep : T.ink2, fontWeight: garment === g ? 600 : 400 }}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <p style={{ ...label, marginBottom: 10 }}>Distance</p>
                <input type="range" min="2" max="25" value={radius} onChange={(e) => setRadius(+e.target.value)} style={{ width: "100%", accentColor: theme.deep }} aria-label="Search radius in kilometres" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.ink3, marginTop: 4 }}>
                  <span>2 km</span><span>{radius} km</span><span>25 km</span>
                </div>
              </aside>

              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, paddingBottom: 16, borderBottom: `1px solid ${T.line}` }}>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 24, margin: 0 }}>
                    {garment || `${theme.label}'s rail`}
                  </h2>
                  <span style={{ fontSize: 13, color: T.ink3 }}>{results.length} nearby · {formatDateRange(dateFrom, dateTo)}</span>
                </div>

                {productsLoading ? (
                  <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading pieces…</p>
                ) : productsError ? (
                  <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{productsError}</p>
                    <button onClick={loadProducts} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                      Try again
                    </button>
                  </div>
                ) : results.length ? (
                  <div className="cs-grid">
                    {results.map((p) => <Card key={p.id} p={p} theme={theme} liked={liked.includes(p.id)} toggle={toggle} open={setDetail} />)}
                  </div>
                ) : savedOnly && liked.length === 0 ? (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>Nothing saved yet</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      Tap the heart on a piece you like and it'll show up here.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setSavedOnly(false)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Browse pieces
                      </button>
                    </div>
                  </div>
                ) : savedOnly ? (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>No saved pieces match your filters</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      Your saved items are outside the current distance, garment, or category filters.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setRadius(25)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Search all of Pune
                      </button>
                      <button onClick={() => setGarment(null)}
                        style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2, borderRadius: 3, cursor: "pointer" }}>
                        Clear filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>Nothing within {radius} km yet</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      {area || "Your area"} is still filling up. Widen the search, or be the first to lend here.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setRadius(25)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Search all of Pune
                      </button>
                      <button onClick={() => { setGarment(null); setSavedOnly(false); }}
                        style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2, borderRadius: 3, cursor: "pointer" }}>
                        Clear filters
                      </button>
                      <button onClick={() => setView("lend")} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${theme.accent}`, background: theme.tint, color: theme.deep, borderRadius: 3, cursor: "pointer" }}>
                        Lend something here
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section style={{ background: theme.tint, borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }}>
            <div style={{ maxWidth: 1220, margin: "0 auto", padding: "60px 32px" }}>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, letterSpacing: "-.02em", margin: "0 0 32px" }}>How renting here works</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 26 }}>
                {[
                  ["Set your area and dates", "The rail only shows what's genuinely free near you on those days."],
                  ["Book or request", "Shops confirm instantly. Individuals have 12 hours to accept, and you're charged only then."],
                  ["Collect or get it couriered", "Meet the lender, or we move it both ways for a flat fee."],
                  ["Drop it back", "Return it directly to the lender. Minor wear is covered."],
                ].map(([h, b], i) => (
                  <div key={h} style={{ borderTop: `2px solid ${theme.accent}`, paddingTop: 16 }}>
                    <span style={{ ...label, display: "block", marginBottom: 8 }}>Step {i + 1}</span>
                    <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 18, margin: "0 0 8px" }}>{h}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: T.ink2, margin: 0 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <footer style={{ borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", padding: "36px 32px", display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={17} accent={theme.accent} />
          <nav style={{ display: "flex", gap: 24, fontSize: 13, color: T.ink2, flexWrap: "wrap" }}>
            {["Lend your wardrobe", "Open a shop account", "Sizing help", "Damage policy", "Areas we cover"].map((x) => <span key={x} style={{ cursor: "pointer" }}>{x}</span>)}
          </nav>
          <span style={{ fontSize: 12, color: T.ink3 }}>Pune · {AREAS.length} areas live</span>
        </div>
      </footer>

      {detail && (
        <BookingFlow listing={detail} theme={theme} user={user}
          onNeedLogin={() => { setDetail(null); goToAuth("login"); }}
          onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
