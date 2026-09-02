import React from "react";
import { T, label } from "../theme";

const STATUS_META = {
  pending: { text: "Pending", color: "#8E6F1C" },
  verified: { text: "Verified", color: T.ok },
  rejected: { text: "Rejected", color: T.err },
};

const FILTERS = [
  ["pending", "Pending"],
  ["verified", "Verified"],
  ["rejected", "Rejected"],
  ["all", "All shops"],
];

function Pill({ status }) {
  const s = STATUS_META[status] || { text: status, color: T.ink3 };
  return (
    <span style={{ fontSize: 11, letterSpacing: ".04em", fontWeight: 600, color: s.color, border: `1px solid ${s.color}`, padding: "3px 9px", borderRadius: 999 }}>
      {s.text}
    </span>
  );
}

/* Admin-only queue for shop GSTIN verification, backed by /api/v1/admin/shops
   (protect + restrictToAdmin on the backend - this screen is only reachable
   through the nav link that's itself gated on api.checkAdmin()). */
export default function AdminShops({ items, loading, error, onRetry, statusFilter, onFilterChange, onVerify, onReject, onRevoke, actingId }) {
  return (
    <div className="cs-container" style={{ maxWidth: 980, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>Admin</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 10px" }}>
        Shop verification
      </h1>
      <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 28px", maxWidth: 560, lineHeight: 1.6 }}>
        Every shop account starts pending until its GSTIN is checked. Approve to unlock full shop features, or reject with a reason the owner can act on.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
        {FILTERS.map(([k, t]) => (
          <button key={k} onClick={() => onFilterChange(k)}
            style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "8px 15px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${statusFilter === k ? T.ink : T.line}`, background: statusFilter === k ? T.ink : "transparent",
              color: statusFilter === k ? T.paper : T.ink2, fontWeight: statusFilter === k ? 600 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading shops…</p>
      ) : error ? (
        <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{error}</p>
          <button onClick={onRetry} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : items.length ? (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((s) => {
            const acting = actingId === s._id;
            return (
              <article key={s._id} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 19, margin: 0 }}>{s.username}</h3>
                  <Pill status={s.verificationStatus} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "4px 20px", fontSize: 13, color: T.ink2, marginBottom: 12 }}>
                  <span>Owner: {s.ownerName || "—"}</span>
                  <span>GSTIN: {s.gstin || "—"}</span>
                  <span>Email: {s.email}</span>
                  <span>Phone: {s.contactNumber || "—"}</span>
                  <span style={{ gridColumn: "1 / -1" }}>Address: {s.address || "—"}</span>
                  {s.createdAt && <span>Applied: {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                </div>

                {s.verificationStatus === "rejected" && s.rejectionReason && (
                  <p style={{ fontSize: 13, color: T.err, background: "#fdecea", borderRadius: 3, padding: "8px 12px", margin: "0 0 12px" }}>
                    Rejected: {s.rejectionReason}
                  </p>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {s.verificationStatus !== "verified" && (
                    <button onClick={() => onVerify(s._id)} disabled={acting}
                      style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: acting ? "default" : "pointer", border: "none", background: T.ink, color: T.paper, opacity: acting ? 0.6 : 1 }}>
                      {acting ? "Working…" : "Approve"}
                    </button>
                  )}
                  {s.verificationStatus !== "rejected" && (
                    <button onClick={() => onReject(s._id)} disabled={acting}
                      style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: acting ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.err, opacity: acting ? 0.6 : 1 }}>
                      Reject
                    </button>
                  )}
                  {s.verificationStatus !== "pending" && (
                    <button onClick={() => onRevoke(s._id)} disabled={acting}
                      style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 3, cursor: acting ? "default" : "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2, opacity: acting ? 0.6 : 1 }}>
                      Send back to pending
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>Nothing here</p>
          <p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>No shop accounts match this filter right now.</p>
        </div>
      )}
    </div>
  );
}
