import React from "react";
import "../../../../css/customer/loading-skeletons.css";

function Block({ className = "" }) {
  return <span className={`wbo-skeleton-block ${className}`} aria-hidden="true" />;
}

export function CustomerStoreSkeleton({ theme = "light" }) {
  return (
    <main
      className="customer-skeleton-screen"
      data-theme={theme}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="customer-skeleton-sr">Loading your store...</span>

      <div className="customer-skeleton-header">
        <div className="customer-skeleton-brand">
          <Block className="is-logo" />
          <div>
            <Block className="is-brand-small" />
            <Block className="is-brand-name" />
          </div>
        </div>

        <div className="customer-skeleton-nav">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Block key={item} className="is-nav" />
          ))}
        </div>

        <Block className="is-search" />

        <div className="customer-skeleton-actions">
          <Block className="is-round" />
          <Block className="is-round" />
          <Block className="is-cart" />
        </div>
      </div>

      <div className="customer-skeleton-body">
        <section className="customer-skeleton-hero">
          <div className="customer-skeleton-hero-copy">
            <Block className="is-eyebrow" />
            <Block className="is-title-wide" />
            <Block className="is-title-medium" />
            <Block className="is-copy-wide" />
            <Block className="is-copy-medium" />

            <div className="customer-skeleton-buttons">
              <Block className="is-button" />
              <Block className="is-button secondary" />
            </div>

            <div className="customer-skeleton-stats">
              {[1, 2, 3].map((item) => (
                <div key={item}>
                  <Block className="is-stat-number" />
                  <Block className="is-stat-label" />
                </div>
              ))}
            </div>
          </div>

          <div className="customer-skeleton-hero-media">
            <Block className="is-hero-image" />
            <div className="customer-skeleton-live-card">
              <Block className="is-live-label" />
              <Block className="is-live-number" />
              <Block className="is-live-copy" />
            </div>
          </div>
        </section>

        <section className="customer-skeleton-section">
          <Block className="is-section-kicker" />
          <Block className="is-section-title" />
          <div className="customer-skeleton-card-grid">
            {[1, 2, 3, 4].map((item) => (
              <article key={item} className="customer-skeleton-card">
                <Block className="is-card-image" />
                <div className="customer-skeleton-card-copy">
                  <Block className="is-card-kicker" />
                  <Block className="is-card-title" />
                  <Block className="is-card-line" />
                  <Block className="is-card-line short" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function CustomerReviewsSkeleton() {
  return (
    <section
      className="customer-page-section customer-review-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="customer-skeleton-sr">Loading reviews...</span>

      <div className="customer-review-skeleton-title">
        <Block className="is-review-kicker" />
        <Block className="is-review-title" />
        <Block className="is-review-copy" />
      </div>

      {[1, 2, 3].map((section) => (
        <div className="customer-review-skeleton-section" key={section}>
          <Block className="is-review-heading" />

          <div className="customer-review-skeleton-panel">
            <Block className="is-review-card-title" />
            <Block className="is-review-card-line" />
            <Block className="is-review-card-line short" />
          </div>
        </div>
      ))}
    </section>
  );
}