import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FaqEditor from "../../components/super-admin/website-content/FaqEditor.jsx";
import TeamEditor from "../../components/super-admin/website-content/TeamEditor.jsx";
import "../../../css/super-admin/website-content-admin.css";

const EMPTY_FAQ = {
    category: "General",
    question: "",
    answer: "",
    sort_order: 0,
    is_active: true,
};

const EMPTY_MEMBER = {
    name: "",
    role: "",
    description: "",
    sort_order: 0,
    is_visible: true,
};

function csrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

async function requestJson(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const token = csrfToken();

    if (token) {
        headers.set("X-CSRF-TOKEN", token);
    }

    const response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const firstValidation =
            payload?.errors &&
            Object.values(payload.errors).flat().find(Boolean);

        const error = new Error(
            firstValidation || payload?.message || "Request failed.",
        );

        error.status = response.status;
        throw error;
    }

    return payload;
}

function WebsiteContentAdmin() {
    const navigate = useNavigate();

    const [theme, setTheme] = useState(
        () => window.localStorage.getItem("wbo-content-theme") || "light",
    );

    const [tab, setTab] = useState("about");
    const [data, setData] = useState({
        about: {
            title: "",
            description: "",
            visible: true,
        },
        faqs: [],
        team: [],
    });

    const [about, setAbout] = useState(data.about);

    const [faqDraft, setFaqDraft] = useState(EMPTY_FAQ);

    const [memberDraft, setMemberDraft] = useState(EMPTY_MEMBER);

    const [loading, setLoading] = useState(true);

    const [savingKey, setSavingKey] = useState("");

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [photoFiles, setPhotoFiles] = useState({});

    const sortedFaqs = useMemo(
        () =>
            [...(data.faqs || [])].sort(
                (a, b) =>
                    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
                    Number(a.faq_id) - Number(b.faq_id),
            ),
        [data.faqs],
    );

    const sortedTeam = useMemo(
        () =>
            [...(data.team || [])].sort(
                (a, b) =>
                    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
                    Number(a.team_member_id) - Number(b.team_member_id),
            ),
        [data.team],
    );

    const syncData = (next) => {
        const payload = next?.data || next;

        if (!payload) return;

        setData(payload);

        setAbout({
            title: payload.about?.title || "",
            description: payload.about?.description || "",
            visible: payload.about?.visible !== false,
        });
    };

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const payload = await requestJson(
                "/api/super-admin/website-content",
            );

            syncData(payload);
        } catch (loadError) {
            if (loadError.status === 401 || loadError.status === 403) {
                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        window.localStorage.setItem("wbo-content-theme", theme);
    }, [theme]);

    const run = async (key, callback, successMessage) => {
        setSavingKey(key);
        setError("");
        setMessage("");

        try {
            const payload = await callback();

            syncData(payload);

            setMessage(payload?.message || successMessage);

            return true;
        } catch (saveError) {
            setError(saveError.message);
            return false;
        } finally {
            setSavingKey("");
        }
    };

    const updateFaqLocal = (faqId, field, value) => {
        setData((previous) => ({
            ...previous,
            faqs: previous.faqs.map((item) =>
                item.faq_id === faqId ? { ...item, [field]: value } : item,
            ),
        }));
    };

    const updateMemberLocal = (memberId, field, value) => {
        setData((previous) => ({
            ...previous,
            team: previous.team.map((item) =>
                item.team_member_id === memberId
                    ? { ...item, [field]: value }
                    : item,
            ),
        }));
    };

    const saveAbout = async () => {
        await run(
            "about",
            () =>
                requestJson("/api/super-admin/website-content/about", {
                    method: "PUT",
                    body: JSON.stringify({
                        ...about,
                        visible: Boolean(about.visible),
                    }),
                }),
            "About section saved.",
        );
    };

    const createFaq = async () => {
        const ok = await run(
            "new-faq",
            () =>
                requestJson("/api/super-admin/website-content/faqs", {
                    method: "POST",
                    body: JSON.stringify({
                        ...faqDraft,
                        sort_order: Number(faqDraft.sort_order || 0),
                        is_active: Boolean(faqDraft.is_active),
                    }),
                }),
            "FAQ created.",
        );

        if (ok) {
            setFaqDraft(EMPTY_FAQ);
        }
    };

    const saveFaq = async (faq) => {
        await run(
            `faq-${faq.faq_id}`,
            () =>
                requestJson(
                    `/api/super-admin/website-content/faqs/${faq.faq_id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            category: faq.category,
                            question: faq.question,
                            answer: faq.answer,
                            sort_order: Number(faq.sort_order || 0),
                            is_active: Boolean(faq.is_active),
                        }),
                    },
                ),
            "FAQ saved.",
        );
    };

    const deleteFaq = async (faq) => {
        if (!window.confirm(`Delete "${faq.question}"?`)) {
            return;
        }

        await run(
            `faq-delete-${faq.faq_id}`,
            () =>
                requestJson(
                    `/api/super-admin/website-content/faqs/${faq.faq_id}`,
                    { method: "DELETE" },
                ),
            "FAQ deleted.",
        );
    };

    const createMember = async () => {
        const form = new FormData();

        Object.entries(memberDraft).forEach(([key, value]) => {
            form.append(
                key,
                key === "is_visible"
                    ? value
                        ? "1"
                        : "0"
                    : String(value ?? ""),
            );
        });

        const file = photoFiles.new || null;

        if (file) {
            form.append("photo", file);
        }

        const ok = await run(
            "new-team",
            () =>
                requestJson("/api/super-admin/website-content/team", {
                    method: "POST",
                    body: form,
                }),
            "Team member created.",
        );

        if (ok) {
            setMemberDraft(EMPTY_MEMBER);
            setPhotoFiles((previous) => {
                const next = { ...previous };
                delete next.new;
                return next;
            });
        }
    };

    const saveMember = async (member) => {
        const form = new FormData();

        form.append("name", member.name || "");
        form.append("role", member.role || "");
        form.append("description", member.description || "");
        form.append("sort_order", String(member.sort_order || 0));
        form.append("is_visible", member.is_visible ? "1" : "0");

        const file = photoFiles[member.team_member_id];

        if (file) {
            form.append("photo", file);
        }

        const ok = await run(
            `team-${member.team_member_id}`,
            () =>
                requestJson(
                    `/api/super-admin/website-content/team/${member.team_member_id}`,
                    {
                        method: "POST",
                        body: form,
                    },
                ),
            "Team member saved.",
        );

        if (ok) {
            setPhotoFiles((previous) => {
                const next = { ...previous };
                delete next[member.team_member_id];
                return next;
            });
        }
    };

    const removeMemberPhoto = async (member) => {
        if (!window.confirm(`Remove ${member.name}'s photo?`)) {
            return;
        }

        await run(
            `team-photo-${member.team_member_id}`,
            () =>
                requestJson(
                    `/api/super-admin/website-content/team/${member.team_member_id}/photo`,
                    { method: "DELETE" },
                ),
            "Photo removed.",
        );
    };

    const deleteMember = async (member) => {
        if (!window.confirm(`Delete ${member.name} from the website team?`)) {
            return;
        }

        await run(
            `team-delete-${member.team_member_id}`,
            () =>
                requestJson(
                    `/api/super-admin/website-content/team/${member.team_member_id}`,
                    { method: "DELETE" },
                ),
            "Team member deleted.",
        );
    };

    return (
        <div className="website-content-admin" data-theme={theme}>
            <header className="wc-topbar">
                <div>
                    <span className="wc-brand-mark">WBO</span>

                    <div>
                        <small>SUPER ADMIN</small>
                        <strong>Website Content</strong>
                    </div>
                </div>

                <div className="wc-top-actions">
                    <a href="/faq" target="_blank" rel="noreferrer">
                        Preview FAQ
                    </a>

                    <button
                        type="button"
                        onClick={() =>
                            setTheme((current) =>
                                current === "dark" ? "light" : "dark",
                            )
                        }
                    >
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>

                    <Link to="/super-admin">Back to Super Admin</Link>
                </div>
            </header>

            <main className="wc-shell">
                <section className="wc-page-head">
                    <div>
                        <span>PHASE 3 CONTENT</span>
                        <h1>Website Content Management</h1>
                        <p>
                            Edit public About content, FAQs, team profiles,
                            photos, visibility, and display order without
                            changing source code.
                        </p>
                    </div>

                    <div className="wc-summary">
                        <div>
                            <strong>{data.faqs?.length || 0}</strong>
                            <span>FAQs</span>
                        </div>

                        <div>
                            <strong>{data.team?.length || 0}</strong>
                            <span>Team Members</span>
                        </div>
                    </div>
                </section>

                <nav className="wc-tabs" aria-label="Website content sections">
                    {[
                        ["about", "About"],
                        ["faqs", "FAQs"],
                        ["team", "Development Team"],
                    ].map(([key, label]) => (
                        <button
                            type="button"
                            key={key}
                            className={tab === key ? "is-active" : ""}
                            onClick={() => setTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {message ? (
                    <div className="wc-alert success">{message}</div>
                ) : null}

                {error ? <div className="wc-alert error">{error}</div> : null}

                {loading ? (
                    <div className="wc-loading">Loading website content...</div>
                ) : null}

                {!loading && tab === "about" ? (
                    <section className="wc-panel">
                        <div className="wc-panel-head">
                            <div>
                                <h2>About Section</h2>
                                <p>
                                    Controls the public landing page About
                                    Walang BrownOut content.
                                </p>
                            </div>

                            <label className="wc-switch-row">
                                <input
                                    type="checkbox"
                                    checked={about.visible}
                                    onChange={(event) =>
                                        setAbout((previous) => ({
                                            ...previous,
                                            visible: event.target.checked,
                                        }))
                                    }
                                />
                                Visible on landing page
                            </label>
                        </div>

                        <div className="wc-form-grid one">
                            <label>
                                <span>Section Title</span>
                                <input
                                    value={about.title}
                                    maxLength={160}
                                    onChange={(event) =>
                                        setAbout((previous) => ({
                                            ...previous,
                                            title: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label>
                                <span>Description</span>
                                <textarea
                                    rows={8}
                                    maxLength={4000}
                                    value={about.description}
                                    onChange={(event) =>
                                        setAbout((previous) => ({
                                            ...previous,
                                            description: event.target.value,
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <div className="wc-save-row">
                            <button
                                type="button"
                                className="wc-primary"
                                disabled={savingKey === "about"}
                                onClick={saveAbout}
                            >
                                {savingKey === "about"
                                    ? "Saving..."
                                    : "Save About Section"}
                            </button>
                        </div>
                    </section>
                ) : null}

                {!loading && tab === "faqs" ? (
                    <section className="wc-stack">
                        <article className="wc-panel">
                            <div className="wc-panel-head">
                                <div>
                                    <h2>Add FAQ</h2>
                                    <p>
                                        Create a new public frequently asked
                                        question.
                                    </p>
                                </div>
                            </div>

                            <FaqEditor
                                faq={faqDraft}
                                onChange={(field, value) =>
                                    setFaqDraft((previous) => ({
                                        ...previous,
                                        [field]: value,
                                    }))
                                }
                            />

                            <div className="wc-save-row">
                                <button
                                    type="button"
                                    className="wc-primary"
                                    disabled={savingKey === "new-faq"}
                                    onClick={createFaq}
                                >
                                    {savingKey === "new-faq"
                                        ? "Adding..."
                                        : "Add FAQ"}
                                </button>
                            </div>
                        </article>

                        {sortedFaqs.map((faq) => (
                            <article className="wc-panel" key={faq.faq_id}>
                                <div className="wc-panel-head">
                                    <div>
                                        <span className="wc-id">
                                            FAQ #{faq.faq_id}
                                        </span>
                                        <h2>
                                            {faq.question || "Untitled FAQ"}
                                        </h2>
                                    </div>

                                    <span
                                        className={`wc-status ${
                                            faq.is_active ? "visible" : "hidden"
                                        }`}
                                    >
                                        {faq.is_active ? "Visible" : "Hidden"}
                                    </span>
                                </div>

                                <FaqEditor
                                    faq={faq}
                                    onChange={(field, value) =>
                                        updateFaqLocal(faq.faq_id, field, value)
                                    }
                                />

                                <div className="wc-save-row split">
                                    <button
                                        type="button"
                                        className="wc-danger"
                                        onClick={() => deleteFaq(faq)}
                                    >
                                        Delete
                                    </button>

                                    <button
                                        type="button"
                                        className="wc-primary"
                                        disabled={
                                            savingKey === `faq-${faq.faq_id}`
                                        }
                                        onClick={() => saveFaq(faq)}
                                    >
                                        {savingKey === `faq-${faq.faq_id}`
                                            ? "Saving..."
                                            : "Save FAQ"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : null}

                {!loading && tab === "team" ? (
                    <section className="wc-stack">
                        <article className="wc-panel">
                            <div className="wc-panel-head">
                                <div>
                                    <h2>Add Team Member</h2>
                                    <p>
                                        Add a development-team profile and
                                        optional photo.
                                    </p>
                                </div>
                            </div>

                            <TeamEditor
                                member={memberDraft}
                                photoFile={photoFiles.new}
                                onPhoto={(file) =>
                                    setPhotoFiles((previous) => ({
                                        ...previous,
                                        new: file,
                                    }))
                                }
                                onChange={(field, value) =>
                                    setMemberDraft((previous) => ({
                                        ...previous,
                                        [field]: value,
                                    }))
                                }
                            />

                            <div className="wc-save-row">
                                <button
                                    type="button"
                                    className="wc-primary"
                                    disabled={savingKey === "new-team"}
                                    onClick={createMember}
                                >
                                    {savingKey === "new-team"
                                        ? "Adding..."
                                        : "Add Team Member"}
                                </button>
                            </div>
                        </article>

                        {sortedTeam.map((member) => (
                            <article
                                className="wc-panel"
                                key={member.team_member_id}
                            >
                                <div className="wc-panel-head">
                                    <div>
                                        <span className="wc-id">
                                            TEAM #{member.team_member_id}
                                        </span>
                                        <h2>{member.name}</h2>
                                        <p>{member.role}</p>
                                    </div>

                                    <span
                                        className={`wc-status ${
                                            member.is_visible
                                                ? "visible"
                                                : "hidden"
                                        }`}
                                    >
                                        {member.is_visible
                                            ? "Visible"
                                            : "Hidden"}
                                    </span>
                                </div>

                                <div className="wc-team-edit-layout">
                                    <div className="wc-photo-editor">
                                        {member.photo_url ? (
                                            <img
                                                src={member.photo_url}
                                                alt={member.name}
                                            />
                                        ) : (
                                            <span>
                                                {member.name
                                                    .split(/\s+/)
                                                    .map((part) =>
                                                        part.charAt(0),
                                                    )
                                                    .slice(0, 2)
                                                    .join("")
                                                    .toUpperCase()}
                                            </span>
                                        )}

                                        <label className="wc-file-button">
                                            Change Photo
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(event) =>
                                                    setPhotoFiles(
                                                        (previous) => ({
                                                            ...previous,
                                                            [member.team_member_id]:
                                                                event.target
                                                                    .files?.[0] ||
                                                                null,
                                                        }),
                                                    )
                                                }
                                            />
                                        </label>

                                        {photoFiles[member.team_member_id] ? (
                                            <small>
                                                {
                                                    photoFiles[
                                                        member.team_member_id
                                                    ].name
                                                }
                                            </small>
                                        ) : null}

                                        {member.photo_url ? (
                                            <button
                                                type="button"
                                                className="wc-link-danger"
                                                onClick={() =>
                                                    removeMemberPhoto(member)
                                                }
                                            >
                                                Remove Photo
                                            </button>
                                        ) : null}
                                    </div>

                                    <TeamEditor
                                        member={member}
                                        hidePhoto
                                        onChange={(field, value) =>
                                            updateMemberLocal(
                                                member.team_member_id,
                                                field,
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="wc-save-row split">
                                    <button
                                        type="button"
                                        className="wc-danger"
                                        onClick={() => deleteMember(member)}
                                    >
                                        Delete Member
                                    </button>

                                    <button
                                        type="button"
                                        className="wc-primary"
                                        disabled={
                                            savingKey ===
                                            `team-${member.team_member_id}`
                                        }
                                        onClick={() => saveMember(member)}
                                    >
                                        {savingKey ===
                                        `team-${member.team_member_id}`
                                            ? "Saving..."
                                            : "Save Member"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : null}
            </main>
        </div>
    );
}

export default WebsiteContentAdmin;
