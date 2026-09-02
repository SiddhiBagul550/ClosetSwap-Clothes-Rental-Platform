import React from "react";
import { T, AUD, label, inr, formatDateRange, dateFromApi } from "../theme";
import StatusPill from "./StatusPill";

/* Booking requests this user has received as a lender, from GET
   /api/v1/bookings/received. Accepting or declining calls PATCH
   /api/v1/bookings/:id/accept|decline — the only place either happens. */
export default function Requests({ items, loading, error, onRetry, onAccept, onDecline, actingId, onMessage }) {
  return (
    <div className="cs-container" style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>{items.length} request{items.length === 1 ? "" : "s"} on your listings</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 34px" }}>
        Requests
      </h1>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading requests…</p>
      ) : error ? (
        <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{error}</p>
          <button onClick={onRetry} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : items.length ? (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((b) => {
            const theme = AUD[b.listing?.category] || AUD.women;
            const acting = actingId === b._id;
            const canMessage = b.status === "requested" || b.status === "accepted";
            return (
              <article key={b._id} style={{ display: "flex", gap: 18, background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, padding: 18 }}>
                <div style={{ width: 84, height: 108, flexShrink: 0, borderRadius: 3, background: theme.tint, overflow: "hidden" }}>
                  {b.listing?.img && <img src={b.listing.img} alt={b.listing.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 18, margin: 0 }}>{b.listing?.name || "Listing removed"}</h3>
                    <StatusPill status={b.status} />
                  </div>
                  <p style={{ fontSize: 13, color: T.ink2, margin: "0 0 4px" }}>
                    From {b.renterInfo?.username || "a renter"} · {formatDateRange(dateFromApi(b.fromDate), dateFromApi(b.toDate))} · size {b.size}
                  </p>
                  <p style={{ fontSize: 13, color: T.ink3, margin: "0 0 12px" }}>
                    {b.handoff === "Courier" ? "Couriered" : "Collect"} · {inr(b.total)} total
                  </p>

                  {(canMessage || b.status === "requested") && (
                    <div style={{ display: "flex", gap: 10 }}>
                      {b.status === "requested" && (
                        <>
                          <button onClick={() => onAccept(b._id)} disabled={acting}
                            style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: acting ? "default" : "pointer", border: "none", background: T.ink, color: T.paper, opacity: acting ? 0.6 : 1 }}>
                            {acting ? "Working…" : "Accept"}
                          </button>
                          <button onClick={() => onDecline(b._id)} disabled={acting}
                            style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: acting ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.err, opacity: acting ? 0.6 : 1 }}>
                            Decline
                          </button>
                        </>
                      )}
                      {canMessage && (
                        <button onClick={() => onMessage(b)}
                          style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2 }}>
                          Message renter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>No requests yet</p>
          <p style={{ fontSize: 14, color: T.ink2, margin: 0, maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
            When someone asks to rent one of your pieces, it'll show up here.
          </p>
        </div>
      )}
    </div>
  );
}
