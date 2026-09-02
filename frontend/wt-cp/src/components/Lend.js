import React, { useState } from "react";
import * as api from "../api";
import { GARMENT_TYPES_BY_CATEGORY } from "../constants/garmentTypes";
import { AREAS } from "../constants/areas";
import { T, AUD, label, inr } from "../theme";
import { DELIVERY_OPTIONS, NON_GARMENT_SUBCATEGORIES, readAsDataURL } from "../utils/listingHelpers";

/* Marketing copy is unchanged; the two CTA cards from the mock have been
   replaced with a real form wired to POST /api/v1/products (the one product
   write the backend actually supports — no separate shop-account flow, no
   instant-booking toggle, since neither exists server-side). */
export default function Lend({ theme, user, onNeedLogin, onListed }) {
  const steps = [
    ["List it in five minutes", "Photos, size, and what it cost new. We suggest a rent price from what similar pieces earn in your area."],
    ["You approve every request", "Nothing leaves your wardrobe without your yes. Shops can switch on instant booking instead."],
    ["Handover or courier", "Meet the renter, or let us pick up and drop off. You choose per listing."],
    ["Paid on return", "Money lands in your account after the piece comes back and passes inspection."],
  ];

  const emptyForm = { name: "", category: "", sub_category: "", available_quantity: "1", size: "", cost_per_day: "", min_days: "1", product_description: "", area: "", delivery_option: "" };
  const [form, setForm] = useState(emptyForm);
  const [img, setImg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value, ...(name === "category" ? { sub_category: "" } : {}) }));
  };

  const pickImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(await readAsDataURL(file));
  };

  const inputStyle = { width: "100%", fontFamily: "Karla, sans-serif", fontSize: 14, padding: "10px 12px", border: `1px solid ${T.line}`, borderRadius: 3, background: T.paper, color: T.ink };
  const fieldLabel = { display: "block", fontSize: 12, color: T.ink2, marginBottom: 6, fontWeight: 500 };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.category || !form.sub_category || !form.size || !form.cost_per_day || !form.area || !form.delivery_option || !img) {
      setErr("Fill in every field and add a photo.");
      return;
    }
    if (Number(form.cost_per_day) <= 0 || Number(form.available_quantity) <= 0) {
      setErr("Cost per day and quantity must be greater than 0.");
      return;
    }
    if (form.min_days && Number(form.min_days) < 1) {
      setErr("Minimum rental days must be at least 1.");
      return;
    }
    setSubmitting(true);
    try {
      await api.createProduct({ ...form, min_days: form.min_days || "1", img, owner: user.id });
      setForm(emptyForm);
      setImg("");
      setDone(true);
      onListed?.();
    } catch (error) {
      setErr(error.response?.data?.message || "Couldn't list this item, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cs-container" style={{ maxWidth: 1220, margin: "0 auto", padding: "64px 32px 88px" }}>
      <p style={{ ...label, marginBottom: 12 }}>For shops and for anyone with a full wardrobe</p>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(34px,4.4vw,54px)", letterSpacing: "-.025em", lineHeight: 1.06, margin: "0 0 18px" }}>
        The outfit you wore once<br /><em style={{ fontStyle: "italic", color: theme.deep }}>can pay for itself.</em>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: T.ink2, maxWidth: 520, margin: "0 0 36px" }}>
        A wedding outfit sitting in a cupboard earns nothing. Listed here it earns around {inr(1800)} a month in Pune, and you decide who takes it and when.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 26, marginBottom: 44 }}>
        {steps.map(([h, b], i) => (
          <div key={h} style={{ borderTop: `2px solid ${theme.accent}`, paddingTop: 16 }}>
            <span style={{ ...label, display: "block", marginBottom: 8 }}>Step {i + 1}</span>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 19, margin: "0 0 8px" }}>{h}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: T.ink2, margin: 0 }}>{b}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 44 }}>
        {!user ? (
          <div style={{ background: theme.tint, border: `1px solid ${theme.line}`, borderRadius: 4, padding: "28px 30px", maxWidth: 480 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 21, margin: "0 0 8px" }}>Log in to list something</h3>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 18px", lineHeight: 1.6 }}>Takes two minutes, then you can list as many pieces as you like.</p>
            <button onClick={onNeedLogin} style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: "pointer" }}>
              Log in or sign up
            </button>
          </div>
        ) : done ? (
          <div style={{ border: `1px solid ${theme.line}`, background: theme.tint, borderRadius: 4, padding: "28px 30px", maxWidth: 480 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 21, margin: "0 0 8px" }}>Listed</h3>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 18px" }}>It's live on the rail now.</p>
            <button onClick={() => setDone(false)} style={{ fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "10px 18px", border: `1px solid ${T.line}`, borderRadius: 3, background: "transparent", color: T.ink2, cursor: "pointer" }}>
              List another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ maxWidth: 560 }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 24, margin: "0 0 20px" }}>List an item</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-name">Product name</label>
                <input id="ln-name" name="name" value={form.name} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-cat">Category</label>
                <select id="ln-cat" name="category" value={form.category} onChange={change} style={inputStyle}>
                  <option value="">Choose</option>
                  {Object.keys(AUD).filter((k) => k !== "all").map((k) => <option key={k} value={k}>{AUD[k].label}</option>)}
                </select>
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-sub">Garment type</label>
                <select id="ln-sub" name="sub_category" value={form.sub_category} onChange={change} disabled={!form.category} style={inputStyle}>
                  <option value="">{form.category ? "Choose" : "Pick a category first"}</option>
                  {(GARMENT_TYPES_BY_CATEGORY[form.category] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                  {NON_GARMENT_SUBCATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-size">Size</label>
                <input id="ln-size" name="size" value={form.size} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-qty">Available quantity</label>
                <input id="ln-qty" name="available_quantity" type="number" min="1" value={form.available_quantity} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-cost">Cost per day (₹)</label>
                <input id="ln-cost" name="cost_per_day" type="number" min="1" value={form.cost_per_day} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-min-days">Minimum rental days (optional)</label>
                <input id="ln-min-days" name="min_days" type="number" min="1" placeholder="1" value={form.min_days} onChange={change} style={inputStyle} />
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-area">Area in Pune</label>
                <select id="ln-area" name="area" value={form.area} onChange={change} style={inputStyle}>
                  <option value="">Choose</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label style={fieldLabel} htmlFor="ln-delivery">Delivery option</label>
                <select id="ln-delivery" name="delivery_option" value={form.delivery_option} onChange={change} style={inputStyle}>
                  <option value="">Choose</option>
                  {DELIVERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-desc">Description</label>
                <textarea id="ln-desc" name="product_description" value={form.product_description} onChange={change} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel} htmlFor="ln-img">Photo</label>
                <input id="ln-img" type="file" accept="image/jpeg,image/png" onChange={pickImage} style={inputStyle} />
                {img && <img src={img} alt="Preview" style={{ marginTop: 10, maxWidth: 160, borderRadius: 4, display: "block" }} />}
              </div>
            </div>

            {err && <p style={{ fontSize: 13, color: T.err, margin: "16px 0 0" }}>{err}</p>}

            <button type="submit" disabled={submitting}
              style={{ marginTop: 20, fontFamily: "Karla, sans-serif", fontSize: 14, fontWeight: 500, padding: "12px 22px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Listing…" : "List this item"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
