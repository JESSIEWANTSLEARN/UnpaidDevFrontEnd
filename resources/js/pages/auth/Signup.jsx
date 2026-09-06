import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../../css/auth/signup.css";

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

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function saveOtpPolicy(policy) {
  if (!policy || typeof policy !== "object") return;

  sessionStorage.setItem(
    "wbo_signup_otp_policy",
    JSON.stringify({
      ...policy,
      sent_at_ms: Date.now(),
    }),
  );
}

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const {
      name,
      email,
      contactNumber,
      password,
      confirmPassword,
    } = formData;

    if (
      !name ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch("/register", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({
          name,
          email,
          contact_number: contactNumber,
          password,
          password_confirmation: confirmPassword,
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
            "Unable to create your account.",
        );

        if (data.redirect) {
          window.setTimeout(
            () => navigate(data.redirect),
            900,
          );
        }

        return;
      }

      sessionStorage.setItem(
        "wbo_signup_email",
        data.email || email,
      );

      saveOtpPolicy(data.otp_policy);

      navigate(data.redirect || "/signup-verify");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-header">
        <div className="signup-header-inner">
          <Link to="/" className="signup-brand">
            <img
              src={Logo}
              alt="Walang Brown Out Logo"
              width="45"
              height="45"
            />

            <div className="signup-brand-text">
              <span>Republic of the Philippines</span>
              <strong>WALANG BROWN OUT</strong>
            </div>
          </Link>
        </div>
      </header>

      <main className="signup-container">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>

        <div className="signup-title">
          <h2>Create an Account</h2>
          <p>Create your WalangBrownout customer account</p>
        </div>

        {error && <div className="signup-error">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              required
              autoComplete="tel"
              placeholder="09123456789"
              value={formData.contactNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>

            <div className="password-field">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength="6"
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
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

          <div className="form-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>

            <div className="password-field">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength="6"
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                disabled={loading}
                aria-pressed={showConfirmPassword}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="signup-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login">Login here</Link>
          </p>
        </form>
      </main>

      <footer className="signup-footer">
        <strong>© 2026 WalangBrownOut.</strong> All rights reserved.
      </footer>
    </div>
  );
}

export default Signup;
