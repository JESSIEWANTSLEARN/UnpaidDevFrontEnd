import React from "react";
import Icon from "../Icon.jsx";
import { number } from "../../../utils/super-admin/superAdminUtils.js";

function Settings({ data, openModal }) {
  return (
    <>
      <div className="section-head">
        <h2>System Settings</h2>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <span className="stat-icon accent-blue"><Icon name="building" size={17} /></span>
          <div>
            <h3>Company Information</h3>
            <p>Manage company name, logo, contact information, and address.</p>
          </div>
          <button className="btn-ghost" type="button" onClick={() => openModal("companyInfo")}>Configure</button>
        </div>

        <div className="setting-card">
          <span className="stat-icon accent-purple"><Icon name="lock" size={17} /></span>
          <div>
            <h3>Security</h3>
            <p>Manage password policies and account security.</p>
          </div>
          <button className="btn-ghost" type="button" onClick={() => openModal("security")}>Configure</button>
        </div>

        <div className="setting-card">
          <span className="stat-icon accent-amber"><Icon name="bell" size={17} /></span>
          <div>
            <h3>Notifications</h3>
            <p>{number(data.metrics?.unread_notifications)} unread notification(s) currently recorded.</p>
          </div>
          <button className="btn-ghost" type="button" onClick={() => openModal("notifications")}>Configure</button>
        </div>

        <div className="setting-card">
          <span className="stat-icon accent-mint"><Icon name="save" size={17} /></span>
          <div>
            <h3>Backup & Restore</h3>
            <p>Create backups and restore system data.</p>
          </div>
          <button className="btn-ghost" type="button" onClick={() => openModal("backupRestore")}>Configure</button>
        </div>
      </div>
    </>
  );
}


export default Settings;
