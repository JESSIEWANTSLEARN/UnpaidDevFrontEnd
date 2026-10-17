// Catalog controls use only fields returned by the existing product API.
export const productCategory = (product) => String(product.category ?? "").trim() || "Uncategorized";

export function catalogCategories(products) {
  const counts = new Map();
  products.forEach((product) => {
    const name = productCategory(product);
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return [...counts].sort(([a], [b]) => a.localeCompare(b));
}

export function filterCatalog(products, { search = "", category = "All", stock = "all", min = "", max = "", sort = "default" } = {}) {
  const query = search.trim().toLowerCase();
  const matches = products.filter((product) => {
    const price = Number(product.unit_price);
    const available = Number(product.available_stock) > 0;
    return (category === "All" || productCategory(product) === category)
      && (!query || [product.name, product.sku, product.description].some((value) => String(value ?? "").toLowerCase().includes(query)))
      && (stock === "all" || (stock === "in" ? available : !available))
      && (min === "" || (Number.isFinite(price) && price >= Number(min)))
      && (max === "" || (Number.isFinite(price) && price <= Number(max)));
  });
  if (sort === "price-asc") matches.sort((a, b) => Number(a.unit_price) - Number(b.unit_price));
  if (sort === "price-desc") matches.sort((a, b) => Number(b.unit_price) - Number(a.unit_price));
  if (sort === "name") matches.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  return matches;
}

export function validatePriceRange(min, max) {
  const valid = (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0);
  if (!valid(min) || !valid(max)) return "Enter a valid price of zero or more.";
  if (min !== "" && max !== "" && Number(min) > Number(max)) return "Minimum price must not exceed maximum price.";
  return "";
}
