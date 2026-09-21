import React from "react";

export default function RoleDashboardMessages({
  notice,
  error,
  onRetry,
}) {
  return (
    <>
      {notice && (
        <div
          className="role-live-notice"
          role="status"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          className="role-live-error"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="role-live-retry"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
}
