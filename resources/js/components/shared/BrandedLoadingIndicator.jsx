import React from "react";
import "../../../css/shared/branded-loading-indicator.css";

const LOGO_SOURCES = ["/wbo-logo.svg", "/wbo-logo.png"];

function tryNextLogo(event) {
  const image = event.currentTarget;
  const next = Number(image.dataset.logoFallback || 0) + 1;
  if (next >= LOGO_SOURCES.length) return;
  image.dataset.logoFallback = String(next);
  image.src = LOGO_SOURCES[next];
}

/** Decorative branding; the surrounding skeleton owns the accessible loading status. */
export default function BrandedLoadingIndicator({ label = "Loading..." }) {
  return (
    <div className="wbo-brand-loader" aria-hidden="true">
      <div className="wbo-brand-dvd-field">
        <div className="wbo-brand-dvd-x">
          <div className="wbo-brand-dvd-y">
            <img
              className="wbo-brand-dvd-logo"
              src={LOGO_SOURCES[0]}
              onError={tryNextLogo}
              alt=""
              width="64"
              height="64"
              decoding="async"
              draggable="false"
            />
          </div>
        </div>
      </div>
      <div className="wbo-brand-loader-card">
        <div className="wbo-brand-loader-stage">
          <span className="wbo-brand-loader-shadow" />
          <div className="wbo-brand-loader-bounce">
            <div className="wbo-brand-loader-mark">
              <img
                className="wbo-brand-loader-logo"
                src={LOGO_SOURCES[0]}
                onError={tryNextLogo}
                alt=""
                width="88"
                height="88"
                decoding="async"
                draggable="false"
              />
            </div>
          </div>
        </div>
        <span className="wbo-brand-loader-text">{label}</span>
      </div>
    </div>
  );
}
