import { backendUrl, loadCsrfToken } from "../../config/api.js";
import React, { useEffect, useMemo, useState } from "react";
import { CustomerStoreSkeleton } from "../../components/customer/shell/CustomerLoadingSkeletons.jsx";
import { useNavigate } from "react-router-dom";
import CustomerCheckoutModal from "../../components/customer/checkout/CustomerCheckoutModal.jsx";
import CustomerHeader from "../../components/customer/shell/CustomerHeader.jsx";
import CustomerMainViews from "../../components/customer/shell/CustomerMainViews.jsx";
import CustomerOverlays from "../../components/customer/shell/CustomerOverlays.jsx";
import {
  normalizeProduct,
  ORDER_STATUS_FILTERS,
  orderMatchesFilter,
} from "../../utils/customer/customerStoreUtils.js";

import {
  cartItemCount,
  clearGuestCart,
  mergeCartsWithProducts,
  readGuestCart,
  readUserCart,
  writeUserCart,
} from "../../services/customer/cartStorage.js";

import "../../../css/customer/image-hover-effects.css";
import "../../../css/customer/system-user-base.css";
import "../../../css/customer/system-user-layout.css";
import "../../../css/customer/system-user-sections.css";
import "../../../css/customer/system-user-responsive.css";
import "../../../css/customer/preview.css";
import "../../../css/customer/checkout.css";
import "../../../css/customer/cart-feedback.css";
import "../../../css/customer/notifications.css";
import "../../../css/customer/orders.css";
import "../../../css/customer/wallet.css";
import "../../../css/customer/order-actions.css";

const THEME_KEY = "wbo_customer_theme_v1";

export default function SystemUser({ previewMode = false }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [walletData, setWalletData] = useState({
    wallet: {
      balance: "0.00",
      status: "ACTIVE",
    },
    transactions: [],
  });
  const [walletBusy, setWalletBusy] = useState(false);
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [profile, setProfile] = useState({ name: "", contact_number: "" });
  const [deliveryProfile, setDeliveryProfile] = useState({
    street_address: "",
    barangay: "",
    city_municipality: "",
    province: "",
    postal_code: "",
  });
  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [checkoutToken, setCheckoutToken] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [paymentReference, setPaymentReference] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [cartAddedId, setCartAddedId] = useState(null);
  const [cartShakeId, setCartShakeId] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    street_address: "",
    barangay: "",
    city_municipality: "",
    province: "",
    postal_code: "",
    delivery_notes: "",
  });

  const api = async (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const method = String(options.method || "GET").toUpperCase();
    const token =
      method !== "GET" && method !== "HEAD"
        ? await loadCsrfToken()
        : "";

    const response = await fetch(backendUrl(url), {
      credentials: "include",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
        ...(options.headers ?? {}),
      },
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (response.status === 401 || response.status === 403) {
      navigate("/login");
      throw new Error(data.message || "Please log in again.");
    }

    if (!response.ok || data.success === false) {
      const validation = data.errors ? Object.values(data.errors).flat()[0] : null;
      throw new Error(validation || data.message || "Request failed.");
    }

    return data;
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      if (previewMode) {
        const productData = await api("/api/store/products");

        const list = Array.isArray(productData)
          ? productData
          : productData.products ?? productData.data ?? [];

        const normalizedProducts = list.map(normalizeProduct);

        const previewUser = {
          user_id: 0,
          name: "Customer Preview",
          email: "Private customer data hidden",
          contact_number: "",
          has_profile_photo: false,
          profile_photo_version: null,
        };

        setUser(previewUser);
        setProfile({
          name: previewUser.name,
          contact_number: "",
        });
        setCheckoutForm((current) => ({
          ...current,
          full_name: previewUser.name,
          email: previewUser.email,
          contact_number: "",
        }));
        setStats({
          total_orders: 0,
          fulfilled_orders: 0,
        });
        setProducts(normalizedProducts);
        setOrders([]);
        // Preview wallet uses sample zero-balance data and disables changes.
        setWalletData({
          wallet: {
            balance: "0.00",
            status: "ACTIVE",
          },
          transactions: [],
        });
        setCart({});
        return;
      }

      const [
        me,
        productData,
        orderData,
        notificationData,
      ] = await Promise.all([
        api("/api/user/me"),
        api("/api/store/products"),
        api("/api/user/orders"),
        api("/api/user/notifications"),
      ]);

      setUser(me.user);
      setStats(me.stats ?? {});
      setProfile({
        name: me.user?.name ?? "",
        contact_number: me.user?.contact_number ?? "",
      });

      const savedDelivery = me.delivery_address ?? {
        street_address: "",
        barangay: "",
        city_municipality: "",
        province: "",
        postal_code: "",
      };

      setDeliveryProfile(savedDelivery);
      setCheckoutForm((current) => ({
        ...current,
        full_name: me.user?.name ?? "",
        email: me.user?.email ?? "",
        contact_number: me.user?.contact_number ?? "",
        ...savedDelivery,
      }));

      const list = Array.isArray(productData)
        ? productData
        : productData.products ?? productData.data ?? [];

      const normalizedProducts = list.map(normalizeProduct);
      const userId = Number(me.user?.user_id);
      const guestCart = readGuestCart();
      const savedUserCart = readUserCart(userId);
      const mergedCart = mergeCartsWithProducts(
        normalizedProducts,
        savedUserCart,
        guestCart
      );
      const importedGuestCount = cartItemCount(guestCart);

      setProducts(normalizedProducts);
      setCart(mergedCart);
      setOrders(orderData.orders ?? []);
      setNotifications(
        notificationData.notifications ?? []
      );
      try {
        const walletDataResponse =
          await api("/api/user/wallet");

        setWalletData({
          wallet: walletDataResponse.wallet ?? {
            balance: "0.00",
            status: "ACTIVE",
          },
          transactions:
            walletDataResponse.transactions ?? [],
        });
      } catch (walletError) {
        console.warn(
          "Wallet unavailable:",
          walletError.message
        );
      }

      if (Number.isInteger(userId) && userId > 0) {
        writeUserCart(userId, mergedCart);
      }

      if (importedGuestCount > 0) {
        clearGuestCart();
        setNotice(`${importedGuestCount} guest cart item(s) moved into your account.`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (previewMode) return undefined;

    let cancelled = false;

    const refreshCustomerNotifications =
      async () => {
        try {
          const data = await api(
            "/api/user/notifications"
          );

          if (!cancelled) {
            setNotifications(
              data.notifications ?? []
            );
          }
        } catch {
          // Main session handling already manages auth failures.
        }
      };

    const timer = window.setInterval(
      refreshCustomerNotifications,
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [previewMode]);

  useEffect(() => {
    const userId = Number(user?.user_id);
    if (!Number.isInteger(userId) || userId <= 0) return;
    writeUserCart(userId, cart);
  }, [cart, user?.user_id]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2800);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!cartPulse) return;
    const timer = setTimeout(() => setCartPulse(false), 450);
    return () => clearTimeout(timer);
  }, [cartPulse]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter((value) => Boolean(value))
      ),
    ],
    [products]
  );

  const categoryCards = useMemo(
    () =>
      categories
        .filter((item) => item !== "All")
        .slice(0, 4)
        .map((item) => ({
          name: item,
          product: products.find((product) => product.category === item),
          count: products.filter((product) => product.category === item).length,
        })),
    [categories, products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  const orderStatusCounts = useMemo(
    () =>
      Object.fromEntries(
        ORDER_STATUS_FILTERS.map((filter) => [
          filter.key,
          orders.filter((order) =>
            orderMatchesFilter(order.status, filter.key)
          ).length,
        ])
      ),
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        orderMatchesFilter(order.status, orderFilter)
      ),
    [orders, orderFilter]
  );

  const cartItems = useMemo(
    () =>
      Object.values(cart)
        .map((entry) => {
          const product = products.find((p) => p.product_id === entry.product_id);
          return product
            ? {
                ...product,
                quantity: entry.quantity,
                line_total: product.unit_price * entry.quantity,
              }
            : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartCount = cartItemCount(cart);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.line_total,
    0
  );

  const unreadNotificationCount =
    notifications.filter(
      (item) => item.status === "UNREAD"
    ).length;

  const readNotification = async (
    notificationId
  ) => {
    if (previewMode) return;

    setNotifications((current) =>
      current.map((item) =>
        item.notification_id === notificationId
          ? {
              ...item,
              status: "ACKNOWLEDGED",
            }
          : item
      )
    );

    try {
      await api(
        `/api/user/notifications/${notificationId}/read`,
        {
          method: "PUT",
          body: "{}",
        }
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const readAllNotifications = async () => {
    if (
      previewMode ||
      unreadNotificationCount === 0
    ) {
      return;
    }

    try {
      setNotificationBusy(true);

      await api(
        "/api/user/notifications/read-all",
        {
          method: "PUT",
          body: "{}",
        }
      );

      setNotifications((current) =>
        current.map((item) =>
          item.status === "UNREAD"
            ? {
                ...item,
                status: "ACKNOWLEDGED",
              }
            : item
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setNotificationBusy(false);
    }
  };

  const cancelOrder = async (orderId, reason) => {
    if (previewMode) return false;

    try {
      setBusy(true);
      setError("");

      const result = await api(
        `/api/user/orders/${orderId}/cancel`,
        {
          method: "PUT",
          body: JSON.stringify({ reason }),
        },
      );

      const [
        orderData,
        notificationData,
        me,
        refreshedWallet,
      ] = await Promise.all([
        api("/api/user/orders"),
        api("/api/user/notifications"),
        api("/api/user/me"),
        api("/api/user/wallet"),
      ]);

      setOrders(orderData.orders ?? []);
      setNotifications(
        notificationData.notifications ?? [],
      );
      setStats(me.stats ?? {});

      setWalletData({
        wallet: refreshedWallet.wallet ?? {
          balance: "0.00",
          status: "ACTIVE",
        },
        transactions:
          refreshedWallet.transactions ?? [],
      });

      setNotice(
        result.message ||
          `Order #${orderId} cancelled.`,
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  };


  const topUpWallet = async (payload) => {
    if (previewMode) {
      setNotice(
        "Preview mode: wallet top-up is disabled.",
      );
      return false;
    }

    try {
      setWalletBusy(true);
      setError("");

      const result = await api(
        "/api/user/wallet/top-up",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      const [
        refreshedWallet,
        refreshedNotifications,
      ] = await Promise.all([
        api("/api/user/wallet"),
        api("/api/user/notifications"),
      ]);

      setWalletData({
        wallet: refreshedWallet.wallet ?? {
          balance: "0.00",
          status: "ACTIVE",
        },
        transactions:
          refreshedWallet.transactions ?? [],
      });

      setNotifications(
        refreshedNotifications.notifications ?? [],
      );

      setNotice(
        result.message ||
          "Wallet top-up completed.",
      );

      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setWalletBusy(false);
    }
  };

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseCategory = (nextCategory) => {
    setCategory(nextCategory);
    setTab("shop");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setTab("shop");
    setMobileOpen(false);
  };

  const showCartFeedback = (type, message, productId = null) => {
    const feedback = { type, message, key: Date.now() };
    setCartFeedback(feedback);

    window.setTimeout(() => {
      setCartFeedback((current) =>
        current?.key === feedback.key ? null : current
      );
    }, 2800);

    if (type === "success" && productId) {
      setCartAddedId(productId);
      window.setTimeout(() => {
        setCartAddedId((current) => current === productId ? null : current);
      }, 700);
    }

    if (type === "warning" && productId) {
      setCartShakeId(productId);
      window.setTimeout(() => {
        setCartShakeId((current) => current === productId ? null : current);
      }, 650);
    }
  };

  const addToCart = (product) => {
    const stock = Math.max(0, Number(product.available_stock || 0));
    const currentQty = Number(cart[product.product_id]?.quantity ?? 0);

    if (stock <= 0) {
      showCartFeedback(
        "warning",
        `${product.name} is currently out of stock.`,
        product.product_id,
      );
      return;
    }

    if (currentQty >= stock) {
      showCartFeedback(
        "warning",
        `You reached the ${stock}-unit stock limit for ${product.name}.`,
        product.product_id,
      );
      return;
    }

    setCart((current) => {
      const latestQty = Number(current[product.product_id]?.quantity ?? 0);

      return {
        ...current,
        [product.product_id]: {
          product_id: product.product_id,
          quantity: Math.min(latestQty + 1, stock),
        },
      };
    });

    showCartFeedback(
      "success",
      `${product.name} successfully added to your cart.`,
      product.product_id,
    );

    setCartPulse(false);
    requestAnimationFrame(() => setCartPulse(true));
  };

  const setQty = (id, qty) => {
    const product = products.find((p) => p.product_id === id);

    if (product && qty > product.available_stock) {
      showCartFeedback(
        "warning",
        `Maximum available quantity for ${product.name} is ${product.available_stock}.`,
        id,
      );
      return;
    }

    setCart((current) => {
      const copy = { ...current };

      if (qty <= 0) {
        delete copy[id];
      } else {
        copy[id] = { product_id: id, quantity: qty };
      }

      return copy;
    });
  };

  const startCheckout = () => {
    if (!cartItems.length) return;

    setCheckoutForm((current) => ({
      ...current,
      full_name: user?.name ?? current.full_name,
      email: user?.email ?? current.email,
      contact_number: user?.contact_number ?? current.contact_number,
      street_address:
        deliveryProfile.street_address || current.street_address,
      barangay:
        deliveryProfile.barangay || current.barangay,
      city_municipality:
        deliveryProfile.city_municipality || current.city_municipality,
      province:
        deliveryProfile.province || current.province,
      postal_code:
        deliveryProfile.postal_code || current.postal_code,
    }));

    setPaymentMethod("CASH_ON_DELIVERY");
    setPaymentReference("");
    setCheckoutToken(
      window.crypto?.randomUUID?.() ??
        `wbo-checkout-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,
    );
    setPlacedOrder(null);
    setCheckoutStep("details");
    setError("");
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    if (busy) return;
    setCheckoutOpen(false);
    setCheckoutStep("details");
    setPlacedOrder(null);
    setError("");
  };

  const reviewCheckout = (event) => {
    event.preventDefault();
    setError("");
    setCheckoutStep("payment");
  };

  const reviewPayment = () => {
    setError("");

    if (
      !["CASH_ON_DELIVERY", "WALLET"].includes(
        paymentMethod,
      ) &&
      !paymentReference.trim()
    ) {
      setError(
        "Generate or enter a demo payment reference before continuing.",
      );
      return;
    }

    if (
      paymentMethod === "WALLET" &&
      Number(walletData?.wallet?.balance || 0) + 0.00001 <
        Number(cartTotal || 0)
    ) {
      setError(
        "Insufficient wallet balance. Open Wallet and top up before continuing.",
      );
      return;
    }

    setCheckoutStep("summary");
  };

  const checkout = async () => {
    if (!cartItems.length) return;

    if (previewMode) {
      setPlacedOrder({
        order_id: "PREVIEW",
        total_amount: cartTotal,
        payment_method: paymentMethod,
        payment_status: "PREVIEW ONLY",
      });
      setCheckoutStep("success");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const data = await api("/api/user/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          delivery: {
            full_name: checkoutForm.full_name,
            contact_number: checkoutForm.contact_number,
            street_address: checkoutForm.street_address,
            barangay: checkoutForm.barangay,
            city_municipality: checkoutForm.city_municipality,
            province: checkoutForm.province,
            postal_code: checkoutForm.postal_code,
            delivery_notes: checkoutForm.delivery_notes,
          },
          payment_method: paymentMethod,
          payment_reference_number:
            ["CASH_ON_DELIVERY", "WALLET"].includes(
              paymentMethod,
            )
              ? null
              : paymentReference.trim(),
          checkout_token: checkoutToken || null,
        }),
      });

      setCart({});

      if (user?.user_id) {
        writeUserCart(user.user_id, {});
      }

      setCartOpen(false);
      setPlacedOrder({
        order_id: data.order_id,
        total_amount: data.total_amount ?? cartTotal,
        payment_method:
          data.payment?.payment_method ?? paymentMethod,
        payment_status:
          data.payment?.payment_status ?? "PENDING",
        payment_reference_number: data.payment?.reference_number ?? paymentReference.trim(),
      });
      setCheckoutStep("success");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (previewMode) {
      setNotice("Preview mode: profile changes are disabled.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const data = await api("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      setUser((current) => ({ ...current, ...data.user }));
      setNotice(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveDeliveryAddress = async (event) => {
    event.preventDefault();

    if (previewMode) {
      setNotice("Preview mode: delivery information changes are disabled.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const data = await api("/api/user/delivery-address", {
        method: "PUT",
        body: JSON.stringify(deliveryProfile),
      });

      setDeliveryProfile(data.delivery_address ?? deliveryProfile);
      setCheckoutForm((current) => ({
        ...current,
        ...(data.delivery_address ?? deliveryProfile),
      }));
      setNotice(data.message || "Delivery information saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const changeProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (previewMode) {
      setNotice("Preview mode: profile photo changes are disabled.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Profile photo must be a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be 2 MB or smaller.");
      return;
    }

    try {
      setPhotoBusy(true);
      setError("");

      const formData = new FormData();
      formData.append("photo", file);

      const data = await api("/api/user/profile-photo", {
        method: "POST",
        body: formData,
      });

      setUser((current) => ({
        ...current,
        has_profile_photo: true,
        profile_photo_version: data.profile_photo_version ?? Date.now(),
      }));
      setNotice(data.message || "Profile photo updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (previewMode) {
      setNotice("Preview mode: profile photo removal is disabled.");
      return;
    }

    if (!user?.has_profile_photo) return;

    try {
      setPhotoBusy(true);
      setError("");

      const data = await api("/api/user/profile-photo", {
        method: "DELETE",
      });

      setUser((current) => ({
        ...current,
        has_profile_photo: false,
        profile_photo_version: null,
      }));
      setNotice(data.message || "Profile photo removed.");
    } catch (e) {
      setError(e.message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();

    if (previewMode) {
      setNotice("Preview mode: password changes are disabled.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const data = await api("/api/user/password", {
        method: "PUT",
        body: JSON.stringify(password),
      });

      setPassword({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setNotice(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    if (previewMode) {
      window.location.href = "/super-admin";
      return;
    }

    window.dispatchEvent(
      new Event("wbo:logout-started"),
    );

    try {
      setBusy(true);
      const data = await api("/logout", { method: "POST", body: "{}" });
      window.location.href = data.redirect || "/login";
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const nav = [
    ["dashboard", "Home", "home"],
    ["shop", "Products", "products"],
    ["orders", "Orders", "orders"],
    ["reviews", "Reviews", "products"],
    ["support", "Support", "chat"],
    ["wallet", "Wallet", "wallet"],
    ["account", "Account", "user"],
  ];

  if (loading) {
    return <CustomerStoreSkeleton theme={theme} />;
  }

  return (
    <div className="customer-shell app-page-enter" data-theme={theme}>
      <CustomerHeader ctx={{ previewMode, mobileOpen, setMobileOpen, nav, tab, changeTab, handleSearch, search, setSearch, unreadNotificationCount, setNotificationOpen, notificationOpen, readAllNotifications, notificationBusy, notifications, readNotification, setTheme, theme, cartPulse, setCartOpen, cartCount, logout, busy, error, setError }} />


            <CustomerMainViews ctx={{ tab, products, stats, categoryCards, changeTab, chooseCategory, addToCart, setCart, setCartOpen, showCartFeedback, setCartPulse, cartAddedId, cartShakeId, filteredProducts, search, setSearch, handleSearch, categories, category, setCategory, orderFilter, orderStatusCounts, setOrderFilter, filteredOrders, orders, cancelOrder, walletData, walletBusy, topUpWallet, previewMode, saveProfile, user, profile, setProfile, busy, photoBusy, changeProfilePhoto, removeProfilePhoto, password, setPassword, savePassword, deliveryProfile, setDeliveryProfile, saveDeliveryAddress, logout }} />

      <CustomerOverlays ctx={{ notice, cartFeedback, checkoutOpen, checkoutStep, setCheckoutStep, closeCheckout, busy, error, setError, reviewCheckout, checkoutForm, setCheckoutForm, setCheckoutOpen, setCartOpen, paymentMethod, setPaymentMethod, paymentReference, setPaymentReference, reviewPayment, cartItems, cartTotal, walletData, checkout, previewMode, placedOrder, setTab, setNotice, cartOpen, cartCount, setQty, startCheckout }} />
    </div>
  );
}
