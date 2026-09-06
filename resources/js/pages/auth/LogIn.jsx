import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/login.css";
import "../../../css/auth/password-reset.css";

import { authFetch } from "../../services/auth/authRequest.js";
const Logo = "/storage/site/Logo.png";

function csrfToken() {
  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") ?? ""
  );
}

async function readJson(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function saveOtpPolicy(key, policy) {
  if (!policy || typeof policy !== "object") return;

  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...policy,
      sent_at_ms: Date.now(),
    }),
  );
}

function LogIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch("/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({
          email,
          password,
          remember_device: rememberDevice,
        }),
      });

      const data = await readJson(response);

      if (!response.ok || data.success === false) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        setError(
          validationMessage ||
            data.message ||
            "Unable to log in. Please try again.",
        );

        if (data.redirect) {
          window.setTimeout(() => navigate(data.redirect), 900);
        }

        return;
      }

      const destinationEmail = data.email || email;

      if (data.authenticated === true) {
        sessionStorage.removeItem("wbo_login_email");
        sessionStorage.removeItem("wbo_login_otp_policy");
        sessionStorage.removeItem("wbo_signup_email");
        sessionStorage.removeItem("wbo_signup_otp_policy");

        window.location.href = data.redirect || "/";
        return;
      }

      if (data.verification === "signup") {
        sessionStorage.removeItem("wbo_login_email");
        sessionStorage.removeItem("wbo_login_otp_policy");

        sessionStorage.setItem(
          "wbo_signup_email",
          destinationEmail,
        );

        saveOtpPolicy(
          "wbo_signup_otp_policy",
          data.otp_policy,
        );
      } else {
        sessionStorage.removeItem("wbo_signup_email");
        sessionStorage.removeItem("wbo_signup_otp_policy");

        sessionStorage.setItem(
          "wbo_login_email",
          destinationEmail,
        );

        saveOtpPolicy(
          "wbo_login_otp_policy",
          data.otp_policy,
        );
      }

      navigate(data.redirect || "/login-otp");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-inner">
          <Link to="/" className="login-brand">
            <img
              src={Logo}
              alt="Walang Brown Out Logo"
              width="45"
              height="45"
            />

            <div className="login-brand-text">
              <span>Republic of the Philippines</span>
              <strong>WALANG BROWN OUT</strong>
            </div>
          </Link>
        </div>
      </header>

      <main className="login-container">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>

        <div className="login-title">
          <h2>Welcome Back</h2>
          <p>Sign in to access your WalangBrownout account</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={loading}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <label className="login-remember-device">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) =>
                setRememberDevice(event.target.checked)
              }
              disabled={loading}
            />
            <span>
              Remember this device and skip OTP next time
            </span>
          </label>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Continue to Login"}
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup">Create one here</Link>
          </p>
        </form>
      </main>

      <footer className="login-footer">
        <strong>© 2026 WalangBrownOut.</strong> All rights reserved.
      </footer>
    </div>
  );
}

export default LogIn;
