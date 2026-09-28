import React, { useState } from "react";
import { backendUrl } from "../../../config/api.js";
import CustomerReviewsPanel from "../reviews/CustomerReviewsPanel.jsx";
import CustomerSupportPanel from "../support/CustomerSupportPanel.jsx";
import CustomerProductDetails from "../products/CustomerProductDetails.jsx";
import CustomerOrderReturnPanel from "../orders/CustomerOrderReturnPanel.jsx";
import { EmptyState, Icon, ProfileAvatar, StatusBadge } from "../CustomerUi.jsx";
import {
  money,
  ORDER_STATUS_FILTERS,
} from "../../../utils/customer/customerStoreUtils.js";

const HeroImage = backendUrl("/storage/site/mainpic.jpg");

export default function CustomerMainViews({ ctx }) {
  const {
    tab,
    products,
    stats,
    categoryCards,
    changeTab,
    chooseCategory,
    addToCart,
    setCart,
    setCartOpen,
    showCartFeedback,
    setCartPulse,
    cartAddedId,
    cartShakeId,
    filteredProducts,
    search,
    setSearch,
    handleSearch,
    categories,
    category,
    setCategory,
    orderFilter,
    orderStatusCounts,
    setOrderFilter,
    filteredOrders,
    orders,
    previewMode,
    saveProfile,
    user,
    profile,
    setProfile,
    busy,
    photoBusy,
    changeProfilePhoto,
    removeProfilePhoto,
    password,
    setPassword,
    savePassword,
    deliveryProfile,
    setDeliveryProfile,
    saveDeliveryAddress,
    logout,
  } = ctx;

  const [selectedProduct, setSelectedProduct] = useState(null);

  const openProduct = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    changeTab("product");
  };

  const addProductQuantity = (product, quantity, openCartAfter = false) => {
    const stock = Math.max(0, Number(product.available_stock || 0));
    const requested = Math.max(1, Number(quantity) || 1);

    if (stock <= 0) {
      showCartFeedback(
        "warning",
        `${product.name} is currently out of stock.`,
        product.product_id,
      );
      return;
    }

    setCart((current) => {
      const currentQty = Number(
        current[product.product_id]?.quantity ?? 0,
      );

      return {
        ...current,
        [product.product_id]: {
          product_id: product.product_id,
          quantity: Math.min(
            currentQty + requested,
            stock,
          ),
        },
      };
    });

    showCartFeedback(
      "success",
      `${product.name} added to your cart.`,
      product.product_id,
    );

    setCartPulse(false);
    requestAnimationFrame(() => setCartPulse(true));

    if (openCartAfter) {
      setCartOpen(true);
    }
  };

  const askAboutProduct = (product) => {
    sessionStorage.setItem(
      "wbo_support_context",
      JSON.stringify({
        type: "product",
        product_id: product.product_id,
      }),
    );
    changeTab("support");
  };
  return (
    <>
<main className="customer-main">
        {tab === "dashboard" && (
          <>
            <section className="customer-hero">
              <div className="customer-hero-copy">
                <span className="customer-eyebrow">SMARTER HOME COMFORT</span>
                <h1>Smarter cooling. Cleaner air. Better living.</h1>
                <p>
                  Shop real Walang Brownout inventory, check live availability,
                  and manage every order from one secure account.
                </p>

                <div className="customer-hero-actions">
                  <button type="button" className="customer-primary" onClick={() => changeTab("shop")}>
                    Shop products <Icon name="arrow" size={18} />
                  </button>
                  <button type="button" className="customer-secondary" onClick={() => changeTab("orders")}>
                    View my orders
                  </button>
                </div>

                <div className="customer-hero-stats">
                  <div>
                    <strong>{products.length}</strong>
                    <span>Available products</span>
                  </div>
                  <div>
                    <strong>{stats.total_orders ?? 0}</strong>
                    <span>Your orders</span>
                  </div>
                  <div>
                    <strong>{stats.fulfilled_orders ?? 0}</strong>
                    <span>Fulfilled</span>
                  </div>
                </div>
              </div>

              <div className="customer-hero-visual">
                <img src={HeroImage} alt="Walang Brownout home comfort appliances" />
                <div className="customer-hero-card">
                  <span>Live inventory</span>
                  <strong>{products.reduce((sum, product) => sum + Math.max(0, product.available_stock), 0)} units</strong>
                  <small>Current warehouse availability</small>
                </div>
              </div>
            </section>

            <section className="customer-section">
              <div className="customer-section-head">
                <div>
                  <span className="customer-kicker">SHOP BY CATEGORY</span>
                  <h2>Find the right comfort solution</h2>
                </div>
                <button type="button" className="customer-text-link" onClick={() => chooseCategory("All")}>
                  View all products <Icon name="arrow" size={16} />
                </button>
              </div>

              {categoryCards.length ? (
                <div className="customer-category-grid">
                  {categoryCards.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      className="customer-category-card"
                      onClick={() => chooseCategory(item.name)}
                    >
                      <div className="customer-category-media">
                        {item.product?.image_url ? (
                          <img src={backendUrl(item.product.image_url)} alt="" loading="lazy" />
                        ) : (
                          <Icon name="products" size={34} />
                        )}
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.count} product{item.count === 1 ? "" : "s"}</span>
                      </div>
                      <Icon name="arrow" size={18} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Categories will appear here"
                  text="Add categorized products to build the customer catalog."
                />
              )}
            </section>

            <section className="customer-section">
              <div className="customer-section-head">
                <div>
                  <span className="customer-kicker">FEATURED PRODUCTS</span>
                  <h2>Available now</h2>
                </div>
                <button type="button" className="customer-text-link" onClick={() => changeTab("shop")}>
                  Browse catalog <Icon name="arrow" size={16} />
                </button>
              </div>

              {products.length ? (
                <div className="customer-product-grid customer-featured-grid">
                  {products.slice(0, 4).map((product) => (
                    <article
                      className="customer-product-card"
                      key={product.product_id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openProduct(product)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openProduct(product);
                        }
                      }}
                    >
                      <div className="customer-product-media">
                        {product.image_url ? (
                          <img
                            src={backendUrl(product.image_url)}
                            alt={product.name}
                            loading="lazy"
                            className="wbo-glow-image"
                          />
                        ) : (
                          <div className="customer-product-placeholder"><Icon name="products" size={32} /></div>
                        )}
                        <span className={`customer-stock ${product.available_stock > 0 ? "is-in" : "is-out"}`}>
                          {product.available_stock > 0
                            ? `${product.available_stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                      <div className="customer-product-body">
                        <span className="customer-product-category">{product.category}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description || "Home comfort product from Walang Brownout."}</p>
                        <div className="customer-product-footer">
                          <strong>{money(product.unit_price)}</strong>
                          <button
                            type="button"
                            className={`customer-add-cart-button ${
                              cartAddedId === product.product_id
                                ? "is-added"
                                : ""
                            } ${
                              cartShakeId === product.product_id
                                ? "is-limit"
                                : ""
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={product.available_stock <= 0}
                          >
                            <Icon
                              name={
                                cartAddedId === product.product_id
                                  ? "check"
                                  : "cart"
                              }
                              size={17}
                            />
                            {cartAddedId === product.product_id
                              ? "Added!"
                              : "Add to cart"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No products yet" text="Available products will appear here." />
              )}
            </section>

            <section className="customer-section customer-order-preview">
              <div className="customer-section-head">
                <div>
                  <span className="customer-kicker">ORDER UPDATES</span>
                  <h2>Recent activity</h2>
                </div>
                <button type="button" className="customer-text-link" onClick={() => changeTab("orders")}>
                  See all orders <Icon name="arrow" size={16} />
                </button>
              </div>

              {orders.length ? (
                <div className="customer-recent-orders">
                  {orders.slice(0, 3).map((order) => (
                    <button
                      type="button"
                      key={order.order_id}
                      className="customer-recent-order"
                      onClick={() => changeTab("orders")}
                    >
                      <div>
                        <span>Order #{order.order_id}</span>
                        <small>{new Date(order.order_date).toLocaleString()}</small>
                      </div>
                      <strong>{money(order.total)}</strong>
                      <StatusBadge status={order.status} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title="No orders yet" text="Your latest order updates will appear here." />
              )}
            </section>
          </>
        )}

        {tab === "shop" && (
          <section className="customer-page-section">
            <div className="customer-page-title">
              <div>
                <span className="customer-kicker">PRODUCT CATALOG</span>
                <h1>Shop available products</h1>
                <p>Availability is calculated from current warehouse batch quantities.</p>
              </div>
              <span className="customer-result-count">{filteredProducts.length} result(s)</span>
            </div>

            <div className="customer-catalog-toolbar">
              <form className="customer-catalog-search" onSubmit={handleSearch}>
                <Icon name="search" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, SKU, or description..."
                />
              </form>

              <div className="customer-category-pills" aria-label="Filter by category">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={category === item ? "is-active" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length ? (
              <div className="customer-product-grid">
                {filteredProducts.map((product) => (
                  <article
                      className="customer-product-card"
                      key={product.product_id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openProduct(product)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openProduct(product);
                        }
                      }}
                    >
                    <div className="customer-product-media">
                      {product.image_url ? (
                        <img
                          src={backendUrl(product.image_url)}
                          alt={product.name}
                          loading="lazy"
                          className="wbo-glow-image"
                        />
                      ) : (
                        <div className="customer-product-placeholder"><Icon name="products" size={32} /></div>
                      )}
                      <span className={`customer-stock ${product.available_stock > 0 ? "is-in" : "is-out"}`}>
                        {product.available_stock > 0
                          ? `${product.available_stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    <div className="customer-product-body">
                      <span className="customer-product-category">{product.category}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description || "Home comfort product from Walang Brownout."}</p>
                      <small className="customer-sku">{product.sku}</small>

                      <div className="customer-product-footer">
                        <strong>{money(product.unit_price)}</strong>
                        <button
                          type="button"
                          className={`customer-add-cart-button ${
                            cartAddedId === product.product_id
                              ? "is-added"
                              : ""
                          } ${
                            cartShakeId === product.product_id
                              ? "is-limit"
                              : ""
                          }`}
                          onClick={(event) => {
                              event.stopPropagation();
                              addToCart(product);
                            }}
                          disabled={product.available_stock <= 0}
                        >
                          <Icon
                            name={
                              cartAddedId === product.product_id
                                ? "check"
                                : "cart"
                            }
                            size={17}
                          />
                          {product.available_stock <= 0
                            ? "Unavailable"
                            : cartAddedId === product.product_id
                              ? "Added!"
                              : "Add to cart"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No products found" text="Try another search or category." />
            )}
          </section>
        )}

        {tab === "product" && (
          <CustomerProductDetails
            product={selectedProduct}
            products={products}
            previewMode={previewMode}
            onBack={() => changeTab("shop")}
            onSelectProduct={openProduct}
            onAddQuantity={(product, quantity) =>
              addProductQuantity(product, quantity, false)
            }
            onBuyNow={(product, quantity) =>
              addProductQuantity(product, quantity, true)
            }
            onAskProduct={askAboutProduct}
          />
        )}
        {tab === "orders" && (
          <section className="customer-page-section">
            <div className="customer-page-title">
              <div>
                <span className="customer-kicker">ORDER HISTORY</span>
                <h1>My orders</h1>
                <p>Track your submitted orders and their current processing status.</p>
              </div>
            </div>

            {!previewMode && orders.length > 0 && (
              <div
                className="customer-order-filters"
                aria-label="Filter orders by status"
              >
                {ORDER_STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={
                      orderFilter === filter.key
                        ? "customer-order-filter is-active"
                        : "customer-order-filter"
                    }
                    onClick={() => setOrderFilter(filter.key)}
                    aria-pressed={orderFilter === filter.key}
                  >
                    <strong>
                      {orderStatusCounts[filter.key] ?? 0}
                    </strong>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredOrders.length ? (
              <div className="customer-orders-list">
                {filteredOrders.map((order) => (
                  <article className="customer-order-card" key={order.order_id}>
                    <div className="customer-order-head">
                      <div>
                        <span>ORDER</span>
                        <h2>#{order.order_id}</h2>
                        <small>{new Date(order.order_date).toLocaleString()}</small>
                      </div>
                      <div className="customer-order-summary">
                        <strong>{money(order.total)}</strong>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    {order.delivery && (
                      <div className="customer-order-delivery">
                        <div>
                          <span>DELIVERY TO</span>
                          <strong>{order.delivery.full_name}</strong>
                          <small>
                            {order.delivery.contact_number}
                            {"\u00B7"}
                            {order.delivery.email}
                          </small>
                        </div>
                        <p>
                          {order.delivery.street_address}, {order.delivery.barangay},{" "}
                          {order.delivery.city_municipality}, {order.delivery.province}{" "}
                          {order.delivery.postal_code}
                        </p>
                        {order.delivery.delivery_notes && (
                          <small className="customer-delivery-note">
                            Note: {order.delivery.delivery_notes}
                          </small>
                        )}
                      </div>
                    )}

                    <div className="customer-order-items">
                      {(order.items ?? []).map((item) => (
                        <div className="customer-order-item" key={item.order_detail_id}>
                          <div>
                            <strong>{item.product_name}</strong>
                            <small>{item.sku}</small>
                          </div>
                          <span>{item.quantity} x {money(item.unit_price)}</span>
                          <strong>{money(item.line_total)}</strong>
                        </div>
                      ))}
                    </div>

                    <CustomerOrderReturnPanel
                      order={order}
                      previewMode={previewMode}
                    />
                  </article>
                ))}
              </div>
            ) : orders.length && !previewMode ? (
              <EmptyState
                title={`No ${ORDER_STATUS_FILTERS.find(
                  (item) => item.key === orderFilter
                )?.label.toLowerCase() ?? ""} orders`}
                text="Choose another order status to view your orders."
              />
            ) : (
              <EmptyState
                title={
                  previewMode
                    ? "Private order history protected"
                    : "No orders yet"
                }
                text={
                  previewMode
                    ? "This is the full customer interface, but Super Admin preview does not expose a specific customer's private order history."
                    : "Add products to your cart and place your first order."
                }
              />
            )}
          </section>
        )}
        {tab === "reviews" && (
          <CustomerReviewsPanel previewMode={previewMode} />
        )}
        {tab === "support" && (
          <CustomerSupportPanel
            previewMode={previewMode}
            products={products}
            orders={orders}
            onOpenProduct={openProduct}
            onOpenOrder={() => {
              setOrderFilter("ALL");
              changeTab("orders");
            }}
          />
        )}
        {tab === "account" && (
          <section className="customer-page-section">
            <div className="customer-page-title">
              <div>
                <span className="customer-kicker">MY ACCOUNT</span>
                <h1>Profile and security</h1>
                <p>{previewMode ? "Preview the customer account interface without changing or exposing a real customer account." : "Keep your customer information and password up to date."}</p>
              </div>
            </div>

            <div className="customer-account-grid">
              <form className="customer-account-card" onSubmit={saveProfile}>
                <div className="customer-card-heading">
                  <span><Icon name="user" size={19} /></span>
                  <div>
                    <h2>Account information</h2>
                    <p>Used for your customer profile and orders.</p>
                  </div>
                </div>

                <div className="customer-profile-photo-editor">
                  <ProfileAvatar user={user} className="customer-avatar-large" />
                  <div className="customer-profile-photo-copy">
                    <strong>Profile photo</strong>
                    <p>JPG, PNG, or WebP. Maximum 2 MB.</p>
                    <div className="customer-profile-photo-actions">
                      <label className={`customer-photo-button ${photoBusy ? "is-disabled" : ""}`}>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={changeProfilePhoto}
                          disabled={photoBusy || previewMode}
                        />
                        {photoBusy ? "Saving..." : user?.has_profile_photo ? "Change photo" : "Upload photo"}
                      </label>
                      {user?.has_profile_photo && (
                        <button
                          type="button"
                          className="customer-photo-remove"
                          onClick={removeProfilePhoto}
                          disabled={photoBusy || previewMode}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <label>
                  <span>Full name</span>
                  <input
                    required
                    value={profile.name}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  />
                </label>

                <label>
                  <span>Email address</span>
                  <input readOnly value={user?.email ?? ""} className="is-readonly" />
                  <small>Your verified email cannot be changed from this page.</small>
                </label>

                <label>
                  <span>Contact number</span>
                  <input
                    value={profile.contact_number}
                    onChange={(event) =>
                      setProfile({ ...profile, contact_number: event.target.value })
                    }
                  />
                </label>

                <button type="submit" className="customer-primary customer-full-button" disabled={busy}>
                  {busy ? "Saving..." : "Save profile"}
                </button>
              </form>

              <form className="customer-account-card" onSubmit={savePassword}>
                <div className="customer-card-heading">
                  <span><Icon name="check" size={19} /></span>
                  <div>
                    <h2>Change password</h2>
                    <p>Use a strong password you do not reuse elsewhere.</p>
                  </div>
                </div>

                <label>
                  <span>Current password</span>
                  <input
                    type="password"
                    required
                    value={password.current_password}
                    onChange={(event) =>
                      setPassword({ ...password, current_password: event.target.value })
                    }
                  />
                </label>

                <label>
                  <span>New password</span>
                  <input
                    type="password"
                    minLength={8}
                    required
                    value={password.password}
                    onChange={(event) =>
                      setPassword({ ...password, password: event.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    minLength={8}
                    required
                    value={password.password_confirmation}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        password_confirmation: event.target.value,
                      })
                    }
                  />
                </label>

                <button type="submit" className="customer-primary customer-full-button" disabled={busy}>
                  {busy ? "Updating..." : "Update password"}
                </button>
              </form>

              <form
                className="customer-account-card customer-delivery-profile-card"
                onSubmit={saveDeliveryAddress}
              >
                <div className="customer-card-heading">
                  <span><Icon name="home" size={19} /></span>
                  <div>
                    <h2>Delivery information</h2>
                    <p>Saved as your default address and automatically filled during checkout.</p>
                  </div>
                </div>

                <div className="customer-delivery-profile-grid">
                  <label className="customer-delivery-wide">
                    <span>Street address</span>
                    <input
                      required
                      maxLength={255}
                      value={deliveryProfile.street_address}
                      onChange={(event) =>
                        setDeliveryProfile({ ...deliveryProfile, street_address: event.target.value })
                      }
                      placeholder="House / unit number, street, subdivision"
                      disabled={previewMode}
                    />
                  </label>

                  <label>
                    <span>Barangay</span>
                    <input
                      required
                      maxLength={100}
                      value={deliveryProfile.barangay}
                      onChange={(event) =>
                        setDeliveryProfile({ ...deliveryProfile, barangay: event.target.value })
                      }
                      disabled={previewMode}
                    />
                  </label>

                  <label>
                    <span>City / Municipality</span>
                    <input
                      required
                      maxLength={100}
                      value={deliveryProfile.city_municipality}
                      onChange={(event) =>
                        setDeliveryProfile({ ...deliveryProfile, city_municipality: event.target.value })
                      }
                      disabled={previewMode}
                    />
                  </label>

                  <label>
                    <span>Province</span>
                    <input
                      required
                      maxLength={100}
                      value={deliveryProfile.province}
                      onChange={(event) =>
                        setDeliveryProfile({ ...deliveryProfile, province: event.target.value })
                      }
                      disabled={previewMode}
                    />
                  </label>

                  <label>
                    <span>Postal code</span>
                    <input
                      required
                      maxLength={20}
                      value={deliveryProfile.postal_code}
                      onChange={(event) =>
                        setDeliveryProfile({ ...deliveryProfile, postal_code: event.target.value })
                      }
                      disabled={previewMode}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="customer-primary customer-full-button"
                  disabled={busy || previewMode}
                >
                  {busy ? "Saving..." : "Save delivery information"}
                </button>
              </form>

              <div className="customer-account-card customer-session-card">
                <div className="customer-card-heading">
                  <span><Icon name="logout" size={19} /></span>
                  <div>
                    <h2>Session</h2>
                    <p>Sign out securely from this browser session.</p>
                  </div>
                </div>

                <div className="customer-session-user">
                  <ProfileAvatar user={user} className="customer-avatar-session" />
                  <div>
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="customer-danger-button"
                  onClick={logout}
                  disabled={busy}
                >
                  <Icon name="logout" size={18} />
                  Sign out
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}