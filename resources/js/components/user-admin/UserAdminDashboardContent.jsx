import AppLoadingScreen from "../shared/AppLoadingScreen.jsx";
import useUserAdminDashboard from "../../hooks/user-admin/useUserAdminDashboard.js";
import UserAdminFilters from "./filters/UserAdminFilters.jsx";
import CreateUserForm from "./forms/CreateUserForm.jsx";
import EditUserPanel from "./forms/EditUserPanel.jsx";
import UserSessionsPanel from "./sessions/UserSessionsPanel.jsx";
import UserAdminAccessTable from "./tables/UserAdminAccessTable.jsx";
import UserAdminUserTable from "./tables/UserAdminUserTable.jsx";
import {
  UserAdminMetrics,
  UserAdminSection,
} from "./common/UserAdminPrimitives.jsx";
import "../../../css/user-admin/user-admin.css";

// User Admin dashboard composition and module routing.

export default function UserAdminDashboardContent({
  activeModule,
  previewMode,
  theme = "light",
}) {
  const controller = useUserAdminDashboard({
    previewMode,
  });

  const {
    data,
    loading,
    busy,
    error,
    notice,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    editingUser,
    setEditingUser,
    sessionsUser,
    sessions,
    filteredUsers,
    load,
    openSessions,
    refreshSessions,
    closeSessions,
    handleCreate,
    handleUpdate,
    handleRevoke,
    handleRevokeAll,
  } = controller;

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
        {error || "User Admin data is unavailable."}
        <button type="button" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const userTable = (
    <UserAdminUserTable
      users={filteredUsers}
      previewMode={previewMode}
      currentUserId={data.current_user_id}
      onEdit={setEditingUser}
      onSessions={openSessions}
    />
  );

  const filters = (
    <UserAdminFilters
      search={search}
      setSearch={setSearch}
      roleFilter={roleFilter}
      setRoleFilter={setRoleFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      roles={data.manageable_roles}
      statuses={data.account_statuses}
    />
  );

  return (
    <div className="user-admin-content">
      {notice && (
        <div className="user-admin-notice" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="user-admin-error" role="alert">
          {error}
        </div>
      )}

      {(activeModule === "Overview" ||
        activeModule === "User Overview") && (
        <>
          <UserAdminMetrics metrics={data.metrics} />

          <UserAdminSection
            title="Account Overview"
            description="Super Admin accounts are intentionally excluded from User Admin control."
          >
            {filters}
            {userTable}
          </UserAdminSection>
        </>
      )}

      {activeModule === "User Accounts" && (
        <>
          <UserAdminSection
            title="Create Account"
            description="User Admin can create staff and customer accounts, but never Super Admin."
          >
            <CreateUserForm
              roles={data.manageable_roles}
              statuses={data.account_statuses}
              previewMode={previewMode}
              busy={busy}
              onCreate={handleCreate}
            />
          </UserAdminSection>

          <UserAdminSection
            title="User Accounts"
            description="Search and inspect all non-Super-Admin accounts."
          >
            {filters}
            {userTable}
          </UserAdminSection>
        </>
      )}

      {activeModule === "Roles & Status" && (
        <UserAdminSection
          title="Roles & Account Status"
          description="Editing your own role/status is blocked. Disabling another account revokes active sessions."
        >
          {filters}
          {userTable}
        </UserAdminSection>
      )}

      {activeModule === "Sessions" && (
        <UserAdminSection
          title="Session Access"
          description="Choose an account and review its tracked sessions."
        >
          {filters}
          {userTable}
        </UserAdminSection>
      )}

      {activeModule === "Access Activity" && (
        <UserAdminSection
          title="Access Activity"
          description="Recent account/session/login-related audit events."
        >
          <UserAdminAccessTable
            rows={data.recent_access || []}
          />
        </UserAdminSection>
      )}

      {!previewMode && editingUser && (
        <EditUserPanel
          key={editingUser.user_id}
          user={editingUser}
          roles={data.manageable_roles}
          statuses={data.account_statuses}
          currentUserId={data.current_user_id}
          busy={busy}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdate}
        />
      )}

      {sessionsUser && (
        <UserSessionsPanel
          user={sessionsUser}
          sessions={sessions}
          previewMode={previewMode}
          busy={busy}
          onClose={closeSessions}
          onRefresh={refreshSessions}
          onRevoke={handleRevoke}
          onRevokeAll={handleRevokeAll}
        />
      )}
    </div>
  );
}
