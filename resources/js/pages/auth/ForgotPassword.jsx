import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/password-reset.css";

const Logo = "/storage/site/Logo.png";

const csrfToken = () =>
  document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content") ?? "";

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken(),
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok || data.success === false) {
    const validation = data.errors
      ? Object.values(data.errors).flat()[0]
      : null;

    const error = new Error(
      validation ||
        data.message ||
        "Unable to complete the password reset request.",
    );

    error.data = data;
    throw error;
  }

  return data;
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [stage, setStage] = useState(
    () => sessionStorage.getItem("wbo_password_reset_stage") || "request",
  );

  const [email, setEmail] = useState(
    () => sessionStorage.getItem("wbo_password_reset_email") || "",
  );

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState({
    password: "",
    password_confirmation: "",
  });

  const [policy, setPolicy] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("wbo_password_reset_policy") || "{}",
      );
    } catch {
      return {};
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // WBO PHASE 3: reconcile password recovery with server session
  useEffect(() => {
    let active = true;

    // Transient messages are never persisted.
    setError("");
    setMessage("");

    fetch("/forgot-password/status", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to validate password recovery state.",
          );
        }

        return data;
      })
      .then((data) => {
        if (!active) return;

        const serverStage = ["request", "verify", "reset"].includes(data?.stage)
          ? data.stage
          : "request";

        if (serverStage === "request") {
          sessionStorage.removeItem("wbo_password_reset_stage");
          sessionStorage.removeItem("wbo_password_reset_email");
          sessionStorage.removeItem("wbo_password_reset_policy");
          setStage("request");
          setEmail("");
          setOtp("");
          return;
        }

        sessionStorage.setItem("wbo_password_reset_stage", serverStage);
        setStage(serverStage);

        if (data?.email) {
          sessionStorage.setItem("wbo_password_reset_email", data.email);
          setEmail(data.email);
        }
      })
      .catch(() => {
        // A temporary status-check failure must not become a sticky error.
        // Keep the current client recovery step so the user can retry.
      });

    return () => {
      active = false;
    };
  }, []);

  const otpLength = Number(policy.length || 6);

  const stageTitle = useMemo(() => {
    if (stage === "verify") return "Verify reset code";
    if (stage === "reset") return "Create new password";
    return "Forgot your password?";
  }, [stage]);

  const stageText = useMemo(() => {
    if (stage === "verify") {
      return `Enter the ${otpLength}-digit code sent to ${email || "your email"}.`;
    }

    if (stage === "reset") {
      return "Choose a new password for your WalangBrownout account.";
    }

    return "Enter your account email and we will send a password reset code if the account is eligible.";
  }, [stage, email, otpLength]);

  const savePolicy = (value) => {
    if (!value || typeof value !== "object") return;
    setPolicy(value);
    sessionStorage.setItem(
      "wbo_password_reset_policy",
      JSON.stringify(value),
    );
  };

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setBusy(true);

      const data = await postJson("/forgot-password/request", {
        email,
      });

      sessionStorage.setItem("wbo_password_reset_email", email);
      sessionStorage.setItem("wbo_password_reset_stage", "verify");
      savePolicy(data.otp_policy);
      setStage("verify");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setBusy(true);

      const data = await postJson("/forgot-password/verify-otp", {
        otp,
      });

      sessionStorage.setItem("wbo_password_reset_stage", "reset");
      setStage("reset");
      setOtp("");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);

      if (err.data?.redirect) {
        sessionStorage.setItem("wbo_password_reset_stage", "request");
        setStage("request");
      }

      if (err.data?.otp_policy) {
        savePolicy(err.data.otp_policy);
      }
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setMessage("");

    try {
      setBusy(true);

      const data = await postJson("/forgot-password/resend-otp", {});
      savePolicy(data.otp_policy);
      setOtp("");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);

      if (err.data?.redirect) {
        sessionStorage.setItem("wbo_password_reset_stage", "request");
        setStage("request");
      }
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.password !== password.password_confirmation) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setBusy(true);

      const data = await postJson("/forgot-password/reset", password);

      sessionStorage.removeItem("wbo_password_reset_stage");
      sessionStorage.removeItem("wbo_password_reset_email");
      sessionStorage.removeItem("wbo_password_reset_policy");

      setMessage(data.message);

      window.setTimeout(() => {
        navigate(data.redirect || "/login", { replace: true });
      }, 900);
    } catch (err) {
      setError(err.message);

      if (err.data?.redirect === "/forgot-password") {
        sessionStorage.setItem("wbo_password_reset_stage", "request");
        setStage("request");
      }
    } finally {
      setBusy(false);
    }
  };

  const restart = async () => {
    setError("");
    setMessage("");

    try {
      setBusy(true);

      await postJson("/forgot-password/restart", {});

      sessionStorage.removeItem("wbo_password_reset_stage");
      sessionStorage.removeItem("wbo_password_reset_email");
      sessionStorage.removeItem("wbo_password_reset_policy");

      setStage("request");
      setEmail("");
      setOtp("");
      setPassword({
        password: "",
        password_confirmation: "",
      });
      setShowPassword(false);
      setShowConfirmation(false);
    } catch (err) {
      setError(
        err.message || "Unable to restart password recovery.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="password-reset-page">
      <header className="password-reset-header">
        <Link to="/" className="password-reset-brand">
          <img src={Logo} alt="Walang Brown Out Logo" />
          <span>
            <small>Republic of the Philippines</small>
            <strong>WALANG BROWN OUT</strong>
          </span>
        </Link>
      </header>

      <main className="password-reset-main">
        <Link to="/login" className="password-reset-back">
          &larr; Back to Login
        </Link>

        <section className="password-reset-card">
          <div className="password-reset-intro">
            <span>PASSWORD RECOVERY</span>
            <h1>{stageTitle}</h1>
            <p>{stageText}</p>
          </div>

          <div className="password-reset-progress">
            <span className={stage === "request" ? "is-active" : "is-done"}>
              <strong>1</strong>Email
            </span>
            <span className={stage === "verify" ? "is-active" : stage === "reset" ? "is-done" : ""}>
              <strong>2</strong>Verify
            </span>
            <span className={stage === "reset" ? "is-active" : ""}>
              <strong>3</strong>Password
            </span>
          </div>

          {error && (
            <div className="password-reset-alert is-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="password-reset-alert is-success" role="status">
              {message}
            </div>
          )}

          {stage === "request" && (
            <form className="password-reset-form" onSubmit={requestCode}>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  disabled={busy}
                />
              </label>

              <button type="submit" disabled={busy}>
                {busy ? "Sending..." : "Send reset code"}
              </button>
            </form>
          )}

          {stage === "verify" && (
            <form className="password-reset-form" onSubmit={verifyCode}>
              <label>
                <span>Reset code</span>
                <input
                  className="password-reset-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={otpLength}
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder={"\u2022".repeat(otpLength)}
                  disabled={busy}
                />
              </label>

              <button
                type="submit"
                disabled={busy || otp.length !== otpLength}
              >
                {busy ? "Verifying..." : "Verify code"}
              </button>

              <div className="password-reset-secondary-actions">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={busy}
                >
                  Resend code
                </button>

                <button
                  type="button"
                  onClick={restart}
                  disabled={busy}
                >
                  &larr; Back to Email
                </button>
              </div>
            </form>
          )}

          {stage === "reset" && (
            <form className="password-reset-form" onSubmit={resetPassword}>
              <label>
                <span>New password</span>
                <div className="password-reset-password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password.password}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        password: event.target.value,
                      })
                    }
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={busy}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label>
                <span>Confirm new password</span>
                <div className="password-reset-password-field">
                  <input
                    type={showConfirmation ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password.password_confirmation}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        password_confirmation: event.target.value,
                      })
                    }
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmation((value) => !value)
                    }
                    disabled={busy}
                  >
                    {showConfirmation ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <small className="password-reset-hint">
                Minimum 8 characters.
              </small>

              <button type="submit" disabled={busy}>
                {busy ? "Updating..." : "Reset password"}
              </button>

              <div
                className="password-reset-secondary-actions password-reset-step3-back-email"
              >
                <button
                  type="button"
                  onClick={restart}
                  disabled={busy}
                >
                  &larr; Back to Email
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="password-reset-footer">
        <strong>&copy; 2026 WalangBrownOut.</strong> All rights reserved.
      </footer>
    </div>
  );
}
