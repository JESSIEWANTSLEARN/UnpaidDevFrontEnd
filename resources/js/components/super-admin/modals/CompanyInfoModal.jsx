import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function CompanyInfoModal({
  busy,
  error,
  data,
  companyForm,
  setCompanyForm,
  onCompanySave,
}) {
  const ready = Boolean(data?.settings?.table_ready);
  const update = (field) => (event) =>
    setCompanyForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onCompanySave)}>
      {!ready && (
        <p className="admin-form-error">
          WBO_SystemSettings is not installed yet. Run the provided SQL file once before saving company information.
        </p>
      )}
      <div className="admin-form-row">
        <label>Company Name</label>
        <input type="text" value={companyForm.company_name} maxLength={150} required onChange={update("company_name")} />
      </div>
      <div className="admin-form-row">
        <label>Company Email</label>
        <input type="email" value={companyForm.company_email} maxLength={150} onChange={update("company_email")} />
      </div>
      <div className="admin-form-row">
        <label>Contact Number</label>
        <input type="text" value={companyForm.company_contact} maxLength={30} onChange={update("company_contact")} />
      </div>
      <div className="admin-form-row">
        <label>Address</label>
        <textarea value={companyForm.company_address} rows={3} maxLength={500} onChange={update("company_address")} />
      </div>
      <div className="admin-form-row">
        <label>Company Logo (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setCompanyForm((form) => ({ ...form, logo: event.target.files?.[0] || null }))}
        />
      </div>
      {data?.settings?.company_logo_url && (
        <div className="company-logo-preview">
          <img src={data.settings.company_logo_url} alt="Current company logo" />
          <span>Current logo</span>
        </div>
      )}
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Saving..." disabled={!ready}>Save Company Information</SubmitButton>
    </form>
  );
}
