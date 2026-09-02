import React from "react";
import { T, AUD } from "../theme";

export function Mark({ size = 26, color = T.ink }) {
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

export function Wordmark({ size = 21, accent = AUD.women.accent, color = T.ink }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <Mark size={size + 5} color={color} />
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: size, letterSpacing: "-.01em", color }}>
        Closet<span style={{ color: accent }}>·</span>Swap
      </span>
    </span>
  );
}

export function UserIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.8 20 Q6 14.5 12 14.5 Q18 14.5 19.2 20" />
      </g>
    </svg>
  );
}

export function BuildingIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3.5" width="10.5" height="17" rx="0.6" />
        <path d="M15.5 10 H19 a0.6 0.6 0 0 1 .6 .6 V20 H15.5" />
        <path d="M8 7.5h1.5M11.5 7.5H13M8 11h1.5M11.5 11H13M8 14.5h1.5M11.5 14.5H13" />
        <path d="M9 20v-3.2h2.5V20" />
      </g>
    </svg>
  );
}

export function PhoneIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M7.2 3.5 L10 3.5 L11.4 7.3 L9.4 8.8 Q10.6 12.2 13.2 14.6 Q14.7 12.6 14.7 12.6 L18.5 14 L18.5 16.8 Q18.5 18.5 16.8 18.4 Q11.4 18.1 7.5 14.2 Q3.6 10.3 3.3 4.9 Q3.2 3.5 4.5 3.5 Z"
        fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5.5" width="17" height="13" rx="1.4" />
        <path d="M4.2 6.5 L12 13 L19.8 6.5" />
      </g>
    </svg>
  );
}

export function LockIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="10.5" width="14" height="9.5" rx="1.4" />
        <path d="M7.7 10.5 V7.2 a4.3 4.3 0 0 1 8.6 0 v3.3" />
        <path d="M12 14.3 v2.4" />
      </g>
    </svg>
  );
}

export function HomeIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M4 11.5 L12 4.5 L20 11.5 M6.3 9.8 V19.5 H17.7 V9.8 M10 19.5 V14 H14 V19.5"
        fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function HashIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 4 L7.5 20M16.5 4 L14.5 20M4.5 9.5 H19.5M3.5 15 H18.5" />
      </g>
    </svg>
  );
}

export function Tick({ c = T.ok, s = 13 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={c} opacity=".14" />
      <path d="M7.5 12.3l3 3 6-6.5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
