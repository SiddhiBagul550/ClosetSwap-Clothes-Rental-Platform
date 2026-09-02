import React from "react";
import { T, label } from "../theme";

function StatTile({ n, caption }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 4, padding: "18px 20px" }}>
      <p style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 34, margin: "0 0 4px" }}>{n}</p>
      <p style={{ ...label, margin: 0 }}>{caption}</p>
    </div>
  );
}

function AccountTable({ rows, ownerLabel, extraCol }) {
  if (!rows.length) {
    return (
      <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>No {ownerLabel.toLowerCase()} accounts yet.</p>
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${T.line}`, borderRadius: 4 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ background: T.card, textAlign: "left" }}>
            <th style={{ padding: "10px 16px", fontWeight: 600, color: T.ink2, borderBottom: `1px solid ${T.line}` }}>{ownerLabel}</th>
            <th style={{ padding: "10px 16px", fontWeight: 600, color: T.ink2, borderBottom: `1px solid ${T.line}` }}>Email</th>
            {extraCol && <th style={{ padding: "10px 16px", fontWeight: 600, color: T.ink2, borderBottom: `1px solid ${T.line}` }}>{extraCol.title}</th>}
            <th style={{ padding: "10px 16px", fontWeight: 600, color: T.ink2, borderBottom: `1px solid ${T.line}`, textAlign: "right" }}>Items listed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u._id} style={{ borderBottom: `1px solid ${T.line}` }}>
              <td style={{ padding: "10px 16px" }}>{u.username}</td>
              <td style={{ padding: "10px 16px", color: T.ink2 }}>{u.email}</td>
              {extraCol && <td style={{ padding: "10px 16px", color: T.ink2 }}>{extraCol.render(u)}</td>}
              <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600 }}>{u.itemCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Admin-only platform snapshot, backed by /api/v1/admin/overview (protect +
   restrictToAdmin on the backend). */
export default function AdminOverview({ data, loading, error, onRetry }) {
  return (
    <div className="cs-container" style={{ maxWidth: 980, margin: "0 auto", padding: "56px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 16 }}>Admin</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-.025em", margin: "0 0 10px" }}>
        Platform overview
      </h1>
      <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 28px", maxWidth: 560, lineHeight: 1.6 }}>
        Accounts and listings across the whole platform.
      </p>

      {loading ? (
        <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading overview…</p>
      ) : error ? (
        <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{error}</p>
          <button onClick={onRetry} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 40 }}>
            <StatTile n={data.totals.shops} caption="Shop accounts" />
            <StatTile n={data.totals.individuals} caption="Individual accounts" />
            <StatTile n={data.totals.items} caption="Total items listed" />
          </div>

          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 20, margin: "0 0 14px" }}>Shops ({data.shops.length})</h2>
          <div style={{ marginBottom: 40 }}>
            <AccountTable rows={data.shops} ownerLabel="Shop"
              extraCol={{ title: "Verification", render: (u) => u.verificationStatus }} />
          </div>

          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 20, margin: "0 0 14px" }}>Individuals ({data.individuals.length})</h2>
          <AccountTable rows={data.individuals} ownerLabel="Individual" />
        </>
      )}
    </div>
  );
}
