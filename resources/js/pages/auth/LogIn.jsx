import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePublicTheme from "../../hooks/usePublicTheme.js";
import CinematicAuthLayout from "../../components/shared/CinematicAuthLayout.jsx";
import { authFetch } from "../../services/auth/authRequest.js";

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
  const { theme, toggleTheme } = usePublicTheme();

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
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

        sessionStorage.setItem("wbo_signup_email", destinationEmail);

        saveOtpPolicy("wbo_signup_otp_policy", data.otp_policy);
      } else {
        sessionStorage.removeItem("wbo_signup_email");
        sessionStorage.removeItem("wbo_signup_otp_policy");

        sessionStorage.setItem("wbo_login_email", destinationEmail);

        saveOtpPolicy("wbo_login_otp_policy", data.otp_policy);
      }

      navigate(data.redirect || "/login-otp");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CinematicAuthLayout
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow="CUSTOMER ACCESS"
      title="Welcome back."
      description="Sign in to continue shopping, track your orders, and manage your account."
      backTo="/"
      backLabel="Back to home"
      footerText="New to Walang Brownout?"
      footerLinkTo="/signup"
      footerLinkLabel="Create an account"
    >
      {error ? (
        <div className="cinematic-auth-error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="cinematic-auth-form" onSubmit={handleSubmit}>
        <label className="cinematic-field" htmlFor="login-email">
          <span>Email address</span>
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
        </label>

        <label className="cinematic-field" htmlFor="login-password">
          <span>Password</span>

          <div className="cinematic-password-field">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={loading}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="cinematic-form-row">
          <label className="cinematic-check">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              disabled={loading}
            />
            <span>Remember this device</span>
          </label>

          <Link to="/forgot-password" className="cinematic-text-link">
            Forgot password?
          </Link>
        </div>

        <p className="cinematic-form-note">
          When enabled, a trusted device may skip OTP on future logins according
          to the current security policy.
        </p>

        <button
          className="cinematic-primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Continue to login"}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </CinematicAuthLayout>
  );
}

export default LogIn;
