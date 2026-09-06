// Shared API client for staff role dashboards.

const csrfToken = () =>
  document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content") ?? "";

const errorMessage = (payload, fallback) => {
  const validation = Object.values(
    payload?.errors || {},
  )
    .flat()
    .find(Boolean);

  return (
    validation ||
    payload?.message ||
    fallback
  );
};

async function request(url, options = {}) {
  const method = options.method || "GET";

  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(method !== "GET"
        ? {
            "Content-Type":
              "application/json",
            "X-CSRF-TOKEN":
              csrfToken(),
          }
        : {}),
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const payload = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      errorMessage(
        payload,
        "The role dashboard request failed.",
      ),
    );

    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

const SALES_ROLES = new Set([
  "Sales_Manager",
  "Sales_Staff",
]);

export const loadRoleDashboard = (
  roleKey,
  previewMode = false,
) => {
  const query =
    previewMode ? "?preview=1" : "";

  const base = SALES_ROLES.has(roleKey)
    ? "/api/sales-role"
    : "/api/role-dashboard";

  return request(
    `${base}/${encodeURIComponent(roleKey)}${query}`,
  );
};

export const roleStockIn = (form) =>
  request("/api/role-dashboard/stock-in", {
    method: "POST",
    body: form,
  });

export const roleAdjustStock = (form) =>
  request(
    "/api/role-dashboard/adjust-stock",
    {
      method: "POST",
      body: form,
    },
  );

export const roleCreateSupplier = (form) =>
  request(
    "/api/role-dashboard/suppliers",
    {
      method: "POST",
      body: form,
    },
  );

export const roleUpdateSupplier = (
  supplierId,
  form,
) =>
  request(
    `/api/role-dashboard/suppliers/${supplierId}`,
    {
      method: "PUT",
      body: form,
    },
  );

export const roleCreatePurchaseOrder = (
  form,
) =>
  request(
    "/api/role-dashboard/purchase-orders",
    {
      method: "POST",
      body: form,
    },
  );

export const roleUpdatePurchaseOrderStatus = (
  poId,
  action,
) =>
  request(
    `/api/role-dashboard/purchase-orders/${poId}/status`,
    {
      method: "PUT",
      body: { action },
    },
  );

export const roleUpdateSalesOrderStatus = (
  orderId,
  action,
) =>
  request(
    `/api/sales-role/orders/${orderId}/status`,
    {
      method: "PUT",
      body: { action },
    },
  );