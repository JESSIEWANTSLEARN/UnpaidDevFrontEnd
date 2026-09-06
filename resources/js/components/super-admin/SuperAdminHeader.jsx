import React from "react";
import Icon from "./Icon.jsx";

export default function SuperAdminHeader({
  activeMenu, setSidebarOpen, openModal, refresh, unreadNotifications, theme, setTheme,
  currentUser, userInitials, dropdownOpen, setDropdownOpen, dropdownRef, handleLogout,
}) {
  return <header className="ops-header"><div className="ops-header-inner">
    <div className="ops-header-left">
      <button type="button" className="hamburger-btn" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
        <Icon name="menu" size={19} />
      </button>
      <div><span className="ops-header-eyebrow">Super Admin</span><span className="ops-header-title">{activeMenu}</span></div>
    </div>

    <div className="ops-header-actions">
      <button type="button" className="icon-btn" aria-label="Messages" onClick={() => openModal("messages")}><Icon name="message" size={17} /></button>
      <button type="button" className="icon-btn" aria-label="Refresh dashboard data" onClick={refresh}><Icon name="refresh" size={17} /></button>
      <button type="button" className="icon-btn" aria-label="Notifications" onClick={() => openModal("notifications")}>
        <Icon name="bell" size={17} />
        {unreadNotifications > 0 && <span className="icon-btn-badge">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
      </button>
      <button type="button" className="theme-toggle" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")} aria-label="Toggle theme">
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
      </button>

      <div className="user-pill-wrap" ref={dropdownRef}>
        <button type="button" className="user-pill" onClick={() => setDropdownOpen((v) => !v)} aria-haspopup="true" aria-expanded={dropdownOpen}>
          <span className="user-pill-avatar">{userInitials}</span><span className="user-pill-name">{currentUser?.name || "Super Admin"}</span><Icon name="chevron-down" size={14} />
        </button>
        <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
          <div className="dropdown-user">
            <div className="dropdown-avatar">{userInitials}</div>
            <div className="dropdown-user-info"><p>{currentUser?.name || "Super Admin"}</p><span>{currentUser?.email || ""}</span></div>
          </div>
          <p className="dropdown-eyebrow">Account Options</p>
          <button type="button" className="dropdown-link" onClick={() => openModal("profile")}><Icon name="user" size={15} />View Profile</button>
          <button type="button" className="dropdown-link" onClick={() => openModal("settings")}><Icon name="settings" size={15} />Account Settings</button>
          <button type="button" className="dropdown-link" onClick={() => openModal("security")}><Icon name="lock" size={15} />Security & Password</button>
          <div className="dropdown-divider" />
          <button type="button" className="dropdown-link danger" onClick={handleLogout}><Icon name="logout" size={15} />Sign Out</button>
        </div>
      </div>
    </div>
  </div></header>;
}
