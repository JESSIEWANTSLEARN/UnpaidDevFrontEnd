import {
  UserAdminEmpty,
  UserAdminSection,
} from "../common/UserAdminPrimitives.jsx";
import { formatUserAdminDate } from "../utils/userAdminFormatters.js";

export default function UserSessionsPanel({
  user,
  sessions,
  previewMode,
  busy,
  onClose,
  onRefresh,
  onRevoke,
  onRevokeAll,
}) {
  return (
    <UserAdminSection
      title={`${user.name} - Sessions`}
      description="Showing up to 30 recent sessions with active sessions first. Session revocation is unavailable in Super Admin preview mode."
    >
      <div className="user-admin-session-toolbar">
        <button
          type="button"
          onClick={onRefresh}
          disabled={busy}
        >
          Refresh
        </button>

        <button
          type="button"
          disabled={previewMode || busy}
          onClick={onRevokeAll}
        >
          Revoke All
        </button>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {!sessions.length ? (
        <UserAdminEmpty text="No tracked sessions for this account." />
      ) : (
        <div className="user-admin-session-grid">
          {sessions.map((session) => (
            <article
              key={session.session_id}
              className="user-admin-session-card"
            >
              <div>
                <strong>{session.device_name}</strong>
                <span>
                  {session.browser_name} -{" "}
                  {session.operating_system}
                </span>
              </div>

              <dl>
                <div>
                  <dt>IP</dt>
                  <dd>{session.ip_address}</dd>
                </div>
                <div>
                  <dt>Last activity</dt>
                  <dd>
                    {formatUserAdminDate(
                      session.last_activity_at,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {session.is_active
                      ? "Active"
                      : "Closed"}
                    {session.is_current_session
                      ? " - Current"
                      : ""}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={
                  previewMode ||
                  busy ||
                  !session.is_active ||
                  session.is_current_session
                }
                onClick={() =>
                  onRevoke(session.session_id)
                }
              >
                {session.is_current_session
                  ? "Current Session"
                  : session.is_active
                    ? "Revoke"
                    : "Closed"}
              </button>
            </article>
          ))}
        </div>
      )}
    </UserAdminSection>
  );
}
