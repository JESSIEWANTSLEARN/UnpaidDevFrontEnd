import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createManagedUser,
  loadManagedUserSessions,
  loadUserAdminDashboard,
  revokeAllManagedUserSessions,
  revokeManagedUserSession,
  updateManagedUser,
} from "../../services/user-admin/userAdminApi.js";

export default function useUserAdminDashboard({
  previewMode,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingUser, setEditingUser] = useState(null);
  const [sessionsUser, setSessionsUser] =
    useState(null);
  const [sessions, setSessions] = useState([]);

  const load = async (userId = null) => {
    if (typeof userId !== "number") userId = null;
    setLoading(true);
    setError("");

    try {
      const result = await loadUserAdminDashboard(
        previewMode,
        userId,
      );
      setData((current) => {
        if (!current || !result.partial_users) return result;
        const incoming = result.users || [];
        const ids = new Set(incoming.map((user) => Number(user.user_id)));
        const users = [...current.users.filter((user) => !ids.has(Number(user.user_id))), ...incoming];
        users.sort((a, b) => a.name.localeCompare(b.name));
        return { ...current, ...result, users };
      });
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

  const run = async (action, fallback, affectedId = null) => {
    if (previewMode || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await action();
      setNotice(result?.message || fallback);
      await load(affectedId ?? result?.user_id ?? null);
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
    const needle = search.trim().toLowerCase();

    return (data?.users || []).filter((user) => {
      const roleMatch =
        roleFilter === "all" || user.role === roleFilter;

      const statusMatch =
        statusFilter === "all" ||
        user.account_status === statusFilter;

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

      return roleMatch && statusMatch && searchMatch;
    });
  }, [data?.users, roleFilter, search, statusFilter]);

  const openSessions = async (user) => {
    setSessionsUser(user);
    setSessions([]);
    setError("");

    try {
      const result = await loadManagedUserSessions(
        user.user_id,
        previewMode,
      );

      setSessions(result.sessions || []);
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

  const handleUpdate = (userId, form) =>
    run(
      () => updateManagedUser(userId, form),
      "Account updated.",
      userId,
    );

  const handleRevoke = async (sessionId) => {
    if (!sessionsUser) return;

    await run(
      () =>
        revokeManagedUserSession(
          sessionsUser.user_id,
          sessionId,
        ),
      "Session revoked.",
      sessionsUser.user_id,
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
      sessionsUser.user_id,
    );

    await refreshSessions();
  };

  const closeSessions = () => {
    setSessionsUser(null);
    setSessions([]);
  };

  return {
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
  };
}
