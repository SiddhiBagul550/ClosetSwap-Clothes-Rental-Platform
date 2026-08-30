import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, BrandPanel, Field, inputStyle } from "../components/AuthUI";
import "../css/AuthNew.css";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (username.trim().length < 2) e.username = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Passwords are at least 8 characters";
    if (passwordConfirm !== password) e.passwordConfirm = "Passwords do not match";
    if (contactNumber.trim().length < 10) e.contactNumber = "Enter a valid contact number";
    if (address.trim().length < 1) e.address = "Enter your address";
    return e;
  };

  const handleSignup = async (evt) => {
    evt.preventDefault();
    const e = validate();
    setErr(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/api/v1/users/signup", {
        username,
        email,
        password,
        passwordConfirm,
        contactNumber,
        address,
      });
      localStorage.setItem("jwtToken", response.data.token);
      localStorage.setItem("userId", response.data.data.user._id);
      navigate("/splash");
    } catch (error) {
      setErr({ form: error.response?.data?.message || "Signup failed, please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth-page" style={{ fontFamily: "Karla, sans-serif", background: T.paper, color: T.ink, minHeight: "100vh" }}>
      <div className="cs-auth">
        <BrandPanel />

        <main style={{ background: T.card, padding: "48px 52px", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, margin: "0 0 6px", letterSpacing: "-.02em" }}>
              Open an account
            </h1>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>Two minutes, and the rail is yours to browse.</p>

            <form onSubmit={handleSignup}>
              <Field id="username" label="Your name" error={err.username}>
                <input
                  id="username"
                  value={username}
                  autoComplete="name"
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle(err.username)}
                />
              </Field>
              <Field id="email" label="Email address" error={err.email}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle(err.email)}
                />
              </Field>
              <Field id="password" label="Password" error={err.password}>
                <input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle(err.password)}
                />
              </Field>
              <Field id="passwordConfirm" label="Confirm password" error={err.passwordConfirm}>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  autoComplete="new-password"
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  style={inputStyle(err.passwordConfirm)}
                />
              </Field>
              <Field id="contactNumber" label="Contact number" error={err.contactNumber}>
                <input
                  id="contactNumber"
                  inputMode="tel"
                  value={contactNumber}
                  autoComplete="tel"
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={inputStyle(err.contactNumber)}
                />
              </Field>
              <Field id="address" label="Address" error={err.address}>
                <input
                  id="address"
                  value={address}
                  autoComplete="street-address"
                  onChange={(e) => setAddress(e.target.value)}
                  style={inputStyle(err.address)}
                />
              </Field>

              {err.form && <p style={{ fontSize: 13, color: T.err, margin: "-6px 0 16px" }}>{err.form}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  fontFamily: "Karla, sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "14px",
                  border: "none",
                  borderRadius: 3,
                  background: T.ink,
                  color: T.paper,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "26px 0 0" }}>
              Already renting with us?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: T.deep, cursor: "pointer", borderBottom: `1px solid ${T.accent}` }}
              >
                Log in
              </span>
            </p>

            <p style={{ fontSize: 11, lineHeight: 1.6, color: T.ink3, textAlign: "center", margin: "18px 0 0" }}>
              By continuing you agree to our rental terms and damage policy.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignupPage;
