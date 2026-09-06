// Customer-store formatting and normalization helpers.

export const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

const imagePath = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("/storage/")) return value;
  if (value.startsWith("storage/")) return `/${value}`;
  if (value.startsWith("/")) return value;
  return `/storage/${value}`;
};

export const normalizeProduct = (product, index) => ({
  product_id: Number(product.product_id ?? product.id ?? index),
  sku: product.sku ?? "",
  name: product.name ?? "Product",
  description: product.description ?? "",
  category: product.category ?? "General",
  unit_price: Number(product.unit_price ?? product.price ?? 0),
  available_stock: Number(product.available_stock ?? product.total_stock ?? product.stock ?? 0),
  image_url: imagePath(product.image_url ?? product.image_path ?? product.primary_image ?? product.image),
});

export const ORDER_STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "FULFILLED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export function orderMatchesFilter(status, filter) {
  const normalized = String(status || "").toUpperCase();

  if (filter === "ALL") return true;

  if (filter === "PROCESSING") {
    return normalized === "PROCESSING" || normalized === "CONFIRMED";
  }

  return normalized === filter;
}
