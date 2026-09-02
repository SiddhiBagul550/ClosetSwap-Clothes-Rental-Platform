/* Design tokens and formatting helpers shared across ClosetSwap's screens. */

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,0,500;9..144,1,300&family=Karla:wght@300;400;500;600&display=swap');`;

export const T = {
  paper: "#FBFAF8", card: "#FFFFFF", ink: "#211E2B", ink2: "#5D5869", ink3: "#918C9C",
  line: "#EAE6EA", line2: "#F3F0F3", err: "#A6474B", ok: "#4C6B41",
};

export const AUD = {
  all: {
    label: "All", accent: "#B8AFC7", deep: "#453F52", tint: "#F1EFF4", line: "#E6E2EC",
    heroLine1: "Dress for the occasion,", heroLine2: "borrow it from the neighbourhood.",
    blurb: "Every piece here belongs to a shop or a person near you. Collect it yourself, or have it couriered both ways.",
    rail: "New arrivals",
  },
  women: {
    label: "Women", accent: "#D99BAE", deep: "#8E4F63", tint: "#F8F0F3", line: "#F0DDE3",
    heroLine1: "Dress for the occasion,", heroLine2: "borrow it from the neighbourhood.",
    blurb: "Every piece here belongs to a shop or a person near you. Collect it yourself, or have it couriered both ways.",
    rail: "Women's rail",
  },
  men: {
    label: "Men", accent: "#8FA5C2", deep: "#3F5878", tint: "#F1F4F8", line: "#DDE4EE",
    heroLine1: "Sharp for the occasion,", heroLine2: "rented from right next door.",
    blurb: "Every piece here belongs to a shop or someone nearby. Pick it up yourself, or have it couriered both ways.",
    rail: "Men's rail",
  },
  kids: {
    label: "Kids", accent: "#A6C299", deep: "#4C6B41", tint: "#F3F7F0", line: "#DFE9DA",
    heroLine1: "Outgrown by next season anyway,", heroLine2: "so borrow it instead.",
    blurb: "Kids' clothes barely get worn before they're outgrown. Borrow what you need from a shop or family near you.",
    rail: "Kids' rail",
  },
};

export const inr = (n) => "₹" + n.toLocaleString("en-IN");
export const label = { fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: T.ink3, fontWeight: 500 };
export const mapsUrl = (area) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area}, Pune, India`)}`;

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
export const toInputValue = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const formatDateRange = (from, to) => {
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  return sameMonth
    ? `${from.getDate()}–${to.getDate()} ${MONTHS[from.getMonth()]}`
    : `${from.getDate()} ${MONTHS[from.getMonth()]} – ${to.getDate()} ${MONTHS[to.getMonth()]}`;
};

/* Server dates come back as ISO datetimes at UTC midnight for a given
   calendar day. Re-anchoring to local midnight via the date substring avoids
   the day rolling back a day in timezones behind UTC. */
export const dateFromApi = (val) => new Date(`${String(val).slice(0, 10)}T00:00:00`);
