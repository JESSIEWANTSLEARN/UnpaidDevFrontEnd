import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePublicTheme from "../../hooks/usePublicTheme.js";
import CinematicAuthLayout from "../../components/shared/CinematicAuthLayout.jsx";
import { authFetch } from "../../services/auth/authRequest.js";

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
  const { theme, toggleTheme } = usePublicTheme();

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
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
          window.setTimeout(() => navigate(data.redirect), 900);
        }

        return;
      }

      sessionStorage.setItem("wbo_signup_email", data.email || email);
      saveOtpPolicy(data.otp_policy);

      navigate(data.redirect || "/signup-verify");
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
      eyebrow="CREATE YOUR ACCOUNT"
      title="Start shopping smarter."
      description="Create a customer account for secure checkout, order tracking, returns, and support."
      backTo="/login"
      backLabel="Back to login"
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Sign in"
    >
      {error ? (
        <div className="cinematic-auth-error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="cinematic-auth-form" onSubmit={handleSubmit}>
        <div className="cinematic-field-grid">
          <label className="cinematic-field">
            <span>Full name</span>
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
          </label>

          <label className="cinematic-field">
            <span>Contact number</span>
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
          </label>
        </div>

        <label className="cinematic-field">
          <span>Email address</span>
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
        </label>

        <div className="cinematic-field-grid">
          <label className="cinematic-field" htmlFor="signup-password">
            <span>Password</span>

            <div className="cinematic-password-field">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength="6"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
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

          <label className="cinematic-field" htmlFor="signup-confirm-password">
            <span>Confirm password</span>

            <div className="cinematic-password-field">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength="6"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />

              <button
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
          </label>
        </div>

        <p className="cinematic-form-note">
          Your email will be verified using the existing Walang Brownout OTP
          process before the account becomes active.
        </p>

        <button
          className="cinematic-primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </CinematicAuthLayout>
  );
}

export default Signup;
