import { backendUrl, loadCsrfToken } from "../../config/api.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../../css/shared/cinematic-customer.css";
import usePublicTheme from "../../hooks/usePublicTheme.js";
import PublicThemeSwitch from "../../components/shared/PublicThemeSwitch.jsx";
import CinematicReveal from "../../components/shared/CinematicReveal.jsx";
import {
  cartItemCount,
  readGuestCart,
  reconcileCartWithProducts,
  writeGuestCart,
} from "../../services/customer/cartStorage.js";

const Logo = backendUrl("/storage/site/Logo.png");
const mainpic = backendUrl("/storage/site/mainpic.jpg");

const services = [
  {
    title: "Portable AC Units",
    label: "COOLING",
    description: "Flexible room cooling for homes, offices, and compact spaces.",
    image: backendUrl("/storage/products/PortableAcUnits.jpg"),
  },
  {
    title: "Air Purifiers",
    label: "AIR QUALITY",
    description: "Cleaner indoor air for more comfortable everyday living.",
    image: backendUrl("/storage/products/AirPurifier.jpg"),
  },
  {
    title: "Replacement Filters",
    label: "FILTERS",
    description: "Essential replacement parts that keep air systems performing.",
    image: backendUrl("/storage/products/ReplacementFilter.webp"),
  },
  {
    title: "Smart Thermostats",
    label: "SMART HOME",
    description: "Connected temperature control designed around energy awareness.",
    image: backendUrl("/storage/products/SmartThermostat.jpg"),
  },
];

const fallbackProducts = [
  {
    product_id: "fallback-1",
    name: "Portable AC Pro",
    description: "Cool rooms fast and quietly",
    unit_price: 18500,
    image_url: backendUrl("/storage/products/PortableAcUnits.jpg"),
    available_stock: 30,
  },
  {
    product_id: "fallback-2",
    name: "Air Purifier Plus",
    description: "Cleaner indoor air",
    unit_price: 12900,
    image_url: backendUrl("/storage/products/AirPurifier.jpg"),
    available_stock: 50,
  },
  {
    product_id: "fallback-3",
    name: "Carbon Filter Pack",
    description: "High-efficiency replacement",
    unit_price: 2400,
    image_url: backendUrl("/storage/products/ReplacementFilter.webp"),
    available_stock: 100,
  },
  {
    product_id: "fallback-4",
    name: "Smart Thermostat",
    description: "Energy-saving control",
    unit_price: 8750,
    image_url: backendUrl("/storage/products/SmartThermostat.jpg"),
    available_stock: 20,
  },
];

function normalizeImagePath(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  if (value.startsWith("storage/")) {
    return backendUrl(`/${value}`);
  }

  if (value.startsWith("/")) {
    return backendUrl(value);
  }

  return backendUrl(`/storage/${value}`);
}

function normalizeProduct(product, index) {
  return {
    product_id:
      product.product_id ??
      product.id ??
      product.sku ??
      `product-${index}`,
    name: product.name ?? product.product_name ?? "Unnamed Product",
    description: product.description ?? "",
    unit_price: Number(
      product.unit_price ??
        product.price ??
        product.selling_price ??
        0,
    ),
    available_stock: Number(
      product.available_stock ??
        product.current_stock ??
        product.stock ??
        product.current_quantity ??
        0,
    ),
    image_url: normalizeImagePath(
      product.image_url ??
        product.image_path ??
        product.primary_image ??
        product.image,
    ),
  };
}

function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function LandingPage() {
  const { theme, toggleTheme } = usePublicTheme();
  const [cart, setCart] = useState(() => readGuestCart());
  const [products, setProducts] = useState(fallbackProducts);
  const [productsAreLive, setProductsAreLive] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(backendUrl("/api/public/website-content"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (active && payload) {
          setWebsiteContent(payload);
        }
      })
      .catch(() => {
        // The fallback copy keeps the public page usable if content API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(backendUrl("/api/session/status"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!cancelled && data?.authenticated) {
          setActiveSession(data);
        }
      })
      .catch(() => {
        // Public landing page remains usable when no session is active.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch(backendUrl("/api/store/products"), {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const payload = await response.json();
        const list = Array.isArray(payload)
          ? payload
          : payload.products ?? payload.data ?? [];

        if (active && Array.isArray(list) && list.length > 0) {
          const normalizedProducts = list.map(normalizeProduct);

          setProducts(normalizedProducts);
          setProductsAreLive(true);
          setCart((current) => {
            const reconciled = reconcileCartWithProducts(
              current,
              normalizedProducts,
            );
            writeGuestCart(reconciled);
            return reconciled;
          });
        }
      } catch {
        // Fallback cards keep the visual design available during API downtime.
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const cartCount = cartItemCount(cart);

  const activeDashboardPath =
    activeSession?.role === "super_admin"
      ? "/super-admin"
      : activeSession?.role === "System_User"
        ? "/user"
        : null;

  const activeDashboardLabel =
    activeSession?.role === "super_admin"
      ? "Back to Super Admin"
      : "Back to Account";

  const addToCart = (product) => {
    const productId = Number(product.product_id);
    const stock = Math.max(
      0,
      Math.floor(Number(product.available_stock) || 0),
    );

    if (
      !productsAreLive ||
      !Number.isInteger(productId) ||
      productId <= 0 ||
      stock <= 0
    ) {
      return;
    }

    setCart((current) => {
      const quantity = current[productId]?.quantity ?? 0;

      if (quantity >= stock) {
        return current;
      }

      const next = {
        ...current,
        [productId]: {
          product_id: productId,
          quantity: quantity + 1,
        },
      };

      writeGuestCart(next);
      return next;
    });
  };

  const handleNewsletter = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const email = String(
      new FormData(form).get("email") || "",
    ).trim();

    if (!email) return;

    try {
      setNewsletterBusy(true);
      setNewsletterMessage("");
      setNewsletterError(false);

      const token = await loadCsrfToken();

      const response = await fetch(
        backendUrl("/api/public/newsletter/subscribe"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token
              ? { "X-CSRF-TOKEN": token }
              : {}),
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to join email updates.",
        );
      }

      setNewsletterMessage(
        data.message ||
          "Subscribed. Check your email for confirmation.",
      );
      form.reset();
    } catch (error) {
      setNewsletterError(true);
      setNewsletterMessage(
        error.message ||
          "Unable to join email updates.",
      );
    } finally {
      setNewsletterBusy(false);
    }
  };

  return (
    <div className="wbo-cinematic" data-theme={theme}>
      <header className="cinematic-header">
        <Link to="/" className="cinematic-brand">
          <img src={Logo} alt="Walang Brown Out Logo" width="44" height="44" />
          <span>
            <small>HOME COMFORT TECHNOLOGY</small>
            <strong>WALANG BROWN OUT</strong>
          </span>
        </Link>

        <nav className="cinematic-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#solutions">Categories</a>
          <a href="#inventory">Products</a>
          <a href="#about">About</a>
          <Link to="/faq">FAQ</Link>
        </nav>

        <div className="cinematic-header-actions">
          <PublicThemeSwitch theme={theme} onToggle={toggleTheme} />

          {activeDashboardPath ? (
            <Link
              to={activeDashboardPath}
              className="cinematic-header-button is-primary"
            >
              {activeDashboardLabel}
            </Link>
          ) : (
            <>
              <Link to="/login" className="cinematic-header-button">
                Sign in
              </Link>

              <Link
                to="/signup"
                className="cinematic-header-button is-primary cinematic-header-signup"
              >
                Create account
              </Link>
            </>
          )}

          <span className="cinematic-cart-count" title="Guest cart items">
            Cart {cartCount}
          </span>
        </div>
      </header>

      <main>
        <section id="home" className="cinematic-hero">
          <div className="cinematic-hero-copy">
            <span className="cinematic-kicker">SMARTER EVERYDAY COMFORT</span>

            <h1>
              WALANG
              <br />
              <em>BROWNOUT.</em>
            </h1>

            <p>
              Discover cooling, cleaner air, and connected home-comfort
              products backed by live warehouse availability.
            </p>

            <div className="cinematic-hero-actions">
              <a href="#inventory" className="cinematic-primary-button">
                Explore products
                <span aria-hidden="true">→</span>
              </a>

              <a href="#solutions" className="cinematic-ghost-button">
                Discover categories
              </a>
            </div>

            <div className="cinematic-hero-metrics">
              <div>
                <strong>LIVE</strong>
                <span>Warehouse stock</span>
              </div>
              <div>
                <strong>OTP</strong>
                <span>Secure accounts</span>
              </div>
              <div>
                <strong>10</strong>
                <span>Operational roles</span>
              </div>
            </div>
          </div>

          <div className="cinematic-hero-media">
            <img
              src={mainpic}
              alt="Walang Brownout home comfort appliances"
              loading="eager"
              fetchPriority="high"
            />

            <div className="cinematic-hero-orbit" aria-hidden="true" />

            <div className="cinematic-floating-card">
              <span>REAL-TIME INVENTORY</span>
              <strong>Stock that reflects warehouse batches.</strong>
            </div>
          </div>

          <a href="#about" className="cinematic-scroll-cue">
            <span>Scroll to discover</span>
            <i aria-hidden="true">↓</i>
          </a>
        </section>

        {websiteContent?.about?.visible === false ? null : (
          <CinematicReveal
            as="section"
            id="about"
            className="cinematic-story-section"
          >
            <div className="cinematic-section-index">01</div>

            <div className="cinematic-story-copy">
              <span className="cinematic-kicker">THE WALANG BROWNOUT EXPERIENCE</span>
              <h2>
                {websiteContent?.about?.title ||
                  "Built for comfort. Powered by real operations."}
              </h2>
            </div>

            <div className="cinematic-story-description">
              <p>
                {websiteContent?.about?.description ||
                  "Walang BrownOut Appliances brings customer shopping together with live inventory, secure accounts, order processing, returns, and warehouse operations in one connected system."}
              </p>

              <span className="cinematic-story-line" />
            </div>
          </CinematicReveal>
        )}

        <section id="solutions" className="cinematic-section">
          <CinematicReveal className="cinematic-section-heading">
            <div>
              <span className="cinematic-kicker">EXPLORE OUR CATEGORIES</span>
              <h2>Comfort, designed around your space.</h2>
            </div>

            <p>
              Four focused product families keep discovery clear while the
              inventory system keeps availability current.
            </p>
          </CinematicReveal>

          <div className="cinematic-category-grid">
            {services.map((service, index) => (
              <CinematicReveal
                as="article"
                className="cinematic-category-card"
                delay={index * 90}
                key={service.title}
              >
                <img src={service.image} alt={service.title} loading="lazy" />

                <div className="cinematic-category-overlay">
                  <span>{service.label}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a href="#inventory" aria-label={`View ${service.title}`}>
                    Explore <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </CinematicReveal>
            ))}
          </div>
        </section>

        <section id="inventory" className="cinematic-section cinematic-products-section">
          <CinematicReveal className="cinematic-section-heading">
            <div>
              <span className="cinematic-kicker">FEATURED PRODUCTS</span>
              <h2>Products you can actually check against stock.</h2>
            </div>

            <p>
              Availability is loaded from the existing store API. Fallback
              cards are presentation-only when the backend is unavailable.
            </p>
          </CinematicReveal>

          <div className="cinematic-product-grid">
            {products.slice(0, 8).map((product, index) => (
              <CinematicReveal
                as="article"
                className="cinematic-product-card"
                delay={(index % 4) * 70}
                key={product.product_id}
              >
                <div className="cinematic-product-image">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  <span
                    className={`cinematic-stock-badge ${
                      product.available_stock > 0 ? "is-stocked" : "is-empty"
                    }`}
                  >
                    {product.available_stock > 0
                      ? `${product.available_stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>

                <div className="cinematic-product-copy">
                  <span>HOME COMFORT</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="cinematic-product-footer">
                    <strong>{formatPeso(product.unit_price)}</strong>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={
                        product.available_stock <= 0 || !productsAreLive
                      }
                    >
                      {!productsAreLive
                        ? "Preview"
                        : product.available_stock > 0
                          ? "Add to cart"
                          : "Unavailable"}
                    </button>
                  </div>
                </div>
              </CinematicReveal>
            ))}
          </div>
        </section>

        <CinematicReveal
          as="section"
          className="cinematic-feature-story"
        >
          <div className="cinematic-feature-number">LIVE</div>

          <div className="cinematic-feature-copy">
            <span className="cinematic-kicker">MORE THAN A STOREFRONT</span>
            <h2>
              What the customer sees is connected to what the business does.
            </h2>
          </div>

          <div className="cinematic-feature-list">
            <article>
              <span>01</span>
              <div>
                <strong>Real-time stock</strong>
                <p>Availability comes from current warehouse batch quantities.</p>
              </div>
            </article>

            <article>
              <span>02</span>
              <div>
                <strong>Secure accounts</strong>
                <p>Existing OTP and trusted-device security remain unchanged.</p>
              </div>
            </article>

            <article>
              <span>03</span>
              <div>
                <strong>Connected workflows</strong>
                <p>Orders, fulfillment, returns, and inventory stay synchronized.</p>
              </div>
            </article>
          </div>
        </CinematicReveal>

        <CinematicReveal as="section" className="cinematic-newsletter">
          <div>
            <span className="cinematic-kicker">STAY CONNECTED</span>
            <h2>Know what is coming next.</h2>
            <p>
              Join our email updates list and receive a confirmation through the existing Walang Brownout email service.
            </p>
          </div>

          <div className="cinematic-newsletter-form">
            <form onSubmit={handleNewsletter}>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                required
                disabled={newsletterBusy}
              />

              <button
                type="submit"
                disabled={newsletterBusy}
              >
                {newsletterBusy ? "Joining..." : "Join now"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {newsletterMessage ? (
              <p
                className={`cinematic-newsletter-message ${
                  newsletterError ? "is-error" : ""
                }`}
                role="status"
              >
                {newsletterMessage}
              </p>
            ) : null}
          </div>
        </CinematicReveal>
      </main>

      <footer className="cinematic-footer">
        <div className="cinematic-footer-brand">
          <img src={Logo} alt="" width="42" height="42" />
          <div>
            <strong>WALANG BROWN OUT</strong>
            <span>Smart comfort. Real operations.</span>
          </div>
        </div>

        <div className="cinematic-footer-links">
          <a href="#solutions">Categories</a>
          <a href="#inventory">Products</a>
          <Link to="/faq">FAQ</Link>
          <Link to="/login">Sign in</Link>
        </div>

        <span>© 2026 WalangBrownOut.</span>
      </footer>
    </div>
  );
}

export default LandingPage;
