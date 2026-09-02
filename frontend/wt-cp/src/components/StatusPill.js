import React from "react";
import { T } from "../theme";
import { BOOKING_STATUS } from "../utils/listingHelpers";

export default function StatusPill({ status }) {
  const s = BOOKING_STATUS[status] || { text: status, color: T.ink3 };
  return (
    <span style={{ fontSize: 11, letterSpacing: ".04em", fontWeight: 600, color: s.color, border: `1px solid ${s.color}`, padding: "3px 9px", borderRadius: 999 }}>
      {s.text}
    </span>
  );
}
