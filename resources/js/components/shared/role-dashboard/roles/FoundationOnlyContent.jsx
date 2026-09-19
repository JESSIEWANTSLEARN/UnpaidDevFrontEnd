import React from "react";

export default function FoundationOnlyContent({
  activeModule,
}) {
  return (
    <section className="role-dashboard-module">
      <span>Role Foundation</span>
      <h2>{activeModule}</h2>
      <p>
        This role remains on the protected
        dashboard foundation. Its live business
        API is added in the next role batch.
      </p>
    </section>
  );
}
