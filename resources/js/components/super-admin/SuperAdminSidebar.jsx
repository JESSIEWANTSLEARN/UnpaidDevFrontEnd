import React from "react";
import Icon from "./Icon.jsx";
import { navSections } from "../../config/super-admin/superAdminConfig.js";

export default function SuperAdminSidebar({
    activeMenu,
    setActiveMenu,
    setSidebarOpen,
    brandName,
    brandLogo,
}) {
    return (
        <>
            <aside className="ops-sidebar">
                <div className="ops-sidebar-brand">
                    <img
                        src={brandLogo}
                        alt={`${brandName} Logo`}
                        width="45"
                        height="45"
                    />
                    <div>
                        <p className="ops-sidebar-title">{brandName}</p>
                        <span className="ops-sidebar-subtitle">
                            SUPER ADMIN PORTAL
                        </span>
                    </div>
                </div>
                <nav className="ops-nav">
                    {navSections.map((section) => (
                        <div className="ops-nav-section" key={section.label}>
                            <div className="ops-nav-label">{section.label}</div>
                            {section.items.map((item) => (
                                <button
                                    type="button"
                                    key={item.name}
                                    className={`ops-nav-link ${!item.href && activeMenu === item.name ? "active" : ""}`}
                                    onClick={() => {
                                        setSidebarOpen(false);

                                        if (item.href) {
                                            window.location.href = item.href;
                                            return;
                                        }

                                        setActiveMenu(item.name);
                                    }}
                                >
                                    <span className="ops-nav-icon">
                                        <Icon name={item.icon} size={17} />
                                    </span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
            <div
                className="ops-sidebar-scrim"
                onClick={() => setSidebarOpen(false)}
            />
        </>
    );
}
