import React from "react";
import "../../../css/shared/app-loading-screen.css";

/*
 * Shared route-level loading screen.
 *
 * Animation is intentionally limited to transform and opacity so it stays
 * inexpensive on phones and desktops. Reduced-motion users get no animation.
 */
export default function AppLoadingScreen({
  label = "Loading...",
  theme = "light",
}) {
  return (
    <main
      className="app-loading-screen"
      data-theme={theme}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="app-loading-spinner" aria-hidden="true">
        <span className="app-loading-spinner-track" />
        <span className="app-loading-spinner-dot" />
      </div>

      <p>{label}</p>
    </main>
  );
}