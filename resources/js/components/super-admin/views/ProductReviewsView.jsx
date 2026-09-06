import React, { useEffect, useMemo, useState } from "react";
import "../../../../css/super-admin/product-reviews.css";
const csrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") ?? "";
async function api(url, options = {}) {
    const method = options.method || "GET";
    const r = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            ...(method !== "GET"
                ? { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf() }
                : {}),
        },
        body:
            options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok)
        throw new Error(
            d?.message ||
                Object.values(d?.errors || {})
                    .flat()
                    .find(Boolean) ||
                "Review request failed.",
        );
    return d;
}
const Stars = ({ value }) => (
    <span className="admin-review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= Number(value) ? "is-filled" : ""}>
                {"\u2605"}
            </span>
        ))}
    </span>
);
export default function ProductReviewsView() {
    const [data, setData] = useState({ metrics: {}, reviews: [] }),
        [loading, setLoading] = useState(true),
        [busy, setBusy] = useState(null),
        [error, setError] = useState(""),
        [notice, setNotice] = useState(""),
        [status, setStatus] = useState("ALL"),
        [rating, setRating] = useState("ALL"),
        [search, setSearch] = useState("");
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            setData(await api("/api/super-admin/product-reviews"));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const rows = useMemo(() => {
        const q = search.toLowerCase().trim();
        return (data.reviews || []).filter(
            (r) =>
                (status === "ALL" || r.status === status) &&
                (rating === "ALL" || Number(r.rating) === Number(rating)) &&
                (!q ||
                    [
                        r.product_name,
                        r.sku,
                        r.customer_name,
                        r.customer_email,
                        r.title,
                        r.comment,
                    ].some((v) =>
                        String(v ?? "")
                            .toLowerCase()
                            .includes(q),
                    )),
        );
    }, [data.reviews, status, rating, search]);
    const moderate = async (r, action) => {
        const reason =
            action === "restore"
                ? null
                : window.prompt(
                      `Optional reason for ${action}:`,
                      r.moderation_reason || "",
                  );
        if (action !== "restore" && reason === null) return;
        setBusy(r.review_id);
        try {
            const d = await api(
                `/api/super-admin/product-reviews/${r.review_id}/moderate`,
                {
                    method: "PUT",
                    body: { action, reason: reason?.trim() || null },
                },
            );
            setNotice(d.message);
            await load();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(null);
        }
    };
    const remove = async (r) => {
        if (!window.confirm(`Permanently delete review #${r.review_id}?`))
            return;
        setBusy(r.review_id);
        try {
            const d = await api(
                `/api/super-admin/product-reviews/${r.review_id}`,
                { method: "DELETE" },
            );
            setNotice(d.message);
            await load();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(null);
        }
    };
    if (loading)
        return (
            <div className="admin-reviews-state">
                Loading product reviews...
            </div>
        );
    const m = data.metrics || {};
    return (
        <section className="admin-reviews-page">
            <div className="admin-reviews-heading">
                <span>Verified Purchase Reviews</span>
                <h1>Product Reviews</h1>
                <p>
                    Moderate verified-purchase reviews. Super Admin cannot
                    rewrite ratings or comments.
                </p>
            </div>
            {notice && <div className="admin-reviews-notice">{notice}</div>}
            {error && <div className="admin-reviews-error">{error}</div>}
            <div className="admin-reviews-metrics">
                {[
                    ["Total", m.total_reviews],
                    ["Visible", m.visible_reviews],
                    ["Flagged", m.flagged_reviews],
                    [
                        "Average",
                        `${Number(m.average_rating || 0).toFixed(1)}/5`,
                    ],
                ].map(([l, v]) => (
                    <article key={l}>
                        <span>{l}</span>
                        <strong>{v || 0}</strong>
                    </article>
                ))}
            </div>
            <div className="admin-reviews-filters">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product, customer, or review..."
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="ALL">All statuses</option>
                    <option>VISIBLE</option>
                    <option>HIDDEN</option>
                    <option>FLAGGED</option>
                </select>
                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                >
                    <option value="ALL">All ratings</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n}>{n}</option>
                    ))}
                </select>
            </div>
            <div className="admin-reviews-grid">
                {rows.length ? (
                    rows.map((r) => (
                        <article
                            className="admin-review-card"
                            key={r.review_id}
                        >
                            <div className="admin-review-head">
                                <div>
                                    <small>
                                        #{r.review_id} - {r.sku}
                                    </small>
                                    <h2>{r.product_name}</h2>
                                </div>
                                <span
                                    className={`admin-review-badge status-${String(r.status).toLowerCase()}`}
                                >
                                    {r.status}
                                </span>
                            </div>
                            <div className="admin-review-customer">
                                <div>
                                    <strong>{r.customer_name}</strong>
                                    <small>{r.customer_email}</small>
                                </div>
                                <Stars value={r.rating} />
                            </div>
                            {r.title && <h3>{r.title}</h3>}
                            <p>{r.comment}</p>
                            <div className="admin-review-meta">
                                Verified Purchase - Order #{r.order_id}
                            </div>
                            {r.moderation_reason && (
                                <div className="admin-review-reason">
                                    Reason: {r.moderation_reason}
                                </div>
                            )}
                            <div className="admin-review-actions">
                                {r.status !== "VISIBLE" && (
                                    <button
                                        disabled={busy === r.review_id}
                                        onClick={() => moderate(r, "restore")}
                                    >
                                        Restore
                                    </button>
                                )}
                                {r.status !== "HIDDEN" && (
                                    <button
                                        disabled={busy === r.review_id}
                                        onClick={() => moderate(r, "hide")}
                                    >
                                        Hide
                                    </button>
                                )}
                                {r.status !== "FLAGGED" && (
                                    <button
                                        disabled={busy === r.review_id}
                                        onClick={() => moderate(r, "flag")}
                                    >
                                        Flag
                                    </button>
                                )}
                                <button
                                    className="danger"
                                    disabled={busy === r.review_id}
                                    onClick={() => remove(r)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="admin-reviews-state">
                        No matching reviews.
                    </div>
                )}
            </div>
        </section>
    );
}
