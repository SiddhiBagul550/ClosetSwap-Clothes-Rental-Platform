import React from "react";
import { T, AUD, label } from "../theme";
import StatusPill from "./StatusPill";

/* Every conversation this user is party to (as renter or owner), from GET
   /api/v1/messages/threads — one row per Booking that has ever had a
   message, newest activity first. Opening a row hands its booking to the
   ChatThread modal in ClosetSwap(). */
export default function Messages({ items, loading, error, onRetry, onOpen, currentUserId }) {
  return (
    <div className="cs-container" style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>{items.length} conversation{items.length === 1 ? "" : "s"}</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 34px" }}>
        Messages
      </h1>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading your messages…</p>
      ) : error ? (
        <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{error}</p>
          <button onClick={onRetry} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : items.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((t) => {
            const theme = AUD[t.listing?.category] || AUD.women;
            const iAmRenter = t.booking.renter === currentUserId;
            const unread = t.unreadCount > 0;
            return (
              <button key={t.booking._id} onClick={() => onOpen(t)}
                style={{ display: "flex", gap: 16, alignItems: "center", textAlign: "left", background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, padding: 16, cursor: "pointer" }}>
                <div style={{ width: 52, height: 68, flexShrink: 0, borderRadius: 3, background: theme.tint, overflow: "hidden" }}>
                  {t.listing?.img && <img src={t.listing.img} alt={t.listing.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
                    <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: unread ? 500 : 400, fontSize: 16, margin: 0 }}>
                      {t.counterpart?.username || (iAmRenter ? "The lender" : "The renter")}
                    </h3>
                    <StatusPill status={t.booking.status} />
                  </div>
                  <p style={{ fontSize: 13, color: T.ink3, margin: "0 0 4px" }}>{t.listing?.name || "Listing removed"}</p>
                  <p style={{ fontSize: 13, color: unread ? T.ink : T.ink2, fontWeight: unread ? 600 : 400, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.lastMessage ? t.lastMessage.text : "No messages yet — say hello."}
                  </p>
                </div>
                {unread && (
                  <span style={{ flexShrink: 0, minWidth: 20, height: 20, borderRadius: 999, background: T.err, color: T.paper, fontSize: 11, fontWeight: 600, display: "grid", placeItems: "center", padding: "0 6px" }}>
                    {t.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>No conversations yet</p>
          <p style={{ fontSize: 14, color: T.ink2, margin: 0, maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
            Once you send or receive a booking request, you can message the other side here.
          </p>
        </div>
      )}
    </div>
  );
}
