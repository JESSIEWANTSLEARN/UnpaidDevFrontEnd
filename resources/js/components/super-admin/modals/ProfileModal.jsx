import React from "react";

export default function ProfileModal({ currentUser, userInitials }) {
  return (
    <div className="admin-modal-body">
      <div className="admin-profile">
        <div className="admin-profile-avatar">{userInitials}</div>
        <div>
          <h3>{currentUser?.name || "Super Admin"}</h3>
          <p>{currentUser?.email || ""}</p>
        </div>
      </div>

      <div className="admin-info-grid">
        <div><span>Role</span><strong>{currentUser?.role || "super_admin"}</strong></div>
        <div><span>Status</span><strong>{currentUser?.account_status || "—"}</strong></div>
        <div><span>Contact</span><strong>{currentUser?.contact_number || "—"}</strong></div>
        <div><span>Email Verified</span><strong>{currentUser?.email_verified_at ? "Yes" : "No"}</strong></div>
      </div>
    </div>
  );
}
