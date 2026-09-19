import { labelUserRole } from "../utils/userAdminFormatters.js";

export default function UserAdminFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roles,
  statuses,
}) {
  return (
    <div className="user-admin-filters">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search ID, name, email, contact, or role"
      />

      <select
        value={roleFilter}
        onChange={(event) =>
          setRoleFilter(event.target.value)
        }
      >
        <option value="all">All roles</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {labelUserRole(role)}
          </option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value)
        }
      >
        <option value="all">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
