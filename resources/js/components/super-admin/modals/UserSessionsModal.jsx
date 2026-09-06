import React from "react";
import { ErrorMessage } from "./FormHelpers.jsx";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function UserSessionsModal({
  busy,
  error,
  currentUser,
  selectedUser,
  userSessions,
  sessionsLoading,
  userSessionPagination,
  onUserSessionPageChange,
  onRevokeUserSession,
  onRevokeAllUserSessions,
}) {
  if (!selectedUser) {
    return <div className="admin-modal-body"><p className="ops-subtext">No user selected.</p></div>;
  }

  const isSelf = Number(selectedUser.user_id) === Number(currentUser?.user_id);
  const activeRevocable = (userSessions || []).filter(
    (session) => session.is_active && !session.is_current_session
  );
  const sessionPage = Number(userSessionPagination?.page || 1);
  const sessionPages = Math.max(
    1,
    Number(userSessionPagination?.total_pages || 1),
  );
  const sessionTotal = Number(userSessionPagination?.total || 0);

  return (
    <div className="admin-modal-body">
      <div className="session-user-summary">
        <div>
          <h3>{selectedUser.name}</h3>
          <p>{selectedUser.email}</p>
        </div>
        <button
          className="btn-danger btn-small"
          type="button"
          disabled={busy || sessionsLoading || activeRevocable.length === 0}
          onClick={onRevokeAllUserSessions}
        >
          {isSelf ? "Revoke Other Sessions" : "Revoke All Sessions"}
        </button>
      </div>

      <ErrorMessage error={error} />

      <p className="ops-subtext">
        Session details come from WBO_UserSessions. Showing up to 30 recent sessions with active sessions first. Revoking a session signs that browser/device out on its next request.
      </p>

      {sessionsLoading ? (
        <div className="ops-empty">Loading device and session information...</div>
      ) : (userSessions || []).length === 0 ? (
        <div className="ops-empty">No tracked sessions found for this account.</div>
      ) : (
        <div className="user-session-list">
          {userSessions.map((session) => (
            <article className={`user-session-card ${session.is_active ? "is-active" : ""}`} key={session.session_id}>
              <div className="user-session-top">
                <div>
                  <div className="user-session-title">
                    <strong>{session.device_name}</strong>
                    {session.is_current_session && <span className="session-current-badge">Current Session</span>}
                    <span className={`session-status ${session.is_active ? "active" : "ended"}`}>
                      {session.is_active ? "Active" : "Ended"}
                    </span>
                  </div>
                  <p>{session.browser_name} / {session.operating_system}</p>
                </div>

                {session.is_active && !session.is_current_session && (
                  <button
                    className="btn-danger btn-small"
                    type="button"
                    disabled={busy}
                    onClick={() => onRevokeUserSession(session.session_id)}
                  >
                    Revoke
                  </button>
                )}
              </div>

              <div className="session-detail-grid">
                <div><span>IP Address</span><strong>{session.ip_address || "-"}</strong></div>
                <div><span>Login Time</span><strong>{formatDate(session.logged_in_at)}</strong></div>
                <div><span>Last Active</span><strong>{formatDate(session.last_activity_at)}</strong></div>
                <div><span>Logged Out</span><strong>{formatDate(session.logged_out_at)}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}

      {sessionTotal > 0 && (
        <div className="user-session-pagination">
          <span>
            {sessionTotal} tracked session{sessionTotal === 1 ? "" : "s"}
          </span>

          <div>
            <button
              type="button"
              disabled={busy || sessionsLoading || sessionPage <= 1}
              onClick={() => onUserSessionPageChange(sessionPage - 1)}
            >
              Previous
            </button>

            <strong>
              Page {sessionPage} of {sessionPages}
            </strong>

            <button
              type="button"
              disabled={
                busy ||
                sessionsLoading ||
                sessionPage >= sessionPages
              }
              onClick={() => onUserSessionPageChange(sessionPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}