import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/otp.css";

import { authFetch } from "../../services/auth/authRequest.js";
const Logo = "/storage/site/Logo.png";
const POLICY_KEY = "wbo_login_otp_policy";

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

function readPolicy() {
  try {
    const raw = sessionStorage.getItem(POLICY_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function savePolicy(policy) {
  if (!policy || typeof policy !== "object") return;

  sessionStorage.setItem(
    POLICY_KEY,
    JSON.stringify({
      ...policy,
      sent_at_ms: Date.now(),
    }),
  );
}

function initialCooldown(policy) {
  const cooldown = Number(
    policy?.resend_cooldown_seconds,
  );

  const sentAt = Number(policy?.sent_at_ms);

  if (
    !Number.isFinite(cooldown) ||
    cooldown <= 0 ||
    !Number.isFinite(sentAt) ||
    sentAt <= 0
  ) {
    return 0;
  }

  const elapsed = Math.floor(
    (Date.now() - sentAt) / 1000,
  );

  return Math.max(0, cooldown - elapsed);
}

function LoginOtp() {
  const navigate = useNavigate();

  const initialPolicy = useMemo(() => readPolicy(), []);

  const [policy, setPolicy] = useState(initialPolicy);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(() =>
    initialCooldown(initialPolicy),
  );

  const email =
    sessionStorage.getItem("wbo_login_email") ||
    "your registered email";

  const otpLength =
    Number(policy?.length) > 0
      ? Number(policy.length)
      : null;

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const updatePolicy = (nextPolicy) => {
    if (!nextPolicy || typeof nextPolicy !== "object") {
      return;
    }

    const stored = {
      ...nextPolicy,
      sent_at_ms: Date.now(),
    };

    setPolicy(stored);
    savePolicy(nextPolicy);
  };

  const handleOtpChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (otpLength) {
      value = value.slice(0, otpLength);
    }

    setOtp(value);
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      otpLength &&
      !new RegExp(`^\\d{${otpLength}}$`).test(otp)
    ) {
      setError(
        `OTP must contain exactly ${otpLength} digits.`,
      );
      return;
    }

    if (!otp) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch("/login/verify-otp", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({ otp }),
      });

      const data = await readJson(response);

      if (data.otp_policy) {
        setPolicy((current) => ({
          ...(current || {}),
          ...data.otp_policy,
        }));
      }

      if (!response.ok || data.success === false) {
        setError(data.message || "Unable to verify the OTP.");

        if (data.redirect) {
          window.setTimeout(
            () => navigate(data.redirect),
            900,
          );
        }

        return;
      }

      sessionStorage.removeItem("wbo_login_email");
      sessionStorage.removeItem(POLICY_KEY);

      setMessage(data.message || "Login successful.");

      window.setTimeout(() => {
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          navigate("/");
        }
      }, 600);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await authFetch("/login/resend-otp", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({}),
      });

      const data = await readJson(response);

      if (!response.ok || data.success === false) {
        setError(data.message || "Unable to resend the OTP.");

        if (data.otp_policy) {
          setPolicy((current) => ({
            ...(current || {}),
            ...data.otp_policy,
          }));
        }

        if (Number(data.seconds_remaining) > 0) {
          setCooldown(Number(data.seconds_remaining));
        }

        if (data.redirect) {
          window.setTimeout(
            () => navigate(data.redirect),
            900,
          );
        }

        return;
      }

      setOtp("");

      if (data.otp_policy) {
        updatePolicy(data.otp_policy);

        setCooldown(
          Number(
            data.otp_policy
              .resend_cooldown_seconds,
          ) || 0,
        );
      }

      setMessage(data.message || "A new OTP has been sent.");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">
      <header className="otp-header">
        <div className="otp-header-inner">
          <Link to="/" className="otp-brand">
            <img
              src={Logo}
              alt="Walang Brown Out Logo"
            />

            <div className="otp-brand-text">
              <span>Republic of the Philippines</span>
              <strong>WALANG BROWN OUT</strong>
            </div>
          </Link>
        </div>
      </header>

      <main className="otp-container">
        <Link to="/login" className="otp-back">
          ← Back to Login
        </Link>

        <div className="otp-title">
          <h2>Verify Your Login</h2>
          <p>
            We sent a {otpLength || 6}-digit verification code to
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && <div className="otp-error">{error}</div>}
        {message && (
          <div className="otp-message">{message}</div>
        )}

        <form
          className="otp-form"
          onSubmit={verifyOtp}
        >
          <label htmlFor="otp">Enter OTP Code</label>

          <input
            id="otp"
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={otp}
            onChange={handleOtpChange}
            disabled={loading}
            maxLength={otpLength || undefined}
            required
          />

          <button
            className="otp-primary"
            type="submit"
            disabled={
              loading ||
              !otp ||
              Boolean(
                otpLength &&
                  otp.length !== otpLength,
              )
            }
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="otp-info">
          {policy ? (
            <>
              OTP expires after{" "}
              {policy.expiry_minutes}{" "}
              {Number(policy.expiry_minutes) === 1
                ? "minute"
                : "minutes"}
              .
              <br />
              You may resend the OTP a maximum of{" "}
              {policy.max_resends} times.
            </>
          ) : (
            "Use the current verification code sent to your email."
          )}
        </div>

        <div className="otp-resend">
          <button
            className="otp-secondary"
            type="button"
            onClick={resendOtp}
            disabled={resending || cooldown > 0}
          >
            {resending
              ? "Sending..."
              : cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Resend OTP"}
          </button>
        </div>
      </main>

      <footer className="otp-footer">
        <strong>© 2026 WalangBrownOut.</strong> All rights reserved.
      </footer>
    </div>
  );
}

export default LoginOtp;
