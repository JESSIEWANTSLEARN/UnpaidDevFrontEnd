import React from "react";

/** Team-member form used by Super Admin website-content management. */
export default function TeamEditor({
    member,
    onChange,
    onPhoto,
    photoFile,
    hidePhoto = false,
}) {
    return (
        <div className="wc-form-grid">
            <label>
                <span>Name</span>
                <input
                    value={member.name}
                    maxLength={150}
                    onChange={(event) => onChange("name", event.target.value)}
                />
            </label>

            <label>
                <span>Role</span>
                <input
                    value={member.role}
                    maxLength={150}
                    onChange={(event) => onChange("role", event.target.value)}
                />
            </label>

            <label className="wc-span-2">
                <span>Description</span>
                <textarea
                    rows={5}
                    maxLength={10000}
                    value={member.description || ""}
                    onChange={(event) =>
                        onChange("description", event.target.value)
                    }
                />
            </label>

            <label>
                <span>Display Order</span>
                <input
                    type="number"
                    value={member.sort_order}
                    onChange={(event) =>
                        onChange("sort_order", event.target.value)
                    }
                />
            </label>

            {!hidePhoto ? (
                <label>
                    <span>Profile Picture</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                            onPhoto?.(event.target.files?.[0] || null)
                        }
                    />
                    {photoFile ? (
                        <small>Selected: {photoFile.name}</small>
                    ) : null}
                </label>
            ) : null}

            <label className="wc-check">
                <input
                    type="checkbox"
                    checked={member.is_visible}
                    onChange={(event) =>
                        onChange("is_visible", event.target.checked)
                    }
                />
                Show this member publicly
            </label>
        </div>
    );
}
