import React, { useEffect, useMemo, useState } from "react";
import { backendUrl } from "../../../config/api.js";
import { Icon } from "../CustomerUi.jsx";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import "../../../../css/customer/product-details.css";

function RatingStars({ value }) {
  const filled = Math.round(Number(value || 0));

  return (
    <span className="wbo-product-stars" aria-label={`${Number(value || 0).toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((number) => (
        <span key={number} className={number <= filled ? "is-filled" : ""}>
          â˜…
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

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.product_id !== product?.product_id &&
            item.category === product?.category,
        )
        .slice(0, 4),
    [products, product?.product_id, product?.category],
  );

  const averageRating = reviews.length
    ? reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0,
      ) / reviews.length
    : 0;

  if (!product) {
    return (
      <section className="customer-page-section">
        <button type="button" className="wbo-product-back" onClick={onBack}>Back to products</button>
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
    <section className="customer-page-section wbo-product-details">
      <div className="wbo-product-breadcrumb">
        <button type="button" onClick={onBack}>Products</button>
        <span>/</span>
        <span>{product.category || "General"}</span>
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      <div className="wbo-product-hero">
        <div className="wbo-product-gallery">
          <div className="wbo-product-main-image">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <div className="wbo-product-image-placeholder">
                <Icon name="products" size={52} />
              </div>
            )}
          </div>

          {product.image_url && (
            <div className="wbo-product-thumbnail is-active">
              <img src={product.image_url} alt="" />
            </div>
          )}
        </div>

        <div className="wbo-product-info">
          <span className="wbo-product-category-label">
            {product.category || "General"}
          </span>

          <h1>{product.name}</h1>

          <div className="wbo-product-rating-row">
            {reviews.length ? (
              <>
                <strong>{averageRating.toFixed(1)}</strong>
                <RatingStars value={averageRating} />
                <span>
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>

          <div className="wbo-product-price">
            {money(product.unit_price)}
          </div>

          <div className="wbo-product-facts">
            <div>
              <span>SKU</span>
              <strong>{product.sku || "N/A"}</strong>
            </div>

            <div>
              <span>Availability</span>
              <strong className={stock > 0 ? "is-in-stock" : "is-out-of-stock"}>
                {stock > 0
                  ? `${stock} unit${stock === 1 ? "" : "s"} available`
                  : "Out of stock"}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{product.category || "General"}</strong>
            </div>
          </div>

          <div className="wbo-product-quantity">
            <span>Quantity</span>

            <div>
              <button
                type="button"
                disabled={quantity <= 1 || stock <= 0}
                onClick={() => updateQuantity(quantity - 1)}
              >
                âˆ’
              </button>

              <input
                type="number"
                min="1"
                max={Math.max(stock, 1)}
                value={quantity}
                disabled={stock <= 0}
                onChange={(event) => updateQuantity(event.target.value)}
              />

              <button
                type="button"
                disabled={quantity >= stock || stock <= 0}
                onClick={() => updateQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="wbo-product-actions">
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

          <button
            type="button"
            className="wbo-product-support-button"
            disabled={previewMode}
            onClick={() => onAskProduct(product)}
          >
            <Icon name="chat" size={18} />
            Ask about this product
          </button>
        </div>
      </div>

      <div className="wbo-product-sections">
        <section className="wbo-product-panel">
          <h2>Product specifications</h2>

          <dl>
            <div>
              <dt>Product name</dt>
              <dd>{product.name}</dd>
            </div>
            <div>
              <dt>SKU</dt>
              <dd>{product.sku || "N/A"}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{product.category || "General"}</dd>
            </div>
            <div>
              <dt>Current stock</dt>
              <dd>{stock}</dd>
            </div>
          </dl>
        </section>

        <section className="wbo-product-panel">
          <h2>Product description</h2>
          <p>
            {product.description ||
              "Product information will be added by Walang Brownout."}
          </p>
        </section>

        <section className="wbo-product-panel">
          <div className="wbo-product-section-heading">
            <div>
              <h2>Product ratings</h2>
              <p>Verified-purchase feedback from Walang Brownout customers.</p>
            </div>

            {reviews.length > 0 && (
              <div className="wbo-product-rating-summary">
                <strong>{averageRating.toFixed(1)}</strong>
                <span>out of 5</span>
                <RatingStars value={averageRating} />
              </div>
            )}
          </div>

          {reviews.length ? (
            <div className="wbo-product-review-list">
              {reviews.slice(0, 8).map((review) => (
                <article key={review.review_id}>
                  <div>
                    <strong>
                      {review.customer_name || "Verified customer"}
                    </strong>
                    <RatingStars value={review.rating} />
                  </div>

                  {review.title && <h3>{review.title}</h3>}
                  <p>{review.comment}</p>
                  <small>Verified Purchase</small>
                </article>
              ))}
            </div>
          ) : (
            <div className="wbo-product-empty-note">
              No visible reviews for this product yet.
            </div>
          )}
        </section>

        <section className="wbo-product-panel">
          <div className="wbo-product-section-heading">
            <div>
              <h2>You may also like</h2>
              <p>More products from the same category.</p>
            </div>
          </div>

          {relatedProducts.length ? (
            <div className="wbo-related-products">
              {relatedProducts.map((item) => (
                <button
                  type="button"
                  key={item.product_id}
                  onClick={() => onSelectProduct(item)}
                >
                  <div>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <span>
                        <Icon name="products" size={28} />
                      </span>
                    )}
                  </div>

                  <strong>{item.name}</strong>
                  <small>{money(item.unit_price)}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="wbo-product-empty-note">
              No related products are available yet.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}