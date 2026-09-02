import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import BookingFlow from "./components/BookingFlow";
import ChatThread from "./components/ChatThread";
import * as api from "./api";
import { AREAS, distanceKm, MAX_RADIUS_KM } from "./constants/areas";
import { T, AUD, FONTS, label, addDays, formatDateRange } from "./theme";
import { toListing } from "./utils/listingHelpers";
import { Wordmark } from "./components/Icons";
import Splash from "./components/Splash";
import WherePanel from "./components/WherePanel";
import WhereCoachmark from "./components/WhereCoachmark";
import Auth from "./components/Auth";
import Lend from "./components/Lend";
import Card from "./components/Card";
import MyListings from "./components/MyListings";
import MyBookings from "./components/MyBookings";
import Requests from "./components/Requests";
import Messages from "./components/Messages";
import InfoModal from "./components/InfoModal";
import AdminShops from "./components/AdminShops";
import AdminOverview from "./components/AdminOverview";

/* ============================================================
   Closet Swap — peer-to-peer + shop clothing rental marketplace
   Screens: splash, location gate, browse, listing detail, lend, auth.
   The screens themselves live in ./components; this file wires them
   together with the app's shared state and the backend in ./api.
   ============================================================ */

const FOOTER_INFO = {
  sizing: {
    title: "Sizing help",
    paragraphs: [
      "Every listing shows the lender's stated size, but fit can vary between brands and even between two pieces in the same size.",
      "Check the listing's fit notes and photos before booking, and message the lender directly if you want exact measurements.",
      "If something doesn't fit, sort it out with the lender when you return it — see our damage policy for what's covered.",
    ],
  },
  damage: {
    title: "Damage policy",
    paragraphs: [
      "Minor wear from normal use is covered and won't affect your booking.",
      "Damage beyond repair, staining, or loss is charged at the piece's stated value, arranged directly between you and the lender or shop.",
      "Renters and lenders are expected to resolve condition disputes between themselves in good faith; Closet Swap can help mediate but doesn't guarantee an outcome.",
    ],
  },
};

/* ---------------- App ---------------- */
export default function ClosetSwap() {
  const [screen, setScreen] = useState("splash");   // splash | app
  const [view, setView] = useState("browse");       // browse | lend | auth
  const [mode, setMode] = useState("login");
  const [area, setArea] = useState("");
  const [radius, setRadius] = useState(10);
  const [aud, setAud] = useState("all");
  const [garment, setGarment] = useState(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [bookingResume, setBookingResume] = useState(null); // { listing, from, to, size, handoff, deliveryAddress } saved when login interrupts a booking
  const [dateFrom, setDateFrom] = useState(() => addDays(new Date(), 1));
  const [dateTo, setDateTo] = useState(() => addDays(new Date(), 5));
  const [whereOpen, setWhereOpen] = useState(false);
  const whereRef = useRef(null);
  const [showWhereCoach, setShowWhereCoach] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!whereOpen) return;
    const onClick = (e) => { if (whereRef.current && !whereRef.current.contains(e.target)) setWhereOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [whereOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const dismissWhereCoach = useCallback(() => {
    setShowWhereCoach(false);
    try { localStorage.setItem("cs_where_coach_seen", "1"); } catch { /* private mode, etc — just skip persisting */ }
  }, []);

  useEffect(() => {
    if (screen !== "app") return;
    let seen = false;
    try { seen = !!localStorage.getItem("cs_where_coach_seen"); } catch { /* private mode, etc */ }
    if (seen) return;
    const t = setTimeout(() => setShowWhereCoach(true), 700);
    return () => clearTimeout(t);
  }, [screen]);

  const [user, setUser] = useState(() => api.getStoredUser());
  const [emailVerifyBanner, setEmailVerifyBanner] = useState(null); // null | { type: "success" | "error", text }
  const [resendingVerification, setResendingVerification] = useState(false);
  // Best-effort client-side mirror of the backend's 2-minute resend cooldown
  // (persisted so a page refresh doesn't reset the wait) - the backend still
  // enforces it regardless, this just avoids a pointless round trip.
  const [verifyResendAt, setVerifyResendAt] = useState(() => {
    try { return Number(localStorage.getItem("cs_verify_resend_at")) || 0; } catch { return 0; }
  });
  const [nowTick, setNowTick] = useState(Date.now());
  const verifyCooldownRemaining = Math.max(0, Math.ceil((verifyResendAt + 120000 - nowTick) / 1000));

  useEffect(() => {
    if (verifyCooldownRemaining <= 0) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [verifyCooldownRemaining]);

  // Picks up the ?verify=<token> link from the verification email and clears
  // it from the URL once handled, whether it succeeded or not.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify");
    if (!token) return;

    api.verifyEmail(token)
      .then(() => {
        setEmailVerifyBanner({ type: "success", text: "Your email is verified. If you had ClosetSwap open in another tab, it's picked this up too — you can close this one." });
        // Same-origin localStorage write, so a "storage" event fires in any other
        // open tab (e.g. the one still on the signup screen) right away instead of
        // it having to wait on its own poll - see the listener in Auth.js.
        try { localStorage.setItem("emailVerified", "true"); } catch { /* private mode, etc */ }
        setUser((u) => (u ? { ...u, emailVerified: true } : u));
        // Only succeeds for a tab this page itself opened via script, which a
        // link click from an email client never is - harmless no-op otherwise,
        // the banner above covers that case.
        setTimeout(() => { try { window.close(); } catch { /* not script-opened */ } }, 2500);
      })
      .catch((error) => {
        setEmailVerifyBanner({ type: "error", text: error.response?.data?.message || "That verification link is invalid or has expired." });
      })
      .finally(() => {
        params.delete("verify");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
      });
  }, []);

  const resendVerification = async () => {
    if (verifyCooldownRemaining > 0) return;
    setResendingVerification(true);
    try {
      await api.resendVerificationEmail();
      const sentAt = Date.now();
      setVerifyResendAt(sentAt);
      try { localStorage.setItem("cs_verify_resend_at", String(sentAt)); } catch { /* private mode, etc */ }
      setEmailVerifyBanner({ type: "success", text: "Verification email sent - check your inbox." });
    } catch (error) {
      setEmailVerifyBanner({ type: "error", text: error.message });
    } finally {
      setResendingVerification(false);
    }
  };
  const [liked, setLiked] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [myListingsError, setMyListingsError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [savingListingId, setSavingListingId] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const [myBookingsError, setMyBookingsError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [receivedBookingsLoading, setReceivedBookingsLoading] = useState(false);
  const [receivedBookingsError, setReceivedBookingsError] = useState("");
  const [actingBookingId, setActingBookingId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState("");
  const [chatBooking, setChatBooking] = useState(null); // { bookingId, title, subtitle, closed } | null

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("overview"); // overview | shops
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminOverviewLoading, setAdminOverviewLoading] = useState(false);
  const [adminOverviewError, setAdminOverviewError] = useState("");
  const [adminShops, setAdminShops] = useState([]);
  const [adminShopsLoading, setAdminShopsLoading] = useState(false);
  const [adminShopsError, setAdminShopsError] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("pending");
  const [adminActingId, setAdminActingId] = useState(null);

  const theme = AUD[aud];
  const switchAud = (k) => { setAud(k); setGarment(null); };

  const [authAccountType, setAuthAccountType] = useState(null);
  const [footerInfo, setFooterInfo] = useState(null); // null | "sizing" | "damage" | "areas"

  const goToAuth = (m, accountType) => { setMode(m); setAuthAccountType(accountType || null); setView("auth"); };

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const raw = await api.fetchProducts();
      setProducts(raw.map(toListing));
    } catch (error) {
      setProductsError("Couldn't reach the server — is the backend running?");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (!user) { setLiked([]); return; }
    api.fetchUser(user.id).then((u) => setLiked(u.likeditems || [])).catch(() => setLiked([]));
  }, [user]);

  const loadMyListings = useCallback(async () => {
    if (!user) { setMyListings([]); return; }
    setMyListingsLoading(true);
    setMyListingsError("");
    try {
      const raw = await api.fetchMyProducts(user.id);
      setMyListings(raw.map(toListing));
    } catch (error) {
      setMyListingsError("Couldn't load your listings — is the backend running?");
    } finally {
      setMyListingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === "mylistings" && user) loadMyListings();
  }, [view, user, loadMyListings]);

  const removeListing = async (id) => {
    if (!window.confirm("Remove this listing? This can't be undone.")) return;
    setRemovingId(id);
    try {
      await api.deleteProduct(id);
      setMyListings((l) => l.filter((p) => p.id !== id));
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      setMyListingsError("Couldn't remove that listing, please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const patchListingLocally = (id, patch) => {
    setMyListings((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const toggleListingActive = async (id, nextActive) => {
    setSavingListingId(id);
    setMyListingsError("");
    try {
      await api.updateProduct(id, { isActive: nextActive });
      patchListingLocally(id, { active: nextActive });
    } catch (error) {
      setMyListingsError(error.message || `Couldn't ${nextActive ? "enable" : "disable"} that listing, please try again.`);
    } finally {
      setSavingListingId(null);
    }
  };

  const updateListingPrice = async (id, newPrice) => {
    setSavingListingId(id);
    setMyListingsError("");
    try {
      const updated = await api.updateProduct(id, { cost_per_day: newPrice });
      const rent = Number(updated.cost_per_day) || newPrice;
      patchListingLocally(id, { rent, extraDay: rent });
    } catch (error) {
      setMyListingsError(error.message || "Couldn't update the price, please try again.");
    } finally {
      setSavingListingId(null);
    }
  };

  const addUnavailableRange = async (id, range) => {
    const current = myListings.find((p) => p.id === id);
    const next = [...(current?.unavailableDates || []), range];
    setSavingListingId(id);
    setMyListingsError("");
    try {
      const updated = await api.updateProduct(id, { unavailableDates: next });
      patchListingLocally(id, { unavailableDates: (updated.unavailableDates || next).map((r) => ({ from: r.from, to: r.to })) });
    } catch (error) {
      setMyListingsError(error.message || "Couldn't block those dates, please try again.");
    } finally {
      setSavingListingId(null);
    }
  };

  const removeUnavailableRange = async (id, index) => {
    const current = myListings.find((p) => p.id === id);
    const next = (current?.unavailableDates || []).filter((_, i) => i !== index);
    setSavingListingId(id);
    setMyListingsError("");
    try {
      const updated = await api.updateProduct(id, { unavailableDates: next });
      patchListingLocally(id, { unavailableDates: (updated.unavailableDates || next).map((r) => ({ from: r.from, to: r.to })) });
    } catch (error) {
      setMyListingsError(error.message || "Couldn't remove that block, please try again.");
    } finally {
      setSavingListingId(null);
    }
  };

  const loadMyBookings = useCallback(async () => {
    if (!user) { setMyBookings([]); return; }
    setMyBookingsLoading(true);
    setMyBookingsError("");
    try {
      setMyBookings(await api.fetchMyBookings());
    } catch (error) {
      setMyBookingsError("Couldn't load your bookings — is the backend running?");
    } finally {
      setMyBookingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === "mybookings" && user) loadMyBookings();
  }, [view, user, loadMyBookings]);

  const cancelMyBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      const updated = await api.cancelBooking(id);
      setMyBookings((list) => list.map((b) => (b._id === id ? { ...b, status: updated.status } : b)));
    } catch (error) {
      setMyBookingsError(error.response?.data?.message || "Couldn't cancel that booking, please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const loadReceivedBookings = useCallback(async () => {
    if (!user) { setReceivedBookings([]); return; }
    setReceivedBookingsLoading(true);
    setReceivedBookingsError("");
    try {
      setReceivedBookings(await api.fetchReceivedBookings());
    } catch (error) {
      setReceivedBookingsError("Couldn't load your requests — is the backend running?");
    } finally {
      setReceivedBookingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === "requests" && user) loadReceivedBookings();
  }, [view, user, loadReceivedBookings]);

  const respondToRequest = async (id, action) => {
    setActingBookingId(id);
    try {
      const updated = action === "accept" ? await api.acceptBooking(id) : await api.declineBooking(id);
      setReceivedBookings((list) => list.map((b) => (b._id === id ? { ...b, status: updated.status } : b)));
    } catch (error) {
      setReceivedBookingsError(error.response?.data?.message || "Couldn't update that request, please try again.");
    } finally {
      setActingBookingId(null);
    }
  };

  const loadThreads = useCallback(async () => {
    if (!user) { setThreads([]); return; }
    setThreadsLoading(true);
    setThreadsError("");
    try {
      setThreads(await api.fetchThreads());
    } catch (error) {
      setThreadsError("Couldn't load your messages — is the backend running?");
    } finally {
      setThreadsLoading(false);
    }
  }, [user]);

  // Keeps the "Messages" nav badge current, not just the inbox screen itself.
  useEffect(() => {
    if (!user) return;
    loadThreads();
    const id = setInterval(loadThreads, 30000);
    return () => clearInterval(id);
  }, [user, loadThreads]);

  const unreadMessageCount = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    api.checkAdmin().then(setIsAdmin);
  }, [user]);

  // Admins get a pure admin panel, not the marketplace - drop them straight
  // into it as soon as we know they're an admin, and keep them there.
  useEffect(() => {
    if (isAdmin) setView("admin");
  }, [isAdmin]);

  const loadAdminOverview = useCallback(async () => {
    setAdminOverviewLoading(true);
    setAdminOverviewError("");
    try {
      setAdminOverview(await api.fetchAdminOverview());
    } catch (error) {
      setAdminOverviewError(error.message);
    } finally {
      setAdminOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "admin" && isAdmin && adminTab === "overview") loadAdminOverview();
  }, [view, isAdmin, adminTab, loadAdminOverview]);

  const loadAdminShops = useCallback(async () => {
    setAdminShopsLoading(true);
    setAdminShopsError("");
    try {
      setAdminShops(await api.fetchShopsForAdmin(adminStatusFilter));
    } catch (error) {
      setAdminShopsError("Couldn't load shops — is the backend running?");
    } finally {
      setAdminShopsLoading(false);
    }
  }, [adminStatusFilter]);

  useEffect(() => {
    if (view === "admin" && isAdmin && adminTab === "shops") loadAdminShops();
  }, [view, isAdmin, adminTab, adminStatusFilter, loadAdminShops]);

  const patchAdminShopLocally = (id, patch) => {
    setAdminShops((list) => list.map((s) => (s._id === id ? { ...s, ...patch } : s)));
  };

  const verifyAdminShop = async (id) => {
    setAdminActingId(id);
    try {
      const updated = await api.verifyShopAdmin(id);
      if (adminStatusFilter === "all") patchAdminShopLocally(id, updated);
      else setAdminShops((list) => list.filter((s) => s._id !== id));
    } catch (error) {
      setAdminShopsError(error.message);
    } finally {
      setAdminActingId(null);
    }
  };

  const rejectAdminShop = async (id) => {
    const reason = window.prompt("Reason for rejecting this shop (shown to the owner):");
    if (reason === null) return;
    if (!reason.trim()) { setAdminShopsError("A reason is required to reject a shop."); return; }
    setAdminActingId(id);
    try {
      const updated = await api.rejectShopAdmin(id, reason.trim());
      if (adminStatusFilter === "all") patchAdminShopLocally(id, updated);
      else setAdminShops((list) => list.filter((s) => s._id !== id));
    } catch (error) {
      setAdminShopsError(error.message);
    } finally {
      setAdminActingId(null);
    }
  };

  const revokeAdminShop = async (id) => {
    if (!window.confirm("Send this shop back to pending review?")) return;
    setAdminActingId(id);
    try {
      const updated = await api.revokeShopAdmin(id);
      if (adminStatusFilter === "all") patchAdminShopLocally(id, updated);
      else setAdminShops((list) => list.filter((s) => s._id !== id));
    } catch (error) {
      setAdminShopsError(error.message);
    } finally {
      setAdminActingId(null);
    }
  };

  const openChat = (booking, counterpartName, listingName) => {
    setChatBooking({
      bookingId: booking._id,
      title: listingName,
      subtitle: counterpartName ? `with ${counterpartName}` : "",
      closed: booking.status !== "requested" && booking.status !== "accepted",
    });
  };

  const openChatFromThread = (t) => {
    const iAmRenter = t.booking.renter === user.id;
    openChat(t.booking, t.counterpart?.username || (iAmRenter ? "the lender" : "the renter"), t.listing?.name || "Listing removed");
  };

  const closeChat = () => {
    setChatBooking(null);
    loadThreads();
  };

  const openListing = (p) => {
    setDetail(p);
    setBookingResume((r) => (r && r.listing.id === p.id ? r : null));
  };

  const toggle = async (id) => {
    if (!user) { goToAuth("login"); return; }
    if (!user.emailVerified) { setEmailVerifyBanner({ type: "error", text: "Verify your email to save items." }); return; }
    const wasLiked = liked.includes(id);
    setLiked((l) => (wasLiked ? l.filter((x) => x !== id) : [...l, id]));
    try {
      await api.toggleLike(user.id, id);
    } catch {
      setLiked((l) => (wasLiked ? [...l, id] : l.filter((x) => x !== id))); // revert on failure
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setLiked([]);
    setSavedOnly(false);
    setMyListings([]);
    setMyBookings([]);
    setReceivedBookings([]);
    setThreads([]);
    setChatBooking(null);
    setIsAdmin(false);
    setAdminTab("overview");
    setAdminOverview(null);
    setAdminShops([]);
    if (view === "mylistings" || view === "mybookings" || view === "requests" || view === "messages" || view === "admin") setView("browse");
  };

  const garmentOptions = useMemo(() => (
    [...new Set(products.filter((p) => aud === "all" || p.aud === aud).map((p) => p.garment).filter(Boolean))].sort()
  ), [products, aud]);

  // How many pieces (in the current audience tab) each area has listed,
  // shown next to each option in the area picker so people can tell a busy
  // area from an empty one before they commit to it.
  const areaCounts = useMemo(() => {
    const counts = {};
    for (const p of products) {
      if ((aud === "all" || p.aud === aud) && p.area) counts[p.area] = (counts[p.area] || 0) + 1;
    }
    return counts;
  }, [products, aud]);

  // km/hasLocation depend on the viewer's chosen area, so they're computed
  // here rather than in toListing(). No chosen area, or a listing missing
  // one, means distance is unknown — those listings still show, same as
  // before this feature existed, rather than being filtered out.
  const results = useMemo(() => products
    .filter((p) =>
      (aud === "all" || p.aud === aud) &&
      (!garment || p.garment === garment) &&
      (!savedOnly || liked.includes(p.id))
    )
    .map((p) => {
      const km = area && p.area ? distanceKm(area, p.area) : null;
      return { ...p, km, hasLocation: km !== null };
    })
    .filter((p) => p.km === null || radius >= MAX_RADIUS_KM || p.km <= radius)
  , [products, aud, radius, garment, savedOnly, liked, area]);

  // Shown instead of any feature past browsing (lend, listings, bookings,
  // requests, messages) until the account's email is verified.
  const VerifyGate = ({ what }) => (
    <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
      <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 12px" }}>Verify your email to {what}</p>
      <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 400, marginInline: "auto", lineHeight: 1.6 }}>
        We sent a link to {user?.email || "your email"}. Click it, then come back here.
      </p>
      <button onClick={resendVerification} disabled={resendingVerification || verifyCooldownRemaining > 0}
        style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3,
          background: T.ink, color: T.paper, cursor: resendingVerification || verifyCooldownRemaining > 0 ? "default" : "pointer",
          opacity: resendingVerification || verifyCooldownRemaining > 0 ? 0.6 : 1 }}>
        {resendingVerification ? "Sending…" : verifyCooldownRemaining > 0 ? `Resend in ${verifyCooldownRemaining}s` : "Resend verification email"}
      </button>
    </div>
  );

  if (screen === "splash") return (<><style>{FONTS}</style><Splash onDone={() => setScreen("app")} /></>);

  return (
    <div style={{ fontFamily: "Karla, sans-serif", background: T.paper, color: T.ink, minHeight: "100vh", position: "relative" }}>
      <style>{FONTS}</style>
      <style>{`
        *{box-sizing:border-box}
        button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid ${theme.deep};outline-offset:2px}
        @media (prefers-reduced-motion:reduce){*{transition:none!important}}
        .cs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:20px}
        .cs-shell{display:grid;grid-template-columns:196px 1fr;gap:44px}
        .cs-rail{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none}
        .cs-rail::-webkit-scrollbar{display:none}
        .cs-menu-toggle{display:none}
        .cs-header-controls{display:flex;align-items:center;gap:22px;flex-wrap:wrap;flex:1;min-width:0}
        @media(max-width:900px){.cs-shell{grid-template-columns:1fr;gap:26px}
          .cs-auth{grid-template-columns:1fr!important}
          .cs-auth aside{border-right:none!important;border-bottom:1px solid ${T.line};padding:28px 24px!important}
          .cs-auth main{padding:34px 24px!important}
          .cs-distance{display:none}
          .cs-garment-list{display:flex!important;flex-wrap:wrap;gap:8px!important}
          .cs-garment-list button{border:1px solid ${T.line};border-radius:999px;padding:7px 14px!important;text-align:center!important}
        }
        @media(max-width:900px){
          .cs-header-inner{padding:0 18px!important;gap:12px!important}
          .cs-menu-toggle{display:inline-flex!important}
          .cs-header-controls{
            display:none;position:absolute;top:100%;left:0;right:0;
            flex-direction:column;align-items:stretch;gap:14px;
            background:${T.card};border-bottom:1px solid ${T.line};
            padding:18px 20px 22px;box-shadow:0 14px 30px rgba(33,30,43,.14);
            max-height:calc(100vh - 70px);overflow-y:auto;
          }
          .cs-header-controls.cs-open{display:flex}
          .cs-tabs{width:100%;justify-content:space-between}
          .cs-where-wrap{width:100%}
          .cs-where-wrap>button{width:100%;text-align:left}
          .cs-nav{margin-left:0!important;flex-direction:column;align-items:flex-start!important;gap:14px!important;width:100%}
          .cs-where-panel,.cs-where-wrap [role="status"]{position:static!important;top:auto!important;left:auto!important;width:100%!important;margin-top:10px}
        }
        @media(max-width:640px){.cs-container{padding-left:18px!important;padding-right:18px!important}}
      `}</style>

      {/* Header */}
      <header ref={headerRef} style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(251,250,248,.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.line}` }}>
        <div className="cs-header-inner" style={{ maxWidth: 1220, margin: "0 auto", padding: "14px 32px", minHeight: 70, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", position: "relative" }}>
          <button onClick={() => { setView(isAdmin ? "admin" : "browse"); setMenuOpen(false); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <Wordmark accent={theme.accent} />
          </button>

          <button type="button" className="cs-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{ display: "none", alignItems: "center", justifyContent: "center", width: 38, height: 38, marginLeft: "auto", flexShrink: 0, border: `1px solid ${T.line}`, borderRadius: 8, background: T.card, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {menuOpen ? (
                <path d="M2 2 L14 14 M14 2 L2 14" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 4 H14 M2 8 H14 M2 12 H14" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <div className={`cs-header-controls${menuOpen ? " cs-open" : ""}`}>
            {view !== "auth" && !isAdmin && (
              <div role="tablist" aria-label="Shop for" className="cs-tabs" style={{ display: "flex", gap: 2, border: `1px solid ${T.line}`, borderRadius: 999, padding: 3, background: T.card }}>
                {Object.entries(AUD).map(([k, v]) => (
                  <button key={k} role="tab" aria-selected={aud === k} onClick={() => { switchAud(k); setView("browse"); setMenuOpen(false); }}
                    style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                      background: aud === k ? v.tint : "transparent", color: aud === k ? v.deep : T.ink2, fontWeight: aud === k ? 600 : 400, transition: "all .22s ease" }}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {view !== "auth" && !isAdmin && (
              <div ref={whereRef} className="cs-where-wrap" style={{ position: "relative" }}>
                <button onClick={() => { setWhereOpen((o) => !o); dismissWhereCoach(); }}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 13, color: T.ink2, background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, padding: "8px 15px", cursor: "pointer" }}>
                  {area || "Set area"} · {radius} km · {formatDateRange(dateFrom, dateTo)}
                </button>
                {whereOpen ? (
                  <WherePanel theme={theme} area={area} setArea={setArea} areaCounts={areaCounts} radius={radius} setRadius={setRadius}
                    dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
                    onDone={() => setWhereOpen(false)} />
                ) : showWhereCoach ? (
                  <WhereCoachmark theme={theme} onDismiss={dismissWhereCoach} />
                ) : null}
              </div>
            )}

            <nav className="cs-nav" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: T.ink2 }}>
              {!isAdmin && (
                <>
                  <button onClick={() => { setView("lend"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "lend" ? T.ink : T.ink2, cursor: "pointer" }}>Lend yours</button>
                  <button onClick={() => { user ? setView("mylistings") : goToAuth("login"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "mylistings" ? T.ink : T.ink2, cursor: "pointer" }}>My listings</button>
                  <button onClick={() => { user ? setView("requests") : goToAuth("login"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "requests" ? T.ink : T.ink2, cursor: "pointer" }}>Requests</button>
                  <button onClick={() => { user ? setView("mybookings") : goToAuth("login"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "mybookings" ? T.ink : T.ink2, cursor: "pointer" }}>My bookings</button>
                  <button onClick={() => { user ? setView("messages") : goToAuth("login"); setMenuOpen(false); }} style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "messages" ? T.ink : T.ink2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    Messages
                    {unreadMessageCount > 0 && (
                      <span style={{ minWidth: 16, height: 16, borderRadius: 999, background: T.err, color: T.paper, fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px" }}>
                        {unreadMessageCount}
                      </span>
                    )}
                  </button>
                  <span onClick={() => { user ? setSavedOnly((s) => !s) : goToAuth("login"); setMenuOpen(false); }}
                    style={{ cursor: "pointer", color: savedOnly ? theme.deep : T.ink2, fontWeight: savedOnly ? 600 : 400 }}>
                    Saved {liked.length > 0 && <b style={{ color: theme.deep }}>({liked.length})</b>}
                  </span>
                </>
              )}
              {isAdmin && (
                <button onClick={() => { setView("admin"); setMenuOpen(false); }}
                  style={{ background: "none", border: "none", fontFamily: "Karla, sans-serif", fontSize: 13, color: view === "admin" ? T.ink : T.ink2, cursor: "pointer" }}>
                  Admin
                </button>
              )}
              {user ? (
                <>
                  <span style={{ color: T.ink }}>Hi, {user.username?.split(" ")[0] || "there"}</span>
                  {user.accountType === "shop" && user.verificationStatus !== "verified" && (
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase", color: user.verificationStatus === "rejected" ? T.err : T.ink3 }}>
                      {user.verificationStatus === "rejected" ? "Shop verification rejected" : "Shop pending verification"}
                    </span>
                  )}
                  {!user.emailVerified && (
                    <span onClick={resendingVerification || verifyCooldownRemaining > 0 ? undefined : resendVerification}
                      style={{ fontSize: 12, color: theme.deep, cursor: resendingVerification || verifyCooldownRemaining > 0 ? "default" : "pointer", borderBottom: `1px solid ${theme.accent}`, opacity: resendingVerification || verifyCooldownRemaining > 0 ? 0.6 : 1 }}>
                      {resendingVerification ? "Sending…" : verifyCooldownRemaining > 0 ? `Resend in ${verifyCooldownRemaining}s` : "Verify email"}
                    </span>
                  )}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={{ fontFamily: "Karla, sans-serif", fontSize: 13, background: "transparent", color: T.ink2, border: `1px solid ${T.line}`, padding: "9px 17px", borderRadius: 999, cursor: "pointer" }}>
                    Log out
                  </button>
                </>
              ) : (
                <button onClick={() => { goToAuth("login"); setMenuOpen(false); }}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 13, background: T.ink, color: T.paper, border: "none", padding: "10px 18px", borderRadius: 999, cursor: "pointer" }}>
                  Log in
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {emailVerifyBanner && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "10px 20px", textAlign: "center",
          background: emailVerifyBanner.type === "success" ? theme.tint : "#fdecea",
          color: emailVerifyBanner.type === "success" ? theme.deep : T.err, fontSize: 13.5 }}>
          <span>{emailVerifyBanner.text}</span>
          <button onClick={() => setEmailVerifyBanner(null)}
            style={{ background: "none", border: "none", color: "inherit", fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
            Dismiss
          </button>
        </div>
      )}

      {view === "auth" && (
        <Auth mode={mode} setMode={setMode} theme={theme} initialAccountType={authAccountType}
          onDone={(u) => {
            setUser(u);
            setView("browse");
            if (bookingResume) setDetail(bookingResume.listing);
          }} />
      )}
      {view === "lend" && !isAdmin && (
        user && !user.emailVerified ? <VerifyGate what="list an item" /> : (
          <Lend theme={theme} user={user} onNeedLogin={() => goToAuth("login")} onListed={() => { loadProducts(); loadMyListings(); setView("browse"); }} />
        )
      )}

      {view === "mylistings" && !isAdmin && (
        !user ? (
          <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 18px" }}>Log in to see your listings</p>
            <button onClick={() => goToAuth("login")}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : !user.emailVerified ? <VerifyGate what="see your listings" /> : (
          <MyListings items={myListings} loading={myListingsLoading} error={myListingsError} onRetry={loadMyListings}
            onRemove={removeListing} removingId={removingId} savingId={savingListingId}
            onToggleActive={toggleListingActive} onUpdatePrice={updateListingPrice}
            onAddUnavailable={addUnavailableRange} onRemoveUnavailable={removeUnavailableRange} />
        )
      )}

      {view === "mybookings" && !isAdmin && (
        !user ? (
          <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 18px" }}>Log in to see your bookings</p>
            <button onClick={() => goToAuth("login")}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : !user.emailVerified ? <VerifyGate what="see your bookings" /> : (
          <MyBookings items={myBookings} loading={myBookingsLoading} error={myBookingsError} onRetry={loadMyBookings} onCancel={cancelMyBooking} cancellingId={cancellingId}
            onMessage={(b) => openChat(b, b.ownerInfo?.username, b.listing?.name || "Listing removed")} />
        )
      )}

      {view === "requests" && !isAdmin && (
        !user ? (
          <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 18px" }}>Log in to see your requests</p>
            <button onClick={() => goToAuth("login")}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : !user.emailVerified ? <VerifyGate what="see your requests" /> : (
          <Requests items={receivedBookings} loading={receivedBookingsLoading} error={receivedBookingsError} onRetry={loadReceivedBookings}
            onAccept={(id) => respondToRequest(id, "accept")} onDecline={(id) => respondToRequest(id, "decline")} actingId={actingBookingId}
            onMessage={(b) => openChat(b, b.renterInfo?.username, b.listing?.name || "Listing removed")} />
        )
      )}

      {view === "messages" && !isAdmin && (
        !user ? (
          <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: "0 0 18px" }}>Log in to see your messages</p>
            <button onClick={() => goToAuth("login")}
              style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : !user.emailVerified ? <VerifyGate what="see your messages" /> : (
          <Messages items={threads} loading={threadsLoading} error={threadsError} onRetry={loadThreads} onOpen={openChatFromThread} currentUserId={user.id} />
        )
      )}

      {view === "admin" && (
        !isAdmin ? (
          <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0 }}>You don't have access to this section.</p>
          </div>
        ) : (
          <>
            <div className="cs-container" style={{ maxWidth: 980, margin: "0 auto", padding: "40px 32px 0", display: "flex", gap: 8 }}>
              {[["overview", "Overview"], ["shops", "Shop verification"]].map(([k, t]) => (
                <button key={k} onClick={() => setAdminTab(k)}
                  style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "8px 15px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${adminTab === k ? T.ink : T.line}`, background: adminTab === k ? T.ink : "transparent",
                    color: adminTab === k ? T.paper : T.ink2, fontWeight: adminTab === k ? 600 : 400 }}>
                  {t}
                </button>
              ))}
            </div>
            {adminTab === "overview" ? (
              <AdminOverview data={adminOverview} loading={adminOverviewLoading} error={adminOverviewError} onRetry={loadAdminOverview} />
            ) : (
              <AdminShops items={adminShops} loading={adminShopsLoading} error={adminShopsError} onRetry={loadAdminShops}
                statusFilter={adminStatusFilter} onFilterChange={setAdminStatusFilter}
                onVerify={verifyAdminShop} onReject={rejectAdminShop} onRevoke={revokeAdminShop} actingId={adminActingId} />
            )}
          </>
        )
      )}

      {view === "browse" && !isAdmin && (
        <>
          {/* Hero */}
          <section className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "56px 32px 34px" }}>
            <p style={{ ...label, marginBottom: 16 }}>{results.length} pieces {radius >= MAX_RADIUS_KM ? "across all of Pune" : `within ${radius} km of ${area || "you"}`}</p>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(34px,4.6vw,58px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: 0, maxWidth: 720 }}>
              {theme.heroLine1}<br /><em style={{ fontStyle: "italic", color: theme.deep }}>{theme.heroLine2}</em>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: T.ink2, maxWidth: 480, margin: "22px 0 0" }}>
              {theme.blurb}
            </p>
          </section>

          {/* Catalogue */}
          <section className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "0 32px 80px" }}>
            <div className="cs-shell">
              <aside>
                {garmentOptions.length > 0 && (
                  <>
                    <p style={{ ...label, marginBottom: 12 }}>Garment</p>
                    <div className="cs-garment-list" style={{ display: "grid", gap: 2, marginBottom: 28 }}>
                      {garmentOptions.map((g) => (
                        <button key={g} onClick={() => setGarment(garment === g ? null : g)}
                          style={{ fontFamily: "Karla, sans-serif", textAlign: "left", fontSize: 14, padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: 3,
                            background: garment === g ? theme.tint : "transparent", color: garment === g ? theme.deep : T.ink2, fontWeight: garment === g ? 600 : 400 }}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="cs-distance">
                  <p style={{ ...label, marginBottom: 10 }}>Distance</p>
                  <input type="range" min="2" max={MAX_RADIUS_KM} value={radius} onChange={(e) => setRadius(+e.target.value)} style={{ width: "100%", accentColor: theme.deep }} aria-label="Search radius in kilometres" />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.ink3, marginTop: 4 }}>
                    <span>2 km</span><span>{radius >= MAX_RADIUS_KM ? "All Pune" : `${radius} km`}</span><span>All Pune</span>
                  </div>
                </div>
              </aside>

              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, paddingBottom: 16, borderBottom: `1px solid ${T.line}` }}>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 24, margin: 0 }}>
                    {garment || theme.rail}
                  </h2>
                  <span style={{ fontSize: 13, color: T.ink3 }}>{results.length} nearby · {formatDateRange(dateFrom, dateTo)}</span>
                </div>

                {productsLoading ? (
                  <p style={{ fontSize: 14, color: T.ink2, padding: "40px 0" }}>Loading pieces…</p>
                ) : productsError ? (
                  <div style={{ border: `1px dashed ${T.err}`, borderRadius: 4, padding: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: T.err, margin: "0 0 14px" }}>{productsError}</p>
                    <button onClick={loadProducts} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "10px 18px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                      Try again
                    </button>
                  </div>
                ) : results.length ? (
                  <div className="cs-grid">
                    {results.map((p) => <Card key={p.id} p={p} theme={theme} liked={liked.includes(p.id)} toggle={toggle} open={openListing} />)}
                  </div>
                ) : savedOnly && liked.length === 0 ? (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>Nothing saved yet</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      Tap the heart on a piece you like and it'll show up here.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setSavedOnly(false)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Browse pieces
                      </button>
                    </div>
                  </div>
                ) : savedOnly ? (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>No saved pieces match your filters</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      Your saved items are outside the current distance, garment, or category filters.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setRadius(25)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Search all of Pune
                      </button>
                      <button onClick={() => setGarment(null)}
                        style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2, borderRadius: 3, cursor: "pointer" }}>
                        Clear filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: `1px dashed ${T.line}`, borderRadius: 4, padding: "56px 32px", textAlign: "center" }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 21, margin: "0 0 8px" }}>{radius >= MAX_RADIUS_KM ? "Nothing in Pune yet" : `Nothing within ${radius} km yet`}</p>
                    <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 22px", maxWidth: 380, marginInline: "auto", lineHeight: 1.6 }}>
                      {area || "Your area"} is still filling up. Widen the search, or be the first to lend here.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setRadius(25)} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: "none", background: T.ink, color: T.paper, borderRadius: 3, cursor: "pointer" }}>
                        Search all of Pune
                      </button>
                      <button onClick={() => { setGarment(null); setSavedOnly(false); }}
                        style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${T.line}`, background: "transparent", color: T.ink2, borderRadius: 3, cursor: "pointer" }}>
                        Clear filters
                      </button>
                      <button onClick={() => setView("lend")} style={{ fontFamily: "Karla, sans-serif", fontSize: 13, padding: "11px 20px", border: `1px solid ${theme.accent}`, background: theme.tint, color: theme.deep, borderRadius: 3, cursor: "pointer" }}>
                        Lend something here
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section style={{ background: theme.tint, borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }}>
            <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "60px 32px" }}>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, letterSpacing: "-.02em", margin: "0 0 32px" }}>How renting here works</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 26 }}>
                {[
                  ["Set your area and dates", "The rail only shows what's genuinely free near you on those days."],
                  ["Book or request", "Shops confirm instantly. Individuals have 12 hours to accept, and you're charged only then."],
                  ["Collect or get it couriered", "Meet the lender, or we move it both ways for a flat fee."],
                  ["Drop it back", "Return it directly to the lender. Minor wear is covered."],
                ].map(([h, b], i) => (
                  <div key={h} style={{ borderTop: `2px solid ${theme.accent}`, paddingTop: 16 }}>
                    <span style={{ ...label, display: "block", marginBottom: 8 }}>Step {i + 1}</span>
                    <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 18, margin: "0 0 8px" }}>{h}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: T.ink2, margin: 0 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {!isAdmin && (
      <footer style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "36px 32px", display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={17} accent={theme.accent} />
          <nav style={{ display: "flex", gap: 24, fontSize: 13, color: T.ink2, flexWrap: "wrap" }}>
            {[
              ["Lend your wardrobe", () => setView("lend")],
              ["Open a shop account", () => goToAuth("signup", "shop")],
              ["Sizing help", () => setFooterInfo("sizing")],
              ["Damage policy", () => setFooterInfo("damage")],
              ["Areas we cover", () => setFooterInfo("areas")],
            ].map(([x, onClick]) => <span key={x} onClick={onClick} style={{ cursor: "pointer" }}>{x}</span>)}
          </nav>
          <span style={{ fontSize: 12, color: T.ink3 }}>Pune · {AREAS.length} areas live</span>
        </div>
      </footer>
      )}

      {footerInfo && footerInfo === "areas" && (
        <InfoModal title="Areas we cover"
          paragraphs={[`We're live across Pune and Pimpri-Chinchwad, ${AREAS.length} areas in all. Set your area from the header to see what's genuinely nearby.`]}
          chips={AREAS}
          onClose={() => setFooterInfo(null)} />
      )}
      {footerInfo && FOOTER_INFO[footerInfo] && (
        <InfoModal title={FOOTER_INFO[footerInfo].title} paragraphs={FOOTER_INFO[footerInfo].paragraphs}
          onClose={() => setFooterInfo(null)} />
      )}

      {detail && (
        <BookingFlow listing={detail} theme={theme} user={user}
          resume={bookingResume && bookingResume.listing.id === detail.id ? bookingResume : null}
          onNeedLogin={(draft) => { setBookingResume({ listing: detail, ...draft }); setDetail(null); goToAuth("login"); }}
          onClose={() => { setDetail(null); setBookingResume(null); }} />
      )}

      {chatBooking && user && (
        <ChatThread bookingId={chatBooking.bookingId} title={chatBooking.title} subtitle={chatBooking.subtitle}
          closed={chatBooking.closed} currentUserId={user.id} onClose={closeChat} />
      )}
    </div>
  );
}
