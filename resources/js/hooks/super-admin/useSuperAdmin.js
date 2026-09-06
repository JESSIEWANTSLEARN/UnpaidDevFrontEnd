import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { INITIAL_FORMS } from "../../config/super-admin/superAdminConfig.js";
import { apiRequest, download, logoutRequest, toFormData } from "../../services/super-admin/superAdminApi.js";
import { initials, Logo } from "../../utils/super-admin/superAdminUtils.js";

export default function useSuperAdmin() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [activeModal, setActiveModal] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [userSessionPagination, setUserSessionPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const setForm = (key, update) => setForms((all) => ({
    ...all,
    [key]: typeof update === "function" ? update(all[key]) : update,
  }));
  const resetForm = (key) => setForm(key, { ...INITIAL_FORMS[key] });
  const refresh = () => setReloadToken((v) => v + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    apiRequest("/api/super-admin/dashboard-data")
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => {
        if (err.status === 401) return navigate("/login", { replace: true });
        if (!cancelled) setError(err.message || "Unable to load Super Admin data.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate, reloadToken]);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const outside = (event) => dropdownRef.current && !dropdownRef.current.contains(event.target) && setDropdownOpen(false);
    const escape = (event) => event.key === "Escape" && setDropdownOpen(false);
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [dropdownOpen]);

  const currentUser = data?.current_user;
  const userInitials = initials(currentUser?.name);
  const unreadNotifications = Number(data?.metrics?.unread_notifications || 0);
  const brandName = data?.settings?.company_name || "Walang Brownout";
  const brandLogo = data?.settings?.company_logo_url || Logo;

  useEffect(() => {
    if (!currentUser) return;
    setForm("profile", { name: currentUser.name || "", email: currentUser.email || "", contact_number: currentUser.contact_number || "" });
  }, [currentUser?.user_id, currentUser?.name, currentUser?.email, currentUser?.contact_number]);

  useEffect(() => {
    const s = data?.settings; if (!s) return;
    setForm("company", (form) => ({ ...form, company_name: s.company_name || "Walang Brownout", company_email: s.company_email || "", company_contact: s.company_contact || "", company_address: s.company_address || "", logo: null }));
  }, [data?.settings?.company_name, data?.settings?.company_email, data?.settings?.company_contact, data?.settings?.company_address]);

  const openModal = (type) => { setActiveModal(type); setDropdownOpen(false); setModalError(""); };
  const closeModal = () => {
    if (!modalBusy) {
      setActiveModal(null);
      setModalError("");
      setSelectedUser(null);
      setUserSessions([]);
    }
  };

  const runModalAction = async (action, keepOpen = false) => {
    setModalBusy(true); setModalError("");
    try { await action(); if (!keepOpen) setActiveModal(null); refresh(); }
    catch (err) {
      if (err.status === 401) navigate("/login", { replace: true });
      setModalError(err.message || "The request could not be completed.");
    } finally { setModalBusy(false); }
  };

  const handleProfileSave = () => runModalAction(() => apiRequest("/api/super-admin/profile", { method: "PUT", body: forms.profile }));
  const handlePasswordUpdate = () => runModalAction(async () => { await apiRequest("/api/super-admin/password", { method: "PUT", body: forms.password }); resetForm("password"); });
  const handleAddProduct = () => runModalAction(async () => {
    const body = toFormData(forms.product, ["is_seasonal", "is_visible", "is_featured"]);
    await apiRequest("/api/super-admin/products", { method: "POST", body, formData: true }); resetForm("product");
  });
  const handleAddCategory = () => runModalAction(async () => {
    await apiRequest("/api/super-admin/categories", { method: "POST", body: forms.category });
    resetForm("category");
  });
  const handleStockIn = () => runModalAction(async () => { await apiRequest("/api/super-admin/stock-in", { method: "POST", body: forms.stock }); resetForm("stock"); });
  const handleAddUser = () => runModalAction(async () => { await apiRequest("/api/super-admin/users", { method: "POST", body: forms.user }); resetForm("user"); });
  const handleAddSupplier = () => runModalAction(async () => { await apiRequest("/api/super-admin/suppliers", { method: "POST", body: forms.supplier }); resetForm("supplier"); });
  const handleAddPurchaseOrder = () => runModalAction(async () => { await apiRequest("/api/super-admin/purchase-orders", { method: "POST", body: forms.purchaseOrder }); resetForm("purchaseOrder"); });
  const handleCompanySave = () => runModalAction(async () => {
    const body = toFormData(forms.company); await apiRequest("/api/super-admin/company-information", { method: "POST", body, formData: true });
    setForm("company", (form) => ({ ...form, logo: null }));
  });

  const openUserEditor = (user) => {
    setSelectedUser(user);
    setForm("editUser", { user_id: user.user_id, name: user.name || "", email: user.email || "", contact_number: user.contact_number || "", role: user.role || "System_User", account_status: user.account_status || "active" });
    setModalError(""); setActiveModal("editUser");
  };

  const handleUpdateUser = () => runModalAction(() =>
    apiRequest(`/api/super-admin/users/${forms.editUser.user_id}`, {
      method: "PUT",
      body: forms.editUser,
    })
  );

  const loadUserSessions = async (userId, page = 1) => {
    setSessionsLoading(true);
    setModalError("");

    try {
      const result = await apiRequest(
        `/api/super-admin/users/${userId}/sessions?page=${encodeURIComponent(page)}&per_page=10`,
      );

      setUserSessions(result.sessions || []);
      setUserSessionPagination(
        result.pagination || {
          page: 1,
          per_page: 10,
          total: (result.sessions || []).length,
          total_pages: 1,
        },
      );
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", { replace: true });
      }

      setModalError(
        err.message || "Unable to load user sessions.",
      );
      setUserSessions([]);
      setUserSessionPagination({
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
      });
    } finally {
      setSessionsLoading(false);
    }
  };

  const openUserSessions = (user) => {
    setSelectedUser(user);
    setUserSessions([]);
    setModalError("");
    setActiveModal("userSessions");
    loadUserSessions(user.user_id);
  };

  const handleRevokeUserSession = async (sessionId) => {
    if (!selectedUser) return;
    setModalBusy(true);
    setModalError("");
    try {
      await apiRequest(
        `/api/super-admin/users/${selectedUser.user_id}/sessions/${encodeURIComponent(sessionId)}`,
        { method: "DELETE" }
      );
      await loadUserSessions(selectedUser.user_id, userSessionPagination.page);
      refresh();
    } catch (err) {
      if (err.status === 401) navigate("/login", { replace: true });
      setModalError(err.message || "Unable to revoke the session.");
    } finally {
      setModalBusy(false);
    }
  };

  const handleRevokeAllUserSessions = async () => {
    if (!selectedUser) return;

    const isSelf = Number(selectedUser.user_id) === Number(currentUser?.user_id);
    const label = isSelf ? "all other sessions" : "all active sessions";

    if (!window.confirm(`Revoke ${label} for ${selectedUser.name}?`)) return;

    setModalBusy(true);
    setModalError("");
    try {
      await apiRequest(`/api/super-admin/users/${selectedUser.user_id}/sessions`, {
        method: "DELETE",
      });
      await loadUserSessions(selectedUser.user_id, userSessionPagination.page);
      refresh();
    } catch (err) {
      if (err.status === 401) navigate("/login", { replace: true });
      setModalError(err.message || "Unable to revoke sessions.");
    } finally {
      setModalBusy(false);
    }
  };

  const openUserDelete = (user) => {
    setSelectedUser(user);
    setForm("deleteUser", { confirmation: "" });
    setModalError("");
    setActiveModal("deleteUser");
  };

  const handleDeleteUser = () => runModalAction(async () => {
    if (!selectedUser) return;
    await apiRequest(`/api/super-admin/users/${selectedUser.user_id}`, {
      method: "DELETE",
      body: forms.deleteUser,
    });
    setSelectedUser(null);
    resetForm("deleteUser");
  });

  const handleUserSessionPageChange = (page) => {
    if (!selectedUser || sessionsLoading) return;
    loadUserSessions(selectedUser.user_id, page);
  };
  const handleNotificationStatus = (id, status) => runModalAction(() => apiRequest(`/api/super-admin/notifications/${id}`, { method: "PUT", body: { status } }), true);
  const handleCreateBackup = () => runModalAction(() => apiRequest("/api/super-admin/backups", { method: "POST" }), true);
  const handleRestoreBackup = (filename) => {
    if (!window.confirm(`Restore ${filename}? This replaces the current WalangBrownout data with the selected backup. A safety backup will be created first.`)) return;
    runModalAction(() => apiRequest(`/api/super-admin/backups/${encodeURIComponent(filename)}/restore`, { method: "POST", body: { confirmation: "RESTORE" } }));
  };
  const handleDownloadBackup = (filename) => download(`/api/super-admin/backups/${encodeURIComponent(filename)}/download`);
  const handleExportReport = (type = "complete") => download(`/api/super-admin/export-report?type=${encodeURIComponent(type)}`);
  const handleLogout = async () => {
    setDropdownOpen(false);
    try { await logoutRequest(); window.location.href = "/login"; }
    catch (err) { setError(err.message || "Logout failed."); }
  };

  const setters = {
    setProfileForm: (v) => setForm("profile", v), setPasswordForm: (v) => setForm("password", v),
    setProductForm: (v) => setForm("product", v), setCategoryForm: (v) => setForm("category", v), setStockForm: (v) => setForm("stock", v),
    setUserForm: (v) => setForm("user", v), setSupplierForm: (v) => setForm("supplier", v),
    setPurchaseOrderForm: (v) => setForm("purchaseOrder", v), setCompanyForm: (v) => setForm("company", v),
    setEditUserForm: (v) => setForm("editUser", v), setDeleteUserForm: (v) => setForm("deleteUser", v),
  };

  return {
    activeMenu, setActiveMenu, sidebarOpen, setSidebarOpen, dropdownOpen, setDropdownOpen, theme, setTheme,
    activeModal, data, loading, error, refresh, dropdownRef, modalBusy, modalError, currentUser, userInitials,
    unreadNotifications, brandName, brandLogo, openModal, closeModal, openUserEditor, openUserSessions, openUserDelete,
    handleExportReport, handleLogout,
    modalProps: {
      type: activeModal, onClose: closeModal, busy: modalBusy, error: modalError, currentUser, userInitials, data,
      profileForm: forms.profile, passwordForm: forms.password, productForm: forms.product, categoryForm: forms.category, stockForm: forms.stock,
      userForm: forms.user, supplierForm: forms.supplier, purchaseOrderForm: forms.purchaseOrder,
      companyForm: forms.company, editUserForm: forms.editUser, deleteUserForm: forms.deleteUser,
      selectedUser, userSessions, sessionsLoading, userSessionPagination,
      onUserSessionPageChange: handleUserSessionPageChange, ...setters,
      onProfileSave: handleProfileSave, onPasswordUpdate: handlePasswordUpdate, onAddProduct: handleAddProduct, onAddCategory: handleAddCategory,
      onStockIn: handleStockIn, onAddUser: handleAddUser, onAddSupplier: handleAddSupplier,
      onAddPurchaseOrder: handleAddPurchaseOrder, onCompanySave: handleCompanySave, onUpdateUser: handleUpdateUser,
      onRevokeUserSession: handleRevokeUserSession, onRevokeAllUserSessions: handleRevokeAllUserSessions,
      onDeleteUser: handleDeleteUser,
      onNotificationStatus: handleNotificationStatus, onCreateBackup: handleCreateBackup,
      onRestoreBackup: handleRestoreBackup, onDownloadBackup: handleDownloadBackup,
    },
  };
}