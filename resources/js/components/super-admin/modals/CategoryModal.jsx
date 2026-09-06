import React from "react";

export default function CategoryModal({
  busy,
  error,
  categoryForm,
  setCategoryForm,
  onAddCategory,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!busy) onAddCategory();
  };

  return (
    <form className="admin-modal-body" onSubmit={handleSubmit}>
      <p className="ops-subtext">
        Create a category that can be selected when adding products.
      </p>

      <div className="admin-form-row">
        <label>Category Name</label>
        <input
          type="text"
          value={categoryForm?.name || ""}
          maxLength={100}
          required
          onChange={(event) =>
            setCategoryForm((form) => ({
              ...form,
              name: event.target.value,
            }))
          }
        />
      </div>

      <div className="admin-form-row">
        <label>Description (optional)</label>
        <textarea
          value={categoryForm?.description || ""}
          rows={3}
          maxLength={255}
          onChange={(event) =>
            setCategoryForm((form) => ({
              ...form,
              description: event.target.value,
            }))
          }
        />
      </div>

      {error && <p className="admin-form-error">{error}</p>}

      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? "Adding..." : "+ Add Category"}
      </button>
    </form>
  );
}