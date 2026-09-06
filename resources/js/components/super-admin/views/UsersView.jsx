import React, { useEffect, useMemo, useState } from "react";

const ROLE_OPTIONS = [
  ["all", "All Roles"],
  ["super_admin", "Super Admin"],
  ["Operations_Manager", "Operations Manager"],
  ["Purchasing_Manager", "Purchasing Manager"],
  ["Warehouse_Admin", "Warehouse Admin"],
  ["Sales_Manager", "Sales Manager"],
  ["Purchasing_Staff", "Purchasing Staff"],
  ["Inventory_Controller", "Inventory Controller"],
  ["Sales_Staff", "Sales Staff"],
  ["User_Admin", "User Admin"],
  ["System_User", "System User"],
];

const STATUS_OPTIONS = [
  ["all", "All Status"],
  ["active", "Active"],
  ["pending_verification", "Pending"],
  ["disabled", "Disabled"],
];

const PRESENCE_OPTIONS = [
  ["all", "All Presence"],
  ["online", "Online"],
  ["offline", "Offline"],
];

const roleLabel = (role) =>
  ROLE_OPTIONS.find(([value]) => value === role)?.[1]
  || role?.replaceAll("_", " ")
  || "Unknown";

const statusClass = (status) =>
  status === "active"
    ? "status-ok"
    : status === "disabled"
      ? "status-bad"
      : "status-warn";

const formatLastSeen = (value) => {
  if (!value) return "Never";
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function UsersView({
  data,
  openModal,
  openUserEditor,
  openUserSessions,
  openUserDelete,
}) {
  const [selectedRole, setSelectedRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [presence, setPresence] = useState("all");
  const [search, setSearch] = useState("");
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    const initial = {};
    (data.users || []).forEach((user) => {
      initial[user.user_id] = {
        is_online: Boolean(user.is_online),
        last_seen_at: user.last_seen_at || null,
      };
    });
    setPresenceMap(initial);
  }, [data.users]);

  useEffect(() => {
    let cancelled = false;

    const refreshPresence = async () => {
      try {
        const response = await fetch("/api/super-admin/user-presence", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;
        const result = await response.json();
        if (cancelled) return;

        const next = {};
        (result.users || []).forEach((user) => {
          next[user.user_id] = {
            is_online: Boolean(user.is_online),
            last_seen_at: user.last_seen_at || null,
          };
        });
        setPresenceMap(next);
      } catch {
        // Keep the most recent known presence if the refresh fails.
      }
    };

    refreshPresence();
    const intervalId = window.setInterval(refreshPresence, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const users = useMemo(
    () => (data.users || []).map((user) => ({
      ...user,
      ...(presenceMap[user.user_id] || {}),
    })),
    [data.users, presenceMap]
  );

  const roleCounts = useMemo(() => {
    const counts = Object.fromEntries(
      ROLE_OPTIONS.filter(([value]) => value !== "all").map(([value]) => [value, 0])
    );

    users.forEach((user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
    });

    return { all: users.length, ...counts };
  }, [users]);

  const usersInSelectedRole = useMemo(() => {
    if (selectedRole === "all") return users;
    return users.filter((user) => user.role === selectedRole);
  }, [users, selectedRole]);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, pending_verification: 0, disabled: 0 };
    usersInSelectedRole.forEach((user) => {
      counts[user.account_status] = (counts[user.account_status] || 0) + 1;
    });
    return counts;
  }, [usersInSelectedRole]);

  const presenceCounts = useMemo(() => {
    const online = usersInSelectedRole.filter((user) => user.is_online).length;
    return {
      online,
      offline: usersInSelectedRole.length - online,
    };
  }, [usersInSelectedRole]);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return usersInSelectedRole.filter((user) => {
      const statusMatch = status === "all" || user.account_status === status;
      const presenceMatch = presence === "all"
        || (presence === "online" && user.is_online)
        || (presence === "offline" && !user.is_online);

      const searchMatch = !needle || [
        user.user_id,
        user.name,
        user.email,
        user.contact_number,
        roleLabel(user.role),
      ].some((value) => String(value ?? "").toLowerCase().includes(needle));

      return statusMatch && presenceMatch && searchMatch;
    });
  }, [usersInSelectedRole, status, presence, search]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setStatus("all");
    setPresence("all");
    setSearch("");
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h2>User Management</h2>
          <p>Manage roles, account status, device sessions, and safe account deletion.</p>
        </div>

        <button className="btn-primary" type="button" onClick={() => openModal("addUser")}>
          + Add User
        </button>
      </div>

      <div className="ops-panel user-role-categories">
        <div className="user-category-head">
          <div>
            <h3>Role Categories</h3>
            <p>Click a role to show only that role's accounts.</p>
          </div>
        </div>

        <div className="user-role-grid">
          {ROLE_OPTIONS.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`user-role-card ${selectedRole === value ? "is-active" : ""}`}
              onClick={() => selectRole(value)}
            >
              <span>{label}</span>
              <strong>{roleCounts[value] || 0}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="user-presence-summary">
        <div className="ops-panel presence-count-card">
          <span className="presence-dot is-online" />
          <div>
            <strong>{presenceCounts.online}</strong>
            <span>Online</span>
          </div>
        </div>
        <div className="ops-panel presence-count-card">
          <span className="presence-dot is-offline" />
          <div>
            <strong>{presenceCounts.offline}</strong>
            <span>Offline</span>
          </div>
        </div>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input
            className="user-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search inside ${selectedRole === "all" ? "all roles" : roleLabel(selectedRole)}...`}
            aria-label="Search users"
          />

          {search && (
            <button className="user-search-clear" type="button" onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>

        <div className="user-filter-groups">
          <div className="user-status-filters" aria-label="Filter account status">
            {STATUS_OPTIONS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`role-filter-chip ${status === value ? "is-active" : ""}`}
                onClick={() => setStatus(value)}
              >
                {label}
                {value !== "all" ? ` (${statusCounts[value] || 0})` : ` (${usersInSelectedRole.length})`}
              </button>
            ))}
          </div>

          <div className="user-status-filters" aria-label="Filter online presence">
            {PRESENCE_OPTIONS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`role-filter-chip ${presence === value ? "is-active" : ""}`}
                onClick={() => setPresence(value)}
              >
                {label}
                {value === "online" ? ` (${presenceCounts.online})` : value === "offline" ? ` (${presenceCounts.offline})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ops-panel">
        <div className="user-results-head">
          <div>
            <h3>{selectedRole === "all" ? "All Roles" : roleLabel(selectedRole)}</h3>
            <p>{filteredUsers.length} matching account{filteredUsers.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Account</th>
                <th>Presence</th>
                <th>Last Seen</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="ops-empty">No users match the selected filters.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAccount = Number(user.user_id) === Number(data.current_user?.user_id);

                  return (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.contact_number || "-"}</td>
                      <td><span className="user-role-label">{roleLabel(user.role)}</span></td>
                      <td>
                        <span className={`status-badge ${statusClass(user.account_status)}`}>
                          {user.account_status}
                        </span>
                      </td>
                      <td>
                        <span className={`presence-badge ${user.is_online ? "online" : "offline"}`}>
                          <span className={`presence-dot ${user.is_online ? "is-online" : "is-offline"}`} />
                          {user.is_online ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td>{formatLastSeen(user.last_seen_at)}</td>
                      <td>{user.email_verified_at ? "Yes" : "No"}</td>
                      <td>
                        <div className="user-row-actions">
                          <button className="row-action row-action-wide" type="button" onClick={() => openUserEditor(user)}>
                            Edit
                          </button>
                          <button className="row-action row-action-wide" type="button" onClick={() => openUserSessions(user)}>
                            Sessions
                          </button>
                          {!isCurrentAccount && (
                            <button className="row-action row-action-wide row-action-danger" type="button" onClick={() => openUserDelete(user)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}