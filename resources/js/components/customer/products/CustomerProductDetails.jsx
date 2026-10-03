import React, { useEffect, useMemo, useState } from "react";
import { backendUrl } from "../../../config/api.js";
import { Icon } from "../CustomerUi.jsx";
import CinematicReveal from "../../shared/CinematicReveal.jsx";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import "../../../../css/customer/customer-cinematic-store.css";

function RatingStars({ value }) {
  const filled = Math.round(Number(value || 0));

  return (
    <span
      className="cin-product-stars"
      aria-label={`${Number(value || 0).toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((number) => (
        <span key={number} className={number <= filled ? "is-filled" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function CustomerProductDetails({
  product,
  products,
  previewMode,
  onBack,
  onSelectProduct,
  onAddQuantity,
  onBuyNow,
  onAskProduct,
}) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product?.product_id]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      if (!product?.product_id) return;

      try {
        const response = await fetch(backendUrl("/api/store/reviews"), {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const data = await response.json().catch(() => ({}));
        const rows = data.reviews || [];

        const matching = rows.filter(
          (review) =>
            Number(review.product_id) === Number(product.product_id) ||
            String(review.product_name || "").toLowerCase() ===
              String(product.name || "").toLowerCase(),
        );

        if (!cancelled) {
          setReviews(matching);
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [product?.product_id, product?.name]);

  const stock = Math.max(0, Number(product?.available_stock || 0));

  const relatedProducts = useMemo(() => {
    const otherProducts = products.filter(
      (item) => item.product_id !== product?.product_id,
    );

    if (!product?.category) {
      return otherProducts.slice(0, 4);
    }

    return otherProducts
      .filter((item) => item.category === product.category)
      .slice(0, 4);
  }, [products, product?.product_id, product?.category]);

  const averageRating = reviews.length
    ? reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0,
      ) / reviews.length
    : 0;

  if (!product) {
    return (
      <section className="customer-page-section">
        <button
          type="button"
          className="cin-product-back"
          onClick={onBack}
        >
          ← Back to products
        </button>
      </section>
    );
  }

  const updateQuantity = (nextQuantity) => {
    if (stock <= 0) return;

    setQuantity(
      Math.min(
        stock,
        Math.max(1, Number(nextQuantity) || 1),
      ),
    );
  };

  return (
    <section className="cin-product-detail">
      <div className="cin-product-topbar">
        <button
          type="button"
          className="cin-product-back"
          onClick={onBack}
        >
          ← Products
        </button>

        <div className="cin-product-breadcrumb">
          {product.category ? (
            <>
              <span>{product.category}</span>
              <i>/</i>
            </>
          ) : null}
          <strong>{product.name}</strong>
        </div>
      </div>

      <section className="cin-product-hero">
        <div className="cin-product-hero-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="cin-product-placeholder">
              <Icon name="products" size={58} />
            </div>
          )}

          <div className="cin-product-image-glow" aria-hidden="true" />

          <span
            className={`cin-product-stock ${
              stock > 0 ? "is-in" : "is-out"
            }`}
          >
            {stock > 0
              ? `${stock} unit${stock === 1 ? "" : "s"} available`
              : "Currently out of stock"}
          </span>
        </div>

        <div className="cin-product-hero-copy">
          <span className="cin-product-kicker">
            {product.category || "WALANG BROWNOUT PRODUCT"}
          </span>

          <h1>{product.name}</h1>

          <p className="cin-product-description">
            {product.description ||
              "A home-comfort product from Walang Brownout."}
          </p>

          <div className="cin-product-rating-line">
            {reviews.length ? (
              <>
                <strong>{averageRating.toFixed(1)}</strong>
                <RatingStars value={averageRating} />
                <span>
                  {reviews.length} review
                  {reviews.length === 1 ? "" : "s"}
                </span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>

          <div className="cin-product-price">
            {money(product.unit_price)}
          </div>

          <div className="cin-product-buy-panel">
            <div className="cin-product-quantity">
              <span>Quantity</span>

              <div>
                <button
                  type="button"
                  disabled={quantity <= 1 || stock <= 0}
                  onClick={() => updateQuantity(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  max={Math.max(stock, 1)}
                  value={quantity}
                  disabled={stock <= 0}
                  onChange={(event) =>
                    updateQuantity(event.target.value)
                  }
                />

                <button
                  type="button"
                  disabled={quantity >= stock || stock <= 0}
                  onClick={() => updateQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="cin-product-actions">
              <button
                type="button"
                className="is-cart"
                disabled={stock <= 0 || previewMode}
                onClick={() => onAddQuantity(product, quantity)}
              >
                <Icon name="cart" size={18} />
                Add to cart
              </button>

              <button
                type="button"
                className="is-buy"
                disabled={stock <= 0 || previewMode}
                onClick={() => onBuyNow(product, quantity)}
              >
                Buy now
              </button>
            </div>
          </div>

          <button
            type="button"
            className="cin-product-support"
            disabled={previewMode}
            onClick={() => onAskProduct(product)}
          >
            <Icon name="chat" size={18} />
            Ask about this product
          </button>
        </div>
      </section>

      <CinematicReveal
        as="section"
        className="cin-product-story"
      >
        <div className="cin-product-story-number">01</div>

        <div>
          <span className="cin-product-kicker">
            PRODUCT STORY
          </span>
          <h2>Designed for everyday comfort.</h2>
        </div>

        <p>
          {product.description ||
            "Product information will be added by Walang Brownout."}
        </p>
      </CinematicReveal>

      <CinematicReveal
        as="section"
        className="cin-product-live-section"
      >
        <div className="cin-product-live-number">
          {stock}
        </div>

        <div className="cin-product-live-copy">
          <span className="cin-product-kicker">
            LIVE AVAILABILITY
          </span>
          <h2>
            Warehouse stock,
            <br />
            visible to the customer.
          </h2>
          <p>
            The displayed availability comes from the current
            Walang Brownout inventory returned by the store API.
          </p>
        </div>

        <div className="cin-product-live-facts">
          <article>
            <span>SKU</span>
            <strong>{product.sku || "N/A"}</strong>
          </article>

          {product.category ? (
            <article>
              <span>Category</span>
              <strong>{product.category}</strong>
            </article>
          ) : null}

          <article>
            <span>Price</span>
            <strong>{money(product.unit_price)}</strong>
          </article>
        </div>
      </CinematicReveal>

      <CinematicReveal
        as="section"
        className="cin-product-info-section"
      >
        <div className="cin-product-section-heading">
          <span className="cin-product-kicker">
            DETAILS AT A GLANCE
          </span>
          <h2>Product information.</h2>
        </div>

        <dl className="cin-product-spec-grid">
          <div>
            <dt>Product name</dt>
            <dd>{product.name}</dd>
          </div>

          <div>
            <dt>SKU</dt>
            <dd>{product.sku || "N/A"}</dd>
          </div>

          <div>
            <dt>Current stock</dt>
            <dd>{stock}</dd>
          </div>

          <div>
            <dt>Current price</dt>
            <dd>{money(product.unit_price)}</dd>
          </div>

          {product.category ? (
            <div>
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
          ) : null}
        </dl>
      </CinematicReveal>

      <CinematicReveal
        as="section"
        className="cin-product-reviews"
      >
        <div className="cin-product-section-heading">
          <span className="cin-product-kicker">
            VERIFIED FEEDBACK
          </span>

          <h2>What customers say.</h2>

          {reviews.length > 0 ? (
            <div className="cin-product-rating-summary">
              <strong>{averageRating.toFixed(1)}</strong>
              <span>out of 5</span>
              <RatingStars value={averageRating} />
            </div>
          ) : null}
        </div>

        {reviews.length ? (
          <div className="cin-product-review-grid">
            {reviews.slice(0, 8).map((review) => (
              <article key={review.review_id}>
                <div>
                  <strong>
                    {review.customer_name || "Verified customer"}
                  </strong>
                  <RatingStars value={review.rating} />
                </div>

                {review.title ? <h3>{review.title}</h3> : null}

                <p>{review.comment}</p>
                <small>Verified Purchase</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="cin-product-empty">
            No visible reviews for this product yet.
          </div>
        )}
      </CinematicReveal>

      <CinematicReveal
        as="section"
        className="cin-product-related"
      >
        <div className="cin-product-section-heading">
          <span className="cin-product-kicker">
            KEEP EXPLORING
          </span>
          <h2>
            {product.category
              ? `More from ${product.category}.`
              : "More products to discover."}
          </h2>
        </div>

        {relatedProducts.length ? (
          <div className="cin-product-related-grid">
            {relatedProducts.map((item) => (
              <button
                type="button"
                key={item.product_id}
                onClick={() => onSelectProduct(item)}
              >
                <div>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>
                      <Icon name="products" size={30} />
                    </span>
                  )}
                </div>

                <span>
                  {item.category || "Walang Brownout"}
                </span>
                <strong>{item.name}</strong>
                <small>{money(item.unit_price)}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="cin-product-empty">
            No related products are available yet.
          </div>
        )}
      </CinematicReveal>
    </section>
  );
}
