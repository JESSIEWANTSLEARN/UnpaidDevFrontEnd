import React, { useState } from "react";
import { Choice, Workspace, WorkspaceTable } from "./WorkspacePrimitives.jsx";
import { list, accountReasons } from "./workspaceData.js";

export default function AccountReview({
  data,
  previewMode,
  onEdit,
  onSessions,
}) {
  const [condition, setCondition] = useState("All review conditions");
  const [search, setSearch] = useState("");
  const needle = search.trim().toLowerCase();
  const rows = list(data.users)
    .filter((u) => u.role !== "super_admin")
    .map((user) => ({ ...user, reasons: accountReasons(user) }))
    .filter(
      (user) =>
        user.reasons.length &&
        (condition === "All review conditions" ||
          user.reasons.includes(condition)) &&
        (!needle ||
          [user.name, user.email, user.role].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(needle),
          )),
    );
  return (
    <Workspace
      title="Account Review"
      description="Review accounts with unverified email, inactive accounts retaining tracked sessions, and accounts with multiple sessions."
      scope="These conditions prompt review; multiple sessions alone do not indicate misuse. Super Admin accounts are excluded. Session counts depend on the existing session-tracking data."
    >
      <div className="role-workspace-controls">
        <Choice
          label="Account review condition"
          value={condition}
          onChange={setCondition}
          options={[
            "All review conditions",
            "Unverified email",
            "Inactive with sessions",
            "Multiple sessions",
          ]}
        />
        <label className="role-workspace-choice">
          <span>Find account</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span role="status">{rows.length} accounts for review</span>
      </div>
      <WorkspaceTable
        headings={["Account", "Role", "Status", "Review reasons", "Actions"]}
        rows={rows.map((user) => ({
          key: user.user_id,
          cells: [
            <>
              <strong>{user.name}</strong>
              <br />
              {user.email}
            </>,
            user.role.replaceAll("_", " "),
            user.account_status,
            user.reasons.join(" · "),
            <div className="role-live-inline-actions">
              <button
                type="button"
                className="role-live-table-action"
                onClick={() => onSessions(user)}
              >
                Sessions
              </button>
              <button
                type="button"
                className="role-live-table-action"
                disabled={previewMode}
                onClick={() => {
                  if (!previewMode) onEdit(user);
                }}
              >
                {previewMode ? "Read only" : "Review account"}
              </button>
            </div>,
          ],
        }))}
      />
    </Workspace>
  );
}
