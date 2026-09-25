import { UserAdminEmpty } from "../common/UserAdminPrimitives.jsx";
import {
  formatUserAdminDate,
  labelUserRole,
} from "../utils/userAdminFormatters.js";

export default function UserAdminAccessTable({ rows }) {
  if (!rows.length) {
    return (
      <UserAdminEmpty text="No recent access-management activity." />
    );
  }

  return (
    <div className="user-admin-table-wrap">
      <table className="user-admin-table user-admin-access-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Description</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.audit_id}>
              <td>
                {formatUserAdminDate(row.created_at)}
              </td>
              <td>
                {row.user_name || "System"}
                {row.user_role && (
                  <small>
                    {labelUserRole(row.user_role)}
                  </small>
                )}
              </td>
              <td>{row.action}</td>
              <td>{row.description || "-"}</td>
              <td>{row.ip_address || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
