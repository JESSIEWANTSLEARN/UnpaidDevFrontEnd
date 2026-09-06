import React from "react";
import { EmptyState } from "../common/AdminCommon.jsx";
import { formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { ErrorMessage } from "./FormHelpers.jsx";

export default function BackupModal({
  busy,
  error,
  data,
  onCreateBackup,
  onDownloadBackup,
  onRestoreBackup,
}) {
  const backups = data?.backups || [];

  return (
    <div className="admin-modal-body">
      <div className="backup-toolbar">
        <div>
          <h3>Database Backups</h3>
          <p className="ops-subtext">Backups are stored privately under Laravel storage and include the current WBO system tables.</p>
        </div>
        <button className="btn-primary" type="button" disabled={busy} onClick={onCreateBackup}>{busy ? "Working..." : "Create Backup"}</button>
      </div>
      <ErrorMessage error={error} />
      <div className="backup-warning">Restore replaces the current backed-up database records. The system automatically creates a safety backup immediately before restoring.</div>

      {backups.length === 0 ? (
        <EmptyState text="No backups have been created yet." />
      ) : (
        <div className="backup-list">
          {backups.map((backup) => (
            <div className="backup-row" key={backup.filename}>
              <div className="backup-copy">
                <strong>{backup.filename}</strong>
                <span>{formatDate(backup.modified_at)} · {backup.size_label}</span>
              </div>
              <div className="backup-actions">
                <button className="btn-ghost btn-small" type="button" disabled={busy} onClick={() => onDownloadBackup(backup.filename)}>Download</button>
                <button className="btn-danger btn-small" type="button" disabled={busy} onClick={() => onRestoreBackup(backup.filename)}>Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
