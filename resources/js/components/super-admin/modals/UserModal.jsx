import React from "react";
import { INTERNAL_ROLES } from "../../../config/super-admin/superAdminConfig.js";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

const STATUS_OPTIONS = ["active", "pending_verification", "disabled"];

export default function UserModal(props) {
  return props.mode === "edit" ? <EditUserForm {...props} /> : <AddUserForm {...props} />;
}

function RoleAndStatus({ form, setForm }) {
  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }));
  return (
    <>
      <div className="admin-form-row">
        <label>Role</label>
        <select value={form.role} onChange={update("role")}>{INTERNAL_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
      </div>
      <div className="admin-form-row">
        <label>Account Status</label>
        <select value={form.account_status} onChange={update("account_status")}>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}</select>
      </div>
    </>
  );
}

function AddUserForm({ busy, error, userForm, setUserForm, onAddUser }) {
  const update = (field) => (event) => setUserForm((form) => ({ ...form, [field]: event.target.value }));
  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onAddUser)}>
      <div className="admin-form-row"><label>Name</label><input value={userForm.name} maxLength={100} required onChange={update("name")} /></div>
      <div className="admin-form-row"><label>Email</label><input type="email" value={userForm.email} maxLength={100} required onChange={update("email")} /></div>
      <div className="admin-form-row"><label>Contact Number</label><input value={userForm.contact_number} maxLength={20} onChange={update("contact_number")} /></div>
      <RoleAndStatus form={userForm} setForm={setUserForm} />
      <div className="admin-form-row"><label>Password</label><input type="password" minLength={6} value={userForm.password} required onChange={update("password")} /></div>
      <div className="admin-form-row"><label>Confirm Password</label><input type="password" minLength={6} value={userForm.password_confirmation} required onChange={update("password_confirmation")} /></div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Adding...">+ Add User</SubmitButton>
    </form>
  );
}

function EditUserForm({ busy, error, currentUser, editUserForm, setEditUserForm, onUpdateUser }) {
  const update = (field) => (event) => setEditUserForm((form) => ({ ...form, [field]: event.target.value }));
  const editingSelf = Number(editUserForm.user_id) === Number(currentUser?.user_id);

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onUpdateUser)}>
      <div className="admin-form-row"><label>Name</label><input value={editUserForm.name} maxLength={100} required onChange={update("name")} /></div>
      <div className="admin-form-row"><label>Email</label><input type="email" value={editUserForm.email} maxLength={100} required onChange={update("email")} /></div>
      <div className="admin-form-row"><label>Contact Number</label><input value={editUserForm.contact_number} maxLength={20} onChange={update("contact_number")} /></div>
      <RoleAndStatus form={editUserForm} setForm={setEditUserForm} />
      {editingSelf && <p className="ops-subtext">Your own Super Admin account must remain active and keep the super_admin role.</p>}
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Saving...">Save User Changes</SubmitButton>
    </form>
  );
}
