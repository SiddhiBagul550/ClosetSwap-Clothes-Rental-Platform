import React from "react";
import { T, AUD, label } from "../theme";
import ListingCard from "./ListingCard";

/* Shows everything the logged-in user has listed for rent, across all
   categories — pulled from GET /api/v1/products?owner=<id>, which the
   backend already supports by passing req.query straight to Product.find().
   Each card is a ListingCard: disable/enable, reprice, block out days, or
   remove the listing entirely — all owner-only actions enforced server-side. */
export default function MyListings({ items, loading, error, onRetry, onRemove, removingId, savingId, onToggleActive, onUpdatePrice, onAddUnavailable, onRemoveUnavailable }) {
  return (
    <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "56px 32px 88px" }}>
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
            return (
              <ListingCard key={p.id} p={p} theme={theme} removing={removingId === p.id} saving={savingId === p.id}
                onRemove={onRemove} onToggleActive={onToggleActive} onUpdatePrice={onUpdatePrice}
                onAddUnavailable={onAddUnavailable} onRemoveUnavailable={onRemoveUnavailable} />
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
