// Pune + Pimpri-Chinchwad areas the app knows about, plus an approximate
// lat/lng for each used to derive straight-line distance between any pair.
// Kept in sync by hand with the `area` enum in backend/models/productModel.js.
//
// There's no geocoding or real distance API behind this yet - coordinates are
// hand-estimated locality centers from a map of Pune, not measured. Good
// enough to gate a radius filter; not good enough to show as a promised
// distance.
// Alphabetical, spanning Pune city and Pimpri-Chinchwad (PCMC).
const COORDS = {
  Akurdi: [18.6485, 73.7698],
  Ambegaon: [18.4370, 73.8500],
  Aundh: [18.5636, 73.8077],
  Balewadi: [18.5730, 73.7690],
  Baner: [18.5590, 73.7868],
  Bavdhan: [18.5164, 73.7742],
  Bhosari: [18.6280, 73.8420],
  Bibwewadi: [18.4767, 73.8630],
  Bopodi: [18.5580, 73.8290],
  Camp: [18.5122, 73.8792],
  "Chandan Nagar": [18.5460, 73.9350],
  Chikhli: [18.6600, 73.8250],
  Chinchwad: [18.6486, 73.7986],
  Dapodi: [18.5850, 73.8390],
  "Deccan Gymkhana": [18.5158, 73.8412],
  Dhanori: [18.5786, 73.8955],
  Dhayari: [18.4394, 73.8267],
  Dighi: [18.6146, 73.8630],
  Erandwane: [18.5063, 73.8299],
  "Fatima Nagar": [18.5008, 73.9105],
  Hadapsar: [18.5089, 73.9260],
  Handewadi: [18.4593, 73.9153],
  Hinjewadi: [18.5912, 73.7389],
  Kalas: [18.5800, 73.8800],
  "Kalyani Nagar": [18.5486, 73.9020],
  "Karve Nagar": [18.4867, 73.8250],
  Kasarwadi: [18.5990, 73.8235],
  "Kasba Peth": [18.5158, 73.8560],
  Katraj: [18.4573, 73.8590],
  "Keshav Nagar": [18.5225, 73.9440],
  Khadki: [18.5670, 73.8500],
  Kharadi: [18.5515, 73.9430],
  Kiwale: [18.6580, 73.7420],
  Kondhwa: [18.4650, 73.8925],
  "Koregaon Park": [18.5362, 73.8938],
  Kothrud: [18.5074, 73.8077],
  Lohegaon: [18.5896, 73.9110],
  Magarpatta: [18.5158, 73.9270],
  Manjri: [18.4780, 73.9530],
  "Market Yard": [18.4877, 73.8577],
  "Model Colony": [18.5280, 73.8340],
  Mohammadwadi: [18.4700, 73.9080],
  Moshi: [18.6750, 73.8560],
  "Mukund Nagar": [18.4880, 73.8720],
  "Nana Peth": [18.5195, 73.8636],
  Narhe: [18.4438, 73.8110],
  "NIBM Road": [18.4636, 73.8964],
  Nigdi: [18.6529, 73.7658],
  Pashan: [18.5390, 73.7870],
  Phugewadi: [18.5920, 73.8280],
  "Pimple Gurav": [18.5951, 73.8100],
  "Pimple Nilakh": [18.5850, 73.7860],
  "Pimple Saudagar": [18.5989, 73.8000],
  Pimpri: [18.6298, 73.7997],
  Punawale: [18.6270, 73.7370],
  Rahatani: [18.6068, 73.7973],
  "Rasta Peth": [18.5185, 73.8697],
  Ravet: [18.6470, 73.7480],
  "Sadashiv Peth": [18.5133, 73.8517],
  Sangvi: [18.5793, 73.8320],
  Shivajinagar: [18.5308, 73.8474],
  "Shukrawar Peth": [18.5170, 73.8560],
  "Sinhagad Road": [18.4633, 73.8250],
  "Somwar Peth": [18.5220, 73.8620],
  Sus: [18.5580, 73.7590],
  Swargate: [18.5010, 73.8590],
  Talawade: [18.6870, 73.7900],
  Tathawade: [18.6270, 73.7500],
  Thergaon: [18.6020, 73.7690],
  "Tingre Nagar": [18.5670, 73.8950],
  Undri: [18.4534, 73.9209],
  "Vadgaon Budruk": [18.4728, 73.8130],
  "Vadgaon Sheri": [18.5561, 73.9273],
  "Viman Nagar": [18.5679, 73.9143],
  Vishrantwadi: [18.5680, 73.8695],
  Wagholi: [18.5793, 73.9880],
  Wakad: [18.5993, 73.7629],
  Wanowrie: [18.4936, 73.9027],
  Warje: [18.4739, 73.8060],
  Yerwada: [18.5580, 73.8797],
};

export const AREAS = Object.keys(COORDS);

// The radius slider tops out at 25 km, but the two farthest areas on the
// list (opposite corners of PCMC and east Pune) are just under 30 km apart.
// Rather than raise the slider to an unrealistic "how far will you travel"
// value, the max setting means "all of Pune" instead of a strict 25 km cutoff.
export const MAX_RADIUS_KM = 25;

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s));
}

/** Distance in km between two Pune areas from the AREAS list. Returns 0 for
 * the same area, and null if either area isn't recognised. */
export function distanceKm(a, b) {
  if (!a || !b) return null;
  if (a === b) return 0;
  const ca = COORDS[a];
  const cb = COORDS[b];
  if (!ca || !cb) return null;
  return Math.round(haversineKm(ca, cb) * 10) / 10;
}

/** Every area within `radius` km of `area`, nearest first, area itself
 * included at 0 km. `radius` at or above MAX_RADIUS_KM means all of Pune,
 * regardless of the actual distance. Returns [] if `area` isn't recognised. */
export function areasWithinRadius(area, radius) {
  if (!area || !AREAS.includes(area)) return [];
  const cutoff = radius >= MAX_RADIUS_KM ? Infinity : radius;
  return AREAS
    .map((a) => ({ area: a, km: distanceKm(area, a) }))
    .filter((x) => x.km !== null && x.km <= cutoff)
    .sort((x, y) => x.km - y.km);
}
