import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, BrandPanel, Field, inputStyle } from "../components/AuthUI";
import "../css/AuthNew.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Passwords are at least 8 characters";
    return e;
  };

  const handleLogin = async (evt) => {
    evt.preventDefault();
    const e = validate();
    setErr(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/api/v1/users/login", { email, password });
      localStorage.setItem("jwtToken", response.data.token);
      localStorage.setItem("userId", response.data.data.user._id);
      navigate("/splash");
    } catch (error) {
      setErr({ form: error.response?.data?.message || "Incorrect email or password" });
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
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: T.ink2, margin: "0 0 26px" }}>Pick up where you left off.</p>

            <form onSubmit={handleLogin}>
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
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle(err.password)}
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
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>

            <p style={{ fontSize: 13, color: T.ink2, textAlign: "center", margin: "26px 0 0" }}>
              New here?{" "}
              <span
                onClick={() => navigate("/signup")}
                style={{ color: T.deep, cursor: "pointer", borderBottom: `1px solid ${T.accent}` }}
              >
                Create an account
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
