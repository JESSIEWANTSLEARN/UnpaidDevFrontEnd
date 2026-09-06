import React from "react";

export function ErrorMessage({ error, className = "" }) {
  if (!error) return null;
  return <p className={`admin-form-error ${className}`.trim()}>{error}</p>;
}

export function SubmitButton({ busy, busyText, children, disabled = false }) {
  return (
    <button className="btn-primary" type="submit" disabled={busy || disabled}>
      {busy ? busyText : children}
    </button>
  );
}

export function submit(event, busy, handler) {
  event.preventDefault();
  if (!busy) handler();
}
