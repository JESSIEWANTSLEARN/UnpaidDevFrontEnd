import React from "react";
import "../../../css/shared/branded-loading-indicator.css";

/** Decorative branding; the surrounding skeleton owns the accessible loading status. */
export default function BrandedLoadingIndicator({ label = "Loading..." }) {
  return (
    <div className="wbo-brand-loader" aria-hidden="true">
      <div className="wbo-brand-loader-card">
        <div className="wbo-brand-loader-stage">
          <span className="wbo-brand-loader-shadow" />
          <div className="wbo-brand-loader-bounce">
            <div className="wbo-brand-loader-orbit">
              <img
                className="wbo-brand-loader-logo"
                src="/wbo-logo.png"
                alt=""
                width="72"
                height="72"
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
