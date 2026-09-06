import React from "react";
import "../../../css/super-admin/super-admin.css";
import "../../../css/shared/app-loading-screen.css";
import useSuperAdmin from "../../hooks/super-admin/useSuperAdmin.js";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar.jsx";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader.jsx";
import SuperAdminModal from "../../components/super-admin/SuperAdminModal.jsx";
import SuperAdminPageContent from "../../components/super-admin/SuperAdminPageContent.jsx";

export default function SuperAdmin() {
  const admin = useSuperAdmin();
  React.useEffect(() => {
    localStorage.setItem("wbo-ui-theme", admin.theme);
  }, [admin.theme]);

  return (
    <div className={`ops-portal app-page-enter ${admin.sidebarOpen ? "sidebar-open" : ""}`} data-theme={admin.theme}>
      <SuperAdminSidebar
        activeMenu={admin.activeMenu}
        setActiveMenu={admin.setActiveMenu}
        setSidebarOpen={admin.setSidebarOpen}
        brandName={admin.brandName}
        brandLogo={admin.brandLogo}
      />

      <div className="ops-content">
        <SuperAdminHeader {...admin} />

        <main className="ops-main">
          <SuperAdminPageContent
            activeMenu={admin.activeMenu}
            loading={admin.loading}
            error={admin.error}
            onRetry={admin.refresh}
            data={admin.data}
            setActiveMenu={admin.setActiveMenu}
            openModal={admin.openModal}
            openUserEditor={admin.openUserEditor}
            openUserSessions={admin.openUserSessions}
            openUserDelete={admin.openUserDelete}
            handleExportReport={admin.handleExportReport}
          />
        </main>

        {admin.activeModal && <SuperAdminModal {...admin.modalProps} />}
      </div>
    </div>
  );
}