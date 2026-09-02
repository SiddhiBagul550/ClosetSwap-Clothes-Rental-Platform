import React, { useState } from "react";
import * as api from "../api";
import { T, label } from "../theme";
import { normalizeContactNumber } from "../utils/listingHelpers";
import { Mark, UserIcon, BuildingIcon, PhoneIcon, MailIcon, LockIcon, HomeIcon, HashIcon } from "./Icons";
import AuthField from "./AuthField";
import AccountTypeToggle from "./AccountTypeToggle";
import LegalModal from "./LegalModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Wired to the real backend. Email + password is the login identifier; a
   verification link is emailed on signup but nothing is gated on it yet.
   Contact number is collected at signup too - it's shown publicly on shop
   listings, not used for login or verified. Forgot-password now goes to
   email as well (see api.forgotPassword).
   onDone(user) is called with the signed-in user on success. */
export default function Auth({ mode, setMode, theme, onDone, initialAccountType }) {
  const [stage, setStage] = useState("form"); // form | forgotRequest | forgotReset
  const [accountType, setAccountType] = useState(initialAccountType || "individual");
  const [pw, setPw] = useState(""); const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLegal, setShowLegal] = useState(null); // null | "terms" | "privacy"
  const [resetCode, setResetCode] = useState("");
  const [newPw, setNewPw] = useState(""); const [newPwConfirm, setNewPwConfirm] = useState("");
  const [devHint, setDevHint] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";
  const isShop = isSignup && accountType === "shop";

  const switchMode = (m) => { setMode(m); setStage("form"); setErr({}); setDevHint(""); };

  const inputStyle = (bad) => ({
    width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, padding: "12px 13px 12px 37px",
    border: `1px solid ${bad ? T.err : T.line}`, borderRadius: 3, background: T.paper, color: T.ink,
  });

  const IconInput = ({ icon, style, ...rest }) => (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.ink3, display: "flex" }}>
        {icon}
      </span>
      <input {...rest} style={style} />
    </div>
  );

  const submit = async () => {
    const e = {};
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) e.email = "Enter a valid email address";
    if (pw.length < 8) e.pw = "Passwords are at least 8 characters";
    if (isSignup) {
      const cleanContact = normalizeContactNumber(contactNumber);
      if (!/^[6-9]\d{9}$/.test(cleanContact)) e.contactNumber = "Enter a valid 10-digit mobile number";
      if (name.trim().length < 2) e.name = isShop ? "Enter the shop name" : "Enter your name";
      if (pwConfirm !== pw) e.pwConfirm = "Passwords do not match";
      if (address.trim().length < 1) e.address = isShop ? "Enter the shop address" : "Enter your address";
      if (isShop) {
        if (ownerName.trim().length < 2) e.ownerName = "Enter the owner's name";
        if (!/^[0-9A-Za-z]{15}$/.test(gstin.trim())) e.gstin = "Enter a valid 15-character GSTIN";
      }
      if (!agreedToTerms) e.terms = "Please agree to the Terms of Service and Privacy Policy";
    }
    setErr(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const user = isSignup
        ? await api.signup({
            accountType,
            username: name,
            ownerName: isShop ? ownerName : undefined,
            gstin: isShop ? gstin.trim().toUpperCase() : undefined,
            email: cleanEmail,
            password: pw,
            passwordConfirm: pwConfirm,
            contactNumber: normalizeContactNumber(contactNumber),
            address,
            agreedToTerms,
          })
        : await api.login(cleanEmail, pw);
      onDone(user);
    } catch (error) {
      setErr({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) { setErr({ email: "Enter a valid email address" }); return; }
    setErr({});
    setLoading(true);
    try {
      const devCode = await api.forgotPassword(cleanEmail);
      setDevHint(devCode ? `No email provider is set up yet, so here's the code directly: ${devCode}` : "");
      setStage("forgotReset");
    } catch (error) {
      setErr({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    const e = {};
    if (!/^\d{6}$/.test(resetCode.trim())) e.resetCode = "Enter the 6-digit code";
    if (newPw.length < 8) e.newPw = "Passwords are at least 8 characters";
    if (newPwConfirm !== newPw) e.newPwConfirm = "Passwords do not match";
    setErr(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const user = await api.resetPassword(email.trim().toLowerCase(), resetCode.trim(), newPw, newPwConfirm);
      onDone(user);
    } catch (error) {
      setErr({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth" style={{ display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)", minHeight: "calc(100vh - 70px)" }}>
      <aside style={{ background: theme.tint, padding: "44px 46px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: `1px solid ${T.line}` }}>
        <Mark size={30} color={theme.deep} />
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontStyle: "italic", fontSize: 30, lineHeight: 1.25, letterSpacing: "-.02em", margin: "0 0 18px" }}>
            Somebody three streets away already owns the thing you need on Saturday.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: T.ink2, margin: 0, maxWidth: 330 }}>
            Rent it from them or from a shop nearby. We just connect you to those people.
          </p>
        </div>
        <div style={{ display: "flex", gap: 34, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
          <div><p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0 }}>1,400</p><p style={{ ...label, marginTop: 4 }}>Pieces nearby</p></div>
          <div><p style={{ fontFamily: "Fraunces, serif", fontSize: 22, margin: 0 }}>190</p><p style={{ ...label, marginTop: 4 }}>Lenders in Pune</p></div>
        </div>
      </aside>

      <main style={{ background: T.card, padding: "48px 52px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
          {stage === "form" && (
            <>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, letterSpacing: "-.02em", margin: "0 0 6px" }}>
                {isSignup ? "Open an account" : "Welcome back"}
              </h1>
              <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>
                {isSignup ? "Two minutes, then the whole rail is yours." : "Pick up where you left off."}
              </p>

              {isSignup && <AccountTypeToggle value={accountType} onChange={setAccountType} />}

              {isSignup && (
                <AuthField id="nm" lb={isShop ? "Shop name" : "Your name"} error={err.name}>
                  <IconInput icon={isShop ? <BuildingIcon /> : <UserIcon />} id="nm" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} style={inputStyle(err.name)} />
                </AuthField>
              )}

              {isShop && (
                <>
                  <AuthField id="own" lb="Owner's name" error={err.ownerName}>
                    <IconInput icon={<UserIcon />} id="own" value={ownerName} autoComplete="name" onChange={(e) => setOwnerName(e.target.value)} style={inputStyle(err.ownerName)} />
                  </AuthField>
                  <AuthField id="gstin" lb="GSTIN / business registration number" error={err.gstin}>
                    <IconInput icon={<HashIcon />} id="gstin" value={gstin} maxLength={15} style={{ ...inputStyle(err.gstin), textTransform: "uppercase" }}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())} />
                  </AuthField>
                </>
              )}

              <AuthField id="email" lb="Email" error={err.email}>
                <IconInput icon={<MailIcon />} id="email" type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} style={inputStyle(err.email)} />
              </AuthField>
              {isSignup && (
                <AuthField id="contact" lb="Contact number" hint={isShop ? "Shown publicly on your shop's listings." : undefined} error={err.contactNumber}>
                  <IconInput icon={<PhoneIcon />} id="contact" inputMode="tel" value={contactNumber} autoComplete="tel" onChange={(e) => setContactNumber(e.target.value)} style={inputStyle(err.contactNumber)} />
                </AuthField>
              )}
              <AuthField id="pwd" lb="Password" error={err.pw}>
                <IconInput icon={<LockIcon />} id="pwd" type="password" value={pw} autoComplete={isSignup ? "new-password" : "current-password"} onChange={(e) => setPw(e.target.value)} style={inputStyle(err.pw)} />
              </AuthField>

              {!isSignup && (
                <p style={{ fontSize: 13, textAlign: "right", margin: "-10px 0 18px" }}>
                  <span onClick={() => { setStage("forgotRequest"); setErr({}); }} style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
                    Forgot password?
                  </span>
                </p>
              )}

              {isSignup && (
                <>
                  <AuthField id="pwdc" lb="Confirm password" error={err.pwConfirm}>
                    <IconInput icon={<LockIcon />} id="pwdc" type="password" value={pwConfirm} autoComplete="new-password" onChange={(e) => setPwConfirm(e.target.value)} style={inputStyle(err.pwConfirm)} />
                  </AuthField>
                  <AuthField id="addr" lb={isShop ? "Shop address" : "Address"} error={err.address}>
                    <IconInput icon={<HomeIcon />} id="addr" value={address} autoComplete="street-address" onChange={(e) => setAddress(e.target.value)} style={inputStyle(err.address)} />
                  </AuthField>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: T.ink2, cursor: "pointer", margin: "2px 0 18px" }}>
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: 3 }} />
                    <span>
                      I agree to the{" "}
                      <span onClick={(e) => { e.preventDefault(); setShowLegal("terms"); }} style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>Terms of Service</span>
                      {" "}and{" "}
                      <span onClick={(e) => { e.preventDefault(); setShowLegal("privacy"); }} style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>Privacy Policy</span>.
                    </span>
                  </label>
                  {err.terms && <p style={{ fontSize: 12, color: T.err, margin: "-14px 0 18px" }}>{err.terms}</p>}
                </>
              )}

              {err.form && <p style={{ fontSize: 13, color: T.err, margin: "-6px 0 16px" }}>{err.form}</p>}

              <button onClick={submit} disabled={loading}
                style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, fontWeight: 500, padding: "14px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
              </button>

              <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "24px 0 0" }}>
                {isSignup ? "Already renting with us? " : "New here? "}
                <span onClick={() => switchMode(isSignup ? "login" : "signup")}
                  style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
                  {isSignup ? "Log in" : "Create an account"}
                </span>
              </p>
            </>
          )}

          {stage === "forgotRequest" && (
            <>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, letterSpacing: "-.02em", margin: "0 0 6px" }}>Reset your password</h1>
              <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>Enter the email on your account and we'll send a reset code.</p>

              <AuthField id="fpemail" lb="Email" error={err.email}>
                <IconInput icon={<MailIcon />} id="fpemail" type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} style={inputStyle(err.email)} />
              </AuthField>

              {err.form && <p style={{ fontSize: 13, color: T.err, margin: "-6px 0 16px" }}>{err.form}</p>}

              <button onClick={requestReset} disabled={loading}
                style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, fontWeight: 500, padding: "14px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? "Sending…" : "Send reset code"}
              </button>

              <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "24px 0 0" }}>
                <span onClick={() => { setStage("form"); setErr({}); }} style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
                  Back to log in
                </span>
              </p>
            </>
          )}

          {stage === "forgotReset" && (
            <>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, letterSpacing: "-.02em", margin: "0 0 6px" }}>Enter your code</h1>
              <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 16px" }}>We sent a 6-digit code to {email}. It expires in 10 minutes.</p>
              {devHint && <p style={{ fontSize: 12.5, color: theme.deep, background: theme.tint, borderRadius: 3, padding: "8px 10px", margin: "0 0 20px" }}>{devHint}</p>}

              <AuthField id="code" lb="6-digit code" error={err.resetCode}>
                <IconInput icon={<HashIcon />} id="code" inputMode="numeric" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))} style={inputStyle(err.resetCode)} />
              </AuthField>
              <AuthField id="newpw" lb="New password" error={err.newPw}>
                <IconInput icon={<LockIcon />} id="newpw" type="password" value={newPw} autoComplete="new-password" onChange={(e) => setNewPw(e.target.value)} style={inputStyle(err.newPw)} />
              </AuthField>
              <AuthField id="newpwc" lb="Confirm new password" error={err.newPwConfirm}>
                <IconInput icon={<LockIcon />} id="newpwc" type="password" value={newPwConfirm} autoComplete="new-password" onChange={(e) => setNewPwConfirm(e.target.value)} style={inputStyle(err.newPwConfirm)} />
              </AuthField>

              {err.form && <p style={{ fontSize: 13, color: T.err, margin: "-6px 0 16px" }}>{err.form}</p>}

              <button onClick={submitReset} disabled={loading}
                style={{ width: "100%", fontFamily: "Karla, sans-serif", fontSize: 15, fontWeight: 500, padding: "14px", border: "none", borderRadius: 3, background: T.ink, color: T.paper, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? "Resetting…" : "Reset password"}
              </button>

              <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "24px 0 0" }}>
                <span onClick={() => { setStage("form"); setErr({}); }} style={{ color: theme.deep, cursor: "pointer", borderBottom: `1px solid ${theme.accent}` }}>
                  Back to log in
                </span>
              </p>
            </>
          )}
        </div>
      </main>

      {showLegal && <LegalModal tab={showLegal} setTab={setShowLegal} onClose={() => setShowLegal(null)} />}
    </div>
  );
}
