import React from "react";
import { T } from "../theme";

export default function Ribbon({ occupiedByDay, units, accent }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {occupiedByDay.map((occupied, i) => {
        const full = occupied >= units;
        const partial = !full && occupied > 0;
        return (
          <span key={i} title={full ? "Booked" : partial ? `${units - occupied} of ${units} free` : "Free"}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: full ? T.line : accent,
              opacity: full ? 1 : partial ? 0.4 : 0.9,
            }} />
        );
      })}
    </div>
  );
}
