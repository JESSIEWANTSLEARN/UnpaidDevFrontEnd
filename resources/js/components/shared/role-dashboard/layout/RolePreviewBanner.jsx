import React from "react";

export default function RolePreviewBanner({
  title,
  onExit,
}) {
  return (
    <div
      className="role-preview-banner"
      role="status"
    >
      <div>
        <strong>
          Preview Mode: {title}
        </strong>
        <span>
          You are still signed in as Super Admin.
          This workspace is read-only.
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
      >
        Exit Preview
      </button>
    </div>
  );
}
