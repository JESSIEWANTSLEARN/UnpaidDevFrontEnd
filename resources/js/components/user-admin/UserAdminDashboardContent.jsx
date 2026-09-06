import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import AppLoadingScreen from "../shared/AppLoadingScreen.jsx";
import {
  createManagedUser,
  loadManagedUserSessions,
  loadUserAdminDashboard,
  revokeAllManagedUserSessions,
  revokeManagedUserSession,
  updateManagedUser,
} from "../../services/user-admin/userAdminApi.js";
import "../../../css/user-admin/user-admin.css";

// User Admin dashboard content and account/session management UI.

const EMPTY_CREATE = {
  name: "",
  email: "",
  contact_number: "",
  password: "",
  password_confirmation: "",
  role: "System_User",
  account_status: "active",
};

const date = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleString();
};

const labelRole = (role) =>
  String(role || "")
    .replaceAll("_", " ");

function Empty({ text }) {
  return (
    <div className="user-admin-empty">
      {text}
    </div>
  );
}

function Metrics({ metrics = {} }) {
  const cards = [
    ["Managed Accounts", metrics.total_users],
    ["Active", metrics.active_users],
    ["Pending", metrics.pending_users],
    ["Disabled", metrics.disabled_users],
    ["Active Sessions", metrics.active_sessions],
    ["Staff", metrics.staff_accounts],
    ["Customers", metrics.customer_accounts],
  ];

  return (
    <div className="user-admin-metrics">
      {cards.map(([label, value]) => (
        <article
          key={label}
          className="user-admin-metric"
        >
          <span>{label}</span>
          <strong>
            {Number(value || 0).toLocaleString()}
          </strong>
        </article>
      ))}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="user-admin-panel">
      <header className="user-admin-panel-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function UserTable({
  users,
  previewMode,
  currentUserId,
  onEdit,
  onSessions,
}) {
  if (!users.length) {
    return <Empty text="No matching users." />;
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
                {labelRole(user.role)}
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

              <td>
                {Number(
                  user.active_sessions || 0,
                )}
              </td>

              <td>
                {date(
                  user.last_session_activity ||
                    user.last_seen_at,
                )}
              </td>

              <td>{date(user.created_at)}</td>

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
                    {previewMode
                      ? "Read only"
                      : "Edit"}
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

function CreateForm({
  roles,
  statuses,
  previewMode,
  busy,
  onCreate,
}) {
  const [form, setForm] =
    useState(EMPTY_CREATE);
  const [error, setError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (previewMode || busy) return;

    setError("");

    try {
      await onCreate(form);
      setForm(EMPTY_CREATE);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create account.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="user-admin-readonly">
        Account creation is disabled in Super
        Admin preview mode.
      </div>
    );
  }

  return (
    <form
      className="user-admin-form"
      onSubmit={submit}
    >
      <div className="user-admin-form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={update("name")}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
          />
        </label>

        <label>
          Contact number
          <input
            value={form.contact_number}
            onChange={update(
              "contact_number",
            )}
          />
        </label>

        <label>
          Role
          <select
            value={form.role}
            onChange={update("role")}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {labelRole(role)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={form.account_status}
            onChange={update(
              "account_status",
            )}
          >
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Password
          <input
            type="password"
            minLength="6"
            value={form.password}
            onChange={update("password")}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            minLength="6"
            value={
              form.password_confirmation
            }
            onChange={update(
              "password_confirmation",
            )}
            required
          />
        </label>
      </div>

      {error && (
        <p
          className="user-admin-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="user-admin-primary"
        disabled={busy}
      >
        {busy
          ? "Creating..."
          : "Create Account"}
      </button>
    </form>
  );
}

function EditPanel({
  user,
  roles,
  statuses,
  currentUserId,
  busy,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    contact_number:
      user.contact_number || "",
    role: user.role,
    account_status:
      user.account_status,
  });
  const [error, setError] = useState("");

  const isSelf =
    Number(user.user_id) ===
    Number(currentUserId);

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onSave(user.user_id, form);
      onClose();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update account.",
      );
    }
  };

  return (
    <Section
      title={`Edit ${user.name}`}
      description={
        isSelf
          ? "You may edit your own contact details, but your own role and status are protected."
          : "Changing an account away from Active revokes its active sessions and trusted devices."
      }
    >
      <form
        className="user-admin-form"
        onSubmit={submit}
      >
        <div className="user-admin-form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={update("name")}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
            />
          </label>

          <label>
            Contact
            <input
              value={form.contact_number}
              onChange={update(
                "contact_number",
              )}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              disabled={isSelf}
              onChange={update("role")}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {labelRole(role)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.account_status}
              disabled={isSelf}
              onChange={update(
                "account_status",
              )}
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p
            className="user-admin-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="user-admin-actions">
          <button
            type="submit"
            className="user-admin-primary"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Section>
  );
}

function SessionsPanel({
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
    <Section
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

        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {!sessions.length ? (
        <Empty text="No tracked sessions for this account." />
      ) : (
        <div className="user-admin-session-grid">
          {sessions.map((session) => (
            <article
              key={session.session_id}
              className="user-admin-session-card"
            >
              <div>
                <strong>
                  {session.device_name}
                </strong>
                <span>
                  {session.browser_name}  - {" "}
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
                    {date(
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
                  onRevoke(
                    session.session_id,
                  )
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
    </Section>
  );
}

function AccessTable({ rows }) {
  if (!rows.length) {
    return (
      <Empty text="No recent access-management activity." />
    );
  }

  return (
    <div className="user-admin-table-wrap">
      <table className="user-admin-table">
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
              <td>{date(row.created_at)}</td>
              <td>
                {row.user_name || "System"}
                {row.user_role && (
                  <small>
                    {labelRole(
                      row.user_role,
                    )}
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

export default function UserAdminDashboardContent({
  activeModule,
  previewMode,
  theme = "light",
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] =
    useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingUser, setEditingUser] =
    useState(null);
  const [sessionsUser, setSessionsUser] =
    useState(null);
  const [sessions, setSessions] =
    useState([]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const result =
        await loadUserAdminDashboard(
          previewMode,
        );
      setData(result);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load User Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode]);

  const run = async (
    action,
    fallback,
  ) => {
    if (previewMode || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await action();
      setNotice(
        result?.message || fallback,
      );
      await load();
      return result;
    } catch (requestError) {
      setError(
        requestError.message ||
          "User administration action failed.",
      );
      throw requestError;
    } finally {
      setBusy(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const needle =
      search.trim().toLowerCase();

    return (data?.users || []).filter(
      (user) => {
        const roleMatch =
          roleFilter === "all" ||
          user.role === roleFilter;

        const statusMatch =
          statusFilter === "all" ||
          user.account_status ===
            statusFilter;

        const searchMatch =
          !needle ||
          [
            user.user_id,
            user.name,
            user.email,
            user.contact_number,
            user.role,
          ].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(needle),
          );

        return (
          roleMatch &&
          statusMatch &&
          searchMatch
        );
      },
    );
  }, [
    data?.users,
    roleFilter,
    search,
    statusFilter,
  ]);

  const openSessions = async (user) => {
    setSessionsUser(user);
    setSessions([]);
    setError("");

    try {
      const result =
        await loadManagedUserSessions(
          user.user_id,
          previewMode,
        );

      setSessions(
        result.sessions || [],
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load sessions.",
      );
    }
  };

  const refreshSessions = async () => {
    if (sessionsUser) {
      await openSessions(sessionsUser);
    }
  };

  const handleCreate = (form) =>
    run(
      () => createManagedUser(form),
      "Account created.",
    );

  const handleUpdate = (
    userId,
    form,
  ) =>
    run(
      () =>
        updateManagedUser(
          userId,
          form,
        ),
      "Account updated.",
    );

  const handleRevoke = async (
    sessionId,
  ) => {
    if (!sessionsUser) return;

    await run(
      () =>
        revokeManagedUserSession(
          sessionsUser.user_id,
          sessionId,
        ),
      "Session revoked.",
    );

    await refreshSessions();
  };

  const handleRevokeAll = async () => {
    if (!sessionsUser) return;

    if (
      !window.confirm(
        `Revoke available active sessions for ${sessionsUser.name}?`,
      )
    ) {
      return;
    }

    await run(
      () =>
        revokeAllManagedUserSessions(
          sessionsUser.user_id,
        ),
      "Sessions revoked.",
    );

    await refreshSessions();
  };

  if (loading) {
    return (
      <AppLoadingScreen
        label="Loading User Admin..."
        theme={theme}
      />
    );
  }

  if (!data) {
    return (
      <div className="user-admin-error">
        {error ||
          "User Admin data is unavailable."}
        <button
          type="button"
          onClick={load}
        >
          Retry
        </button>
      </div>
    );
  }

  const userTable = (
    <UserTable
      users={filteredUsers}
      previewMode={previewMode}
      currentUserId={
        data.current_user_id
      }
      onEdit={setEditingUser}
      onSessions={openSessions}
    />
  );

  const filters = (
    <div className="user-admin-filters">
      <input
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search ID, name, email, contact, or role"
      />

      <select
        value={roleFilter}
        onChange={(event) =>
          setRoleFilter(
            event.target.value,
          )
        }
      >
        <option value="all">
          All roles
        </option>
        {data.manageable_roles.map(
          (role) => (
            <option
              key={role}
              value={role}
            >
              {labelRole(role)}
            </option>
          ),
        )}
      </select>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(
            event.target.value,
          )
        }
      >
        <option value="all">
          All statuses
        </option>
        {data.account_statuses.map(
          (status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ),
        )}
      </select>
    </div>
  );

  return (
    <div className="user-admin-content">
      {notice && (
        <div
          className="user-admin-notice"
          role="status"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          className="user-admin-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {(activeModule === "Overview" ||
        activeModule ===
          "User Overview") && (
        <>
          <Metrics
            metrics={data.metrics}
          />

          <Section
            title="Account Overview"
            description="Super Admin accounts are intentionally excluded from User Admin control."
          >
            {filters}
            {userTable}
          </Section>
        </>
      )}

      {activeModule ===
        "User Accounts" && (
        <>
          <Section
            title="Create Account"
            description="User Admin can create staff and customer accounts, but never Super Admin."
          >
            <CreateForm
              roles={
                data.manageable_roles
              }
              statuses={
                data.account_statuses
              }
              previewMode={
                previewMode
              }
              busy={busy}
              onCreate={handleCreate}
            />
          </Section>

          <Section
            title="User Accounts"
            description="Search and inspect all non-Super-Admin accounts."
          >
            {filters}
            {userTable}
          </Section>
        </>
      )}

      {activeModule ===
        "Roles & Status" && (
        <Section
          title="Roles & Account Status"
          description="Editing your own role/status is blocked. Disabling another account revokes active sessions."
        >
          {filters}
          {userTable}
        </Section>
      )}

      {activeModule ===
        "Sessions" && (
        <Section
          title="Session Access"
          description="Choose an account and review its tracked sessions."
        >
          {filters}
          {userTable}
        </Section>
      )}

      {activeModule ===
        "Access Activity" && (
        <Section
          title="Access Activity"
          description="Recent account/session/login-related audit events."
        >
          <AccessTable
            rows={
              data.recent_access || []
            }
          />
        </Section>
      )}

      {!previewMode && editingUser && (
        <EditPanel
          key={editingUser.user_id}
          user={editingUser}
          roles={
            data.manageable_roles
          }
          statuses={
            data.account_statuses
          }
          currentUserId={
            data.current_user_id
          }
          busy={busy}
          onClose={() =>
            setEditingUser(null)
          }
          onSave={handleUpdate}
        />
      )}

      {sessionsUser && (
        <SessionsPanel
          user={sessionsUser}
          sessions={sessions}
          previewMode={previewMode}
          busy={busy}
          onClose={() => {
            setSessionsUser(null);
            setSessions([]);
          }}
          onRefresh={
            refreshSessions
          }
          onRevoke={handleRevoke}
          onRevokeAll={
            handleRevokeAll
          }
        />
      )}
    </div>
  );
}