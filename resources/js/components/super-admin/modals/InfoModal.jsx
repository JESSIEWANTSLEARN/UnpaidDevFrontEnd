import React from "react";
const TEXT = {
    categoryInfo: (
        <>
            Product categories are stored in <strong>WBO_Categories</strong> and
            linked to products through <strong>category_id</strong>.
        </>
    ),
    messages: (
        <>
            The Messages control is preserved. The current database has no
            messages table, so this page intentionally shows no invented message
            records.
        </>
    ),
};
export default function InfoModal({ type }) {
    return (
        <div className="admin-modal-body">
            <p className="ops-subtext">{TEXT[type]}</p>
        </div>
    );
}
