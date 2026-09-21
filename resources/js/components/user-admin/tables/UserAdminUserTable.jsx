import { UserAdminEmpty } from "../common/UserAdminPrimitives.jsx";
import {
  formatUserAdminDate,
  labelUserRole,
} from "../utils/userAdminFormatters.js";

export default function UserAdminUserTable({
  users,
  previewMode,
  currentUserId,
  onEdit,
  onSessions,
}) {
  if (!users.length) {
    return <UserAdminEmpty text="No matching users." />;
  }

  return (
    <div className="user-admin-table-wrap">
      <table className="user-admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Sessions</th>
            <th>Last Seen</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
                <small>
                  {user.contact_number || "No contact"}
                </small>
              </td>

              <td>
                {labelUserRole(user.role)}
                {Number(user.user_id) ===
                  Number(currentUserId) && (
                  <small>Current account</small>
                )}
              </td>

              <td>
                <span
                  className={`user-admin-status status-${user.account_status}`}
                >
                  {user.account_status}
                </span>
              </td>

              <td>{Number(user.active_sessions || 0)}</td>

              <td>
                {formatUserAdminDate(
                  user.last_session_activity ||
                    user.last_seen_at,
                )}
              </td>

              <td>
                {formatUserAdminDate(user.created_at)}
              </td>

              <td>
                <div className="user-admin-actions">
                  <button
                    type="button"
                    onClick={() => onSessions(user)}
                  >
                    Sessions
                  </button>

                  <button
                    type="button"
                    disabled={previewMode}
                    onClick={() => onEdit(user)}
                  >
                    {previewMode ? "Read only" : "Edit"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
