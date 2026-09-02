import { useState, useEffect } from "react";
import * as api from "../api";
import { addDays, T } from "../theme";

/* Occasion tags were a mock-only concept with nothing behind them in the
   backend, so the filter for it has been dropped rather than wired to data
   that doesn't exist — leaving it in would mean picking almost any option
   empties the whole rail. The garment filter is instead built from
   whatever sub-categories are actually present in the fetched products, per
   audience.

   Listings used to be hardcoded mock data. They're now real products from
   the backend (GET /api/v1/products), reshaped to the fields this UI reads.
   The backend has no concept yet of occasion, MRP, deposit, multiple sizes,
   instant booking, or a real availability calendar — those fall back to
   neutral defaults below, and callers that display them (Card, BookingFlow)
   guard for the ones that can be genuinely absent (mrp, lender.rating, occ).
   Shop-vs-individual lender IS wired: each product comes back with
   `ownerInfo` (see productsController.attachOwners), so Card's "Rental shop"
   pill and BookingFlow's isShop branches reflect the real owner's
   accountType. Handoff options ARE wired too: each product has a required
   `delivery_option` ("courier" | "handoff" | "both"), unpacked into the
   `handoff` array below.

   `area` does come from the backend now (every product requires one). `km`
   and `hasLocation` are left off here on purpose — they depend on the area
   the viewer picked, not the listing itself, so they're computed fresh per
   viewer in the `results` useMemo in ClosetSwap rather than baked in at
   fetch time. */
// Kept in sync by hand with the delivery_option enum in backend/models/productModel.js
export const DELIVERY_OPTIONS = [
  { value: "courier", label: "Courier", handoff: ["Courier"] },
  { value: "handoff", label: "Personal handoff", handoff: ["Handoff"] },
  { value: "both", label: "Both", handoff: ["Courier", "Handoff"] },
];
export const HANDOFF_BY_DELIVERY_OPTION = Object.fromEntries(DELIVERY_OPTIONS.map((o) => [o.value, o.handoff]));

export const NON_GARMENT_SUBCATEGORIES = ["Footwear", "Accessories", "Costumes"];

export const BOOKING_STATUS = {
  requested: { text: "Awaiting response", color: "#8E6F1C" },
  accepted: { text: "Accepted", color: T.ok },
  declined: { text: "Declined", color: T.err },
  cancelled: { text: "Cancelled", color: T.ink3 },
};

export function toListing(p) {
  const rent = Number(p.cost_per_day) || 0;
  return {
    id: p._id,
    owner: p.owner,
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
    area: p.area || null,
    handoff: HANDOFF_BY_DELIVERY_OPTION[p.delivery_option] || [],
    instant: false,
    img: p.img,
    description: p.product_description,
    active: p.isActive !== false,
    unavailableDates: (p.unavailableDates || []).map((r) => ({ from: r.from, to: r.to })),
    lender: p.ownerInfo && p.ownerInfo.accountType === "shop"
      ? { type: "shop", name: p.ownerInfo.username, rating: null, rentals: null, since: null, address: p.ownerInfo.address || null }
      : { type: "person", rating: null, rentals: null, since: null },
  };
}

/* Single source of truth for lender identity disclosure.
   Individuals stay anonymous until a booking is confirmed. */
export function lenderFace(lender, confirmed = false) {
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

/* Turns the active (requested/accepted) bookings from GET
   /bookings/availability/:productId into a per-day occupied-units count for
   the next `days` days, so the rail card reflects real bookings instead of
   an always-empty mock calendar. */
export function occupancyForWindow(bookings, days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i);
    return (bookings || []).reduce((sum, b) => {
      const from = new Date(b.fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(b.toDate);
      to.setHours(0, 0, 0, 0);
      return day >= from && day < to ? sum + 1 : sum;
    }, 0);
  });
}

export function useAvailability(productId) {
  const [state, setState] = useState({ loading: true, bookings: [] });
  useEffect(() => {
    let alive = true;
    setState({ loading: true, bookings: [] });
    api.fetchAvailability(productId)
      .then(({ bookings }) => { if (alive) setState({ loading: false, bookings: bookings || [] }); })
      .catch(() => { if (alive) setState({ loading: false, bookings: [] }); });
    return () => { alive = false; };
  }, [productId]);
  return state;
}

export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

/* Strips spaces/dashes and an optional +91/91/0 prefix, leaving a bare 10-digit number. */
export function normalizeContactNumber(raw) {
  return raw.replace(/[\s-]/g, "").replace(/^(\+?91|0)/, "");
}
