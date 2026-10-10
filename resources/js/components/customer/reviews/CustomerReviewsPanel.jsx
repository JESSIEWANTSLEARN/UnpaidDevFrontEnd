import { backendUrl, loadCsrfToken } from "../../../config/api.js";
import React, { useEffect, useState } from "react";
import { CustomerReviewsSkeleton } from "../shell/CustomerLoadingSkeletons.jsx";
import "../../../../css/customer/reviews.css";

async function apiRequest(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const token =
    method !== "GET" && method !== "HEAD"
      ? await loadCsrfToken()
      : "";
  const response = await fetch(backendUrl(url), {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(method !== "GET"
        ? {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": token,
          }
        : {}),
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validation = Object.values(data?.errors || {})
      .flat()
      .find(Boolean);

    throw new Error(
      validation || data?.message || "Review request failed."
    );
  }

  return data;
}

function Stars({ value }) {
  return (
    <span className="customer-review-stars">
      {[1, 2, 3, 4, 5].map((number) => (
        <span
          key={number}
          className={number <= Number(value) ? "is-filled" : ""}
        >
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

/** Customer review experience and Super Admin-safe public preview. */
export default function CustomerReviewsPanel({ previewMode = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [eligible, setEligible] = useState([]);
  const [mine, setMine] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      if (previewMode) {
        const result = await apiRequest("/api/store/reviews");
        setPublicReviews(result.reviews || []);
        return;
      }

      const [mineResult, publicResult] = await Promise.all([
        apiRequest("/api/user/reviews"),
        apiRequest("/api/store/reviews"),
      ]);

      setEligible(mineResult.eligible_products || []);
      setMine(mineResult.my_reviews || []);
      setPublicReviews(publicResult.reviews || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode]);

  const submit = async (event) => {
    event.preventDefault();

    if (!selected || busy) return;

    setBusy(true);
    setError("");

    try {
      const result = await apiRequest("/api/user/reviews", {
        method: "POST",
        body: {
          product_id: selected.product_id,
          order_id: selected.order_id,
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        },
      });

      setNotice(result.message);
      setSelected(null);
      setTitle("");
      setComment("");
      setRating(5);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (review) => {
    setEditingReview(review.review_id);
    setEditRating(Number(review.rating) || 5);
    setEditTitle(review.title || "");
    setEditComment(review.comment || "");
    setError("");
    setNotice("");
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditTitle("");
    setEditComment("");
  };

  const saveEdit = async (event, reviewId) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const result = await apiRequest("/api/user/reviews/" + reviewId, {
        method: "PUT",
        body: {
          rating: editRating,
          title: editTitle.trim() || null,
          comment: editComment.trim(),
        },
      });

      setNotice(result.message || "Your review was updated.");
      cancelEditing();
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const renderReviewCard = (review, canEdit = false) => {
    const isEditing = canEdit && editingReview === review.review_id;

    return (
      <article className="customer-review-card" key={review.review_id}>
        <div className="customer-review-head">
          <div>
            <strong>{review.product_name}</strong>
            <small>{review.customer_name || review.sku}</small>
          </div>
          <Stars value={isEditing ? editRating : review.rating} />
        </div>

        {isEditing ? (
          <form
            className="customer-review-form customer-review-edit-form"
            onSubmit={(event) => saveEdit(event, review.review_id)}
          >
            <label>
              Rating
              <div className="customer-review-rating">
                {[1, 2, 3, 4, 5].map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={number <= editRating ? "is-selected" : ""}
                    aria-label={number + " star rating"}
                    onClick={() => setEditRating(number)}
                  >
                    {"\u2605"}
                  </button>
                ))}
              </div>
            </label>
            <label>
              Title (optional)
              <input
                maxLength={120}
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
            </label>
            <label>
              Comment
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={5}
                value={editComment}
                onChange={(event) => setEditComment(event.target.value)}
              />
            </label>
            <div className="customer-review-edit-actions">
              <button
                type="button"
                className="customer-review-submit"
                disabled={busy}
                onClick={cancelEditing}
              >
                Cancel
              </button>
              <button className="customer-review-submit" disabled={busy}>
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            {review.title && <h3>{review.title}</h3>}
            <p>{review.comment}</p>
          </>
        )}

        <span className="customer-review-verified">Verified Purchase</span>
        {review.status && (
          <small className="customer-review-status">{review.status}</small>
        )}
        {canEdit && !isEditing && (
          <div className="customer-review-edit-actions">
            <button
              type="button"
              className="customer-review-submit"
              onClick={() => startEditing(review)}
            >
              Edit review
            </button>
          </div>
        )}
      </article>
    );
  };
  if (loading) {
    return <CustomerReviewsSkeleton />;
  }

  return (
    <section className="customer-page-section customer-reviews-page">
      <div className="customer-page-title">
        <div>
          <span className="customer-kicker">VERIFIED PURCHASE REVIEWS</span>
          <h1>Product reviews</h1>
          <p>
            {previewMode
              ? "Preview public customer reviews without exposing private purchase history."
              : "Only fulfilled purchases can be reviewed. You can review a product once per fulfilled order."}
          </p>
        </div>
      </div>

      {notice && <div className="customer-review-notice">{notice}</div>}
      {error && <div className="customer-review-error">{error}</div>}

      {previewMode ? (
        <div className="customer-review-grid">
          {publicReviews.length ? (
            publicReviews.map((review) => renderReviewCard(review))
          ) : (
            <div className="customer-review-empty">
              No visible product reviews yet.
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="customer-review-section">
            <h2>Ready to review</h2>
            {eligible.length ? (
              <div className="customer-review-grid">
                {eligible.map((product) => (
                  <article
                    className="customer-review-eligible"
                    key={`${product.product_id}:${product.order_id}`}
                  >
                    <div>
                      <small>{product.sku}</small>
                      <strong>{product.name}</strong>
                      <span>Order #{product.order_id}</span>
                    </div>
                    <button type="button" onClick={() => setSelected(product)}>
                      Write Review
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-review-empty">
                No fulfilled purchases are waiting for feedback.
              </div>
            )}
          </div>

          {selected && (
            <form className="customer-review-form" onSubmit={submit}>
              <div className="customer-review-form-head">
                <h2>Review {selected.name}</h2>
                <button type="button" onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>

              <label>
                Rating
                <div className="customer-review-rating">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      type="button"
                      key={number}
                      className={number <= rating ? "is-selected" : ""}
                      onClick={() => setRating(number)}
                    >
                      {"\u2605"}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Title (optional)
                <input
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label>
                Comment
                <textarea
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={5}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>

              <button className="customer-review-submit" disabled={busy}>
                {busy ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="customer-review-section">
            <h2>My reviews</h2>
            <div className="customer-review-grid">
              {mine.length ? (
                mine.map((review) => renderReviewCard(review, true))
              ) : (
                <div className="customer-review-empty">
                  You have not submitted a product review yet.
                </div>
              )}
            </div>
          </div>

          <div className="customer-review-section">
            <h2>Customer reviews</h2>
            <p className="customer-review-section-copy">
              Visible verified-purchase reviews from Walang Brownout customers.
            </p>
            <div className="customer-review-grid">
              {publicReviews.length ? (
                publicReviews.map((review) => renderReviewCard(review))
              ) : (
                <div className="customer-review-empty">
                  No visible product reviews yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
