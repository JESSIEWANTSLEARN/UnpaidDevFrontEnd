import React from "react";
import {
  AccountSettingsModal,
  BackupModal,
  CompanyInfoModal,
  CategoryModal,
  DeleteUserModal,
  InfoModal,
  NotificationsModal,
  ProductModal,
  ProfileModal,
  PurchaseOrderModal,
  SecurityModal,
  StockInModal,
  SupplierModal,
  UserModal,
  UserSessionsModal,
} from "./modals/index.js";

const TITLES = {
  profile: "View Profile",
  settings: "Account Settings",
  security: "Security & Password",
  addProduct: "Add Product",
  stockIn: "Stock In",
  addUser: "Add User",
  editUser: "Edit User",
  userSessions: "Devices & Sessions",
  deleteUser: "Delete Account",
  addSupplier: "Add Supplier",
  addPurchaseOrder: "New Purchase Order",
  categoryInfo: "Add Category",
  messages: "Messages",
  notifications: "Notifications",
  companyInfo: "Company Information",
  backupRestore: "Backup & Restore",
};

function ModalContent(props) {
  switch (props.type) {
    case "profile":
      return <ProfileModal currentUser={props.currentUser} userInitials={props.userInitials} />;
    case "settings":
      return <AccountSettingsModal {...props} />;
    case "security":
      return <SecurityModal {...props} />;
    case "companyInfo":
      return <CompanyInfoModal {...props} />;
    case "addProduct":
      return <ProductModal {...props} />;
    case "stockIn":
      return <StockInModal {...props} />;
    case "addUser":
      return <UserModal mode="add" {...props} />;
    case "editUser":
      return <UserModal mode="edit" {...props} />;
    case "userSessions":
      return <UserSessionsModal {...props} />;
    case "deleteUser":
      return <DeleteUserModal {...props} />;
    case "addSupplier":
      return <SupplierModal {...props} />;
    case "addPurchaseOrder":
      return <PurchaseOrderModal {...props} />;
    case "notifications":
      return <NotificationsModal {...props} />;
    case "backupRestore":
      return <BackupModal {...props} />;
    case "categoryInfo":
      return <CategoryModal {...props} />;
    case "messages":
      return <InfoModal type={props.type} />;
    default:
      return null;
  }
}

export default function SuperAdminModal(props) {
  const { type, onClose, busy } = props;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className={`admin-modal ${type === "userSessions" ? "admin-modal-wide admin-modal-sessions" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <span className="admin-modal-eyebrow">Super Admin</span>
            <h2 id="admin-modal-title">{TITLES[type] || "Super Admin"}</h2>
          </div>
          <button
            className="admin-modal-close"
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
          >
            x
          </button>
        </div>

        <ModalContent {...props} />
      </div>
    </div>
  );
}