import React from "react";
import { T, AUD, label, inr, formatDateRange, dateFromApi } from "../theme";
import StatusPill from "./StatusPill";

const mapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/* Requests this user has sent, from GET /api/v1/bookings/mine. The lender's
   contact details only mean anything once they've accepted — while a
   request is pending or after it's declined/cancelled, that block is
   skipped rather than shown empty. */
export default function MyBookings({ items, loading, error, onRetry, onCancel, cancellingId, onMessage }) {
  return (
    <div className="cs-container" style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>{items.length} request{items.length === 1 ? "" : "s"} you've sent</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 34px" }}>
        My bookings
      </h1>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading your bookings…</p>
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
            const cancelling = cancellingId === b._id;
            const canCancel = b.status === "requested" || b.status === "accepted";
            const canMessage = canCancel;
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
                    {formatDateRange(dateFromApi(b.fromDate), dateFromApi(b.toDate))} · size {b.size} · {b.handoff === "Courier" ? "Couriered" : "Collect"}
                  </p>
                  <p style={{ fontSize: 13, color: T.ink3, margin: "0 0 10px" }}>{inr(b.total)} total</p>

                  {b.status === "accepted" && b.ownerInfo && (
                    <div style={{ borderTop: `1px solid ${T.line2}`, paddingTop: 10, marginBottom: canCancel ? 10 : 0 }}>
                      <p style={{ ...label, marginBottom: 6 }}>Lender's contact</p>
                      <p style={{ fontSize: 13, color: T.ink2, margin: "0 0 2px" }}>
                        {b.ownerInfo.username} · {b.ownerInfo.contactNumber}
                        {b.ownerInfo.accountType === "shop" && (
                          <span style={{
                            marginLeft: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase",
                            color: b.ownerInfo.verificationStatus === "verified" ? T.ok : T.ink3,
                          }}>
                            {b.ownerInfo.verificationStatus === "verified" ? "✓ Verified shop" : "Shop · pending verification"}
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 13, color: T.ink2, margin: "0 0 6px" }}>{b.ownerInfo.address}</p>
                      {b.ownerInfo.address && (
                        <a href={mapsUrl(b.ownerInfo.address)} target="_blank" rel="noopener noreferrer" title="See on Google Maps"
                          style={{ fontSize: 13, color: T.ink, textDecoration: "underline", textUnderlineOffset: 2 }}>
                          See on Maps
                        </a>
                      )}
                    </div>
                  )}

                  {(canMessage || canCancel) && (
                    <div style={{ display: "flex", gap: 10 }}>
                      {canMessage && (
                        <button onClick={() => onMessage(b)}
                          style={{ marginTop: 4, fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2 }}>
                          Message lender
                        </button>
                      )}
                      {canCancel && (
                        <button onClick={() => onCancel(b._id)} disabled={cancelling}
                          style={{ marginTop: 4, fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: cancelling ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.err, opacity: cancelling ? 0.6 : 1 }}>
                          {cancelling ? "Cancelling…" : "Cancel booking"}
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
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>No bookings yet</p>
          <p style={{ fontSize: 14, color: T.ink2, margin: 0, maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
            Requests you send from a listing will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
