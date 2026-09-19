import React from "react";

export default function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="role-live-panel">
      <header className="role-live-section-head">
        <div>
          <h2>{title}</h2>
          {description && (
            <p>{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
