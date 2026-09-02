import React, { useState, useEffect, useRef, useCallback } from "react";
import * as api from "../api";

/* ============================================================
   Closet Swap — chat thread
   One conversation per booking (GET/POST /api/v1/messages/:bookingId).
   Renter and owner can message each other from the moment a request is
   sent; it closes once the booking is no longer requested/accepted (see
   CHATTABLE_STATUSES in messageController.js). Polls while open rather
   than pushing over a socket — no real-time infra exists in this app yet.
   ============================================================ */

const T = {
  paper: "#FBFAF8", card: "#FFFFFF", ink: "#211E2B", ink2: "#5D5869", ink3: "#918C9C",
  line: "#EAE6EA", line2: "#F3F0F3", err: "#A6474B", ok: "#4C6B41",
};

const POLL_MS = 4000;

function timeLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return sameDay ? time : `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

export default function ChatThread({ bookingId, title, subtitle, closed, currentUserId, onClose }) {
  const [messages, setMessages] = useState(null); // null while first load
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async (silent) => {
    try {
      const data = await api.fetchMessages(bookingId);
      setMessages(data);
      if (!silent) setError("");
    } catch {
      if (!silent) setError("Couldn't load this conversation — is the backend running?");
    }
  }, [bookingId]);

  useEffect(() => {
    load(false);
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      const message = await api.sendMessage(bookingId, text);
      setMessages((list) => [...(list || []), message]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Conversation about ${title}`}
      style={{ position: "fixed", inset: 0, background: "rgba(33,30,43,.4)", display: "grid", placeItems: "center", zIndex: 90, padding: 20 }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "min(480px,100%)", height: "min(640px,86vh)", background: T.paper, borderRadius: 6, border: `1px solid ${T.line}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${T.line}`, background: T.card, flexShrink: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
            {subtitle && <p style={{ fontSize: 12, color: T.ink2, margin: "2px 0 0" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close conversation" style={{ background: "none", border: "none", fontSize: 22, color: T.ink2, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages === null ? (
            <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", marginTop: 40 }}>Loading messages…</p>
          ) : messages.length === 0 ? (
            <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", marginTop: 40 }}>No messages yet — say hello.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender === currentUserId;
              return (
                <div key={m._id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%", fontSize: 14, lineHeight: 1.45, padding: "9px 13px", borderRadius: 12,
                    background: mine ? T.ink : T.card, color: mine ? T.paper : T.ink,
                    border: mine ? "none" : `1px solid ${T.line}`,
                    borderBottomRightRadius: mine ? 3 : 12, borderBottomLeftRadius: mine ? 12 : 3,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {m.text}
                  </div>
                  <span style={{ fontSize: 10.5, color: T.ink3, margin: "3px 4px 0" }}>{timeLabel(m.createdAt)}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p style={{ fontSize: 12.5, color: T.err, margin: "0 20px 8px" }}>{error}</p>}

        {closed ? (
          <p style={{ fontSize: 12.5, color: T.ink3, textAlign: "center", padding: "12px 20px", borderTop: `1px solid ${T.line}`, background: T.card, margin: 0 }}>
            This conversation is closed.
          </p>
        ) : (
          <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 14, borderTop: `1px solid ${T.line}`, background: T.card, flexShrink: 0 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" maxLength={2000}
              style={{ flex: 1, fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 13px", border: `1px solid ${T.line}`, borderRadius: 999, background: T.paper, color: T.ink }} />
            <button type="submit" disabled={sending || !draft.trim()}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 999, border: "none", cursor: sending || !draft.trim() ? "default" : "pointer", background: T.ink, color: T.paper, opacity: sending || !draft.trim() ? 0.5 : 1 }}>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
