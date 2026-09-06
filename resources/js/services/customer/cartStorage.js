const GUEST_CART_KEY = "wbo_guest_cart_v1";
const USER_CART_PREFIX = "wbo_user_cart_v1:";

function safeProductId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function safeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
}

function sanitizeCart(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const clean = {};

  Object.entries(value).forEach(([key, entry]) => {
    const productId = safeProductId(entry?.product_id ?? key);
    const quantity = safeQuantity(entry?.quantity);

    if (!productId || quantity <= 0) return;

    clean[productId] = {
      product_id: productId,
      quantity,
    };
  });

  return clean;
}

function readStoredCart(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? sanitizeCart(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function writeStoredCart(key, cart) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(sanitizeCart(cart))
    );
  } catch {
    // Cart remains usable in memory when localStorage is unavailable.
  }
}

function userCartKey(userId) {
  const id = safeProductId(userId);
  return id ? `${USER_CART_PREFIX}${id}` : null;
}

export function readGuestCart() {
  return readStoredCart(GUEST_CART_KEY);
}

export function writeGuestCart(cart) {
  writeStoredCart(GUEST_CART_KEY, cart);
}

export function clearGuestCart() {
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function readUserCart(userId) {
  const key = userCartKey(userId);
  return key ? readStoredCart(key) : {};
}

export function writeUserCart(userId, cart) {
  const key = userCartKey(userId);
  if (key) writeStoredCart(key, cart);
}

export function cartItemCount(cart) {
  return Object.values(sanitizeCart(cart)).reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function reconcileCartWithProducts(cart, products) {
  const source = sanitizeCart(cart);
  const productMap = new Map(
    (Array.isArray(products) ? products : [])
      .map((product) => {
        const id = safeProductId(product?.product_id);
        return id ? [id, product] : null;
      })
      .filter(Boolean)
  );

  const reconciled = {};

  Object.values(source).forEach((entry) => {
    const product = productMap.get(entry.product_id);
    if (!product) return;

    const stock = Math.max(
      0,
      Math.floor(Number(product.available_stock) || 0)
    );

    if (stock <= 0) return;

    const quantity = Math.min(entry.quantity, stock);

    if (quantity > 0) {
      reconciled[entry.product_id] = {
        product_id: entry.product_id,
        quantity,
      };
    }
  });

  return reconciled;
}

export function mergeCartsWithProducts(products, ...carts) {
  const merged = {};

  carts.forEach((cart) => {
    Object.values(sanitizeCart(cart)).forEach((entry) => {
      const previous = merged[entry.product_id]?.quantity ?? 0;

      merged[entry.product_id] = {
        product_id: entry.product_id,
        quantity: previous + entry.quantity,
      };
    });
  });

  return reconcileCartWithProducts(merged, products);
}
