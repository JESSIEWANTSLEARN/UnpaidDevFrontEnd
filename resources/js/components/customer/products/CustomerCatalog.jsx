import { useEffect, useMemo, useState } from "react";
import { backendUrl } from "../../../config/api.js";
import { Icon } from "../CustomerUi.jsx";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import { catalogCategories, filterCatalog, productCategory, validatePriceRange } from "../../../utils/customer/catalogFilters.mjs";
import "../../../../css/customer/customer-catalog.css";

const PAGE_SIZE = 12;

function CatalogCard({ product, onOpen, onAdd, added, limited }) {
  const [failedImage, setFailedImage] = useState(null);
  const inStock = Number(product.available_stock) > 0;
  return (
    <article className="wbo-shop-card">
      <button type="button" className="wbo-shop-image" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
        {product.image_url && failedImage !== product.image_url ? (
          <img src={backendUrl(product.image_url)} alt="" loading="lazy" onError={() => setFailedImage(product.image_url)} />
        ) : <span className="wbo-shop-placeholder"><Icon name="products" size={36} /><small>No image available</small></span>}
      </button>
      <div className="wbo-shop-card-body">
        <span className="wbo-shop-category-label">{productCategory(product)}</span>
        <h2><button type="button" onClick={() => onOpen(product)}>{product.name}</button></h2>
        <span className="wbo-shop-sku">SKU: {product.sku || "—"}</span>
        <strong className="wbo-shop-price">{money(product.unit_price)}</strong>
        <span className={`wbo-shop-stock ${inStock ? "" : "is-out"}`}>{inStock ? `${product.available_stock} in stock` : "Out of stock"}</span>
        <button type="button" className="wbo-shop-add" disabled={!inStock} onClick={() => onAdd(product)}>
          <Icon name={added ? "check" : "cart"} size={17} />
          {!inStock ? "Unavailable" : added ? "Added!" : limited ? "Stock limit reached" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export default function CustomerCatalog({ products, search, setSearch, category, setCategory, onOpen, onAdd, cartAddedId, cartShakeId }) {
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("default");
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [range, setRange] = useState({ min: "", max: "" });
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({ key: "", page: 1 });
  const categories = useMemo(() => catalogCategories(products), [products]);
  const results = useMemo(() => filterCatalog(products, { search, category, stock, sort, ...range }), [products, search, category, stock, sort, range]);
  const filterKey = JSON.stringify([search, category, stock, sort, range.min, range.max]);
  useEffect(() => {
    setPagination({ key: filterKey, page: 1 });
  }, [filterKey]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = pagination.key === filterKey ? Math.min(pagination.page, pages) : 1;
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(search || category !== "All" || stock !== "all" || range.min !== "" || range.max !== "");
  const clearPrice = () => { setRange({ min: "", max: "" }); setDraftMin(""); setDraftMax(""); setError(""); };
  const reset = () => { setSearch(""); setCategory("All"); setStock("all"); setSort("default"); clearPrice(); };
  const changePage = (next) => {
    setPagination({ key: filterKey, page: next });
    document.getElementById("wbo-shop-results")?.scrollIntoView({ block: "start" });
  };

  return (
    <section className="wbo-shop" aria-labelledby="wbo-shop-title">
      <header className="wbo-shop-heading">
        <div><span className="customer-kicker">PRODUCT CATALOG</span><h1 id="wbo-shop-title">Find your home essentials</h1><p>Browse products, compare prices, and find what is in stock.</p></div>
      </header>
      <div className="wbo-shop-layout">
        <aside className="wbo-shop-sidebar" aria-label="Product filters">
          <button type="button" className="wbo-shop-filter-toggle" aria-expanded={filtersOpen} aria-controls="wbo-shop-filters" onClick={() => setFiltersOpen(!filtersOpen)}>Filters <span>{filtersOpen ? "−" : "+"}</span></button>
          <div id="wbo-shop-filters" className={`wbo-shop-filter-content ${filtersOpen ? "is-open" : ""}`}>
            <div className="wbo-shop-filter-heading"><h2>Filters</h2><button type="button" onClick={reset}>Reset all</button></div>
            <fieldset><legend>Product categories</legend>
              <label className="wbo-shop-choice"><input type="radio" name="catalog-category" checked={category === "All"} onChange={() => setCategory("All")} /><span>All products</span><small>{products.length}</small></label>
              {categories.map(([name, count]) => <label className="wbo-shop-choice" key={name}><input type="radio" name="catalog-category" checked={category === name} onChange={() => setCategory(name)} /><span>{name}</span><small>{count}</small></label>)}
              {!products.length && <p className="wbo-shop-hint">Categories appear when products are available.</p>}
            </fieldset>
            <form onSubmit={(event) => {
              event.preventDefault();
              const message = validatePriceRange(draftMin, draftMax);
              setError(message);
              if (!message) setRange({ min: draftMin, max: draftMax });
            }}>
              <fieldset><legend>Price range (₱)</legend><div className="wbo-shop-price-fields">
                <label>Minimum<input type="number" min="0" step="0.01" inputMode="decimal" value={draftMin} onChange={(event) => setDraftMin(event.target.value)} placeholder="0" aria-describedby={error ? "wbo-shop-price-error" : undefined} /></label>
                <label>Maximum<input type="number" min="0" step="0.01" inputMode="decimal" value={draftMax} onChange={(event) => setDraftMax(event.target.value)} placeholder="Any" aria-describedby={error ? "wbo-shop-price-error" : undefined} /></label>
              </div>{error && <p id="wbo-shop-price-error" className="wbo-shop-error" role="alert">{error}</p>}<button type="submit" className="wbo-shop-apply">Apply price</button></fieldset>
            </form>
            <fieldset><legend>Availability</legend>{[["all", "All stock"], ["in", "In stock"], ["out", "Out of stock"]].map(([value, label]) => <label className="wbo-shop-choice" key={value}><input type="radio" name="catalog-stock" checked={stock === value} onChange={() => setStock(value)} /><span>{label}</span></label>)}</fieldset>
          </div>
        </aside>
        <div className="wbo-shop-results" id="wbo-shop-results">
          <div className="wbo-shop-tools">
            <label className="wbo-shop-search"><Icon name="search" size={18} /><input type="search" aria-label="Search catalog" placeholder="Search products, SKU, or description" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><Icon name="close" size={16} /></button>}</label>
            <label className="wbo-shop-sort">Sort by<select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Default order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
          </div>
          <div className="wbo-shop-result-summary" role="status">{results.length ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, results.length)} of ${results.length} products` : "0 products"}</div>
          {hasFilters && <div className="wbo-shop-chips" aria-label="Active filters">
            {search && <button type="button" onClick={() => setSearch("")}>Search: {search} ×</button>}
            {category !== "All" && <button type="button" onClick={() => setCategory("All")}>{category} ×</button>}
            {stock !== "all" && <button type="button" onClick={() => setStock("all")}>{stock === "in" ? "In stock" : "Out of stock"} ×</button>}
            {(range.min !== "" || range.max !== "") && <button type="button" onClick={clearPrice}>Price: {money(range.min || 0)}{range.max === "" ? "+" : `–${money(range.max)}`} ×</button>}
            <button type="button" onClick={reset}>Clear all</button>
          </div>}
          {visible.length ? <div className="wbo-shop-grid">{visible.map((product) => <CatalogCard key={product.product_id} product={product} onOpen={onOpen} onAdd={onAdd} added={cartAddedId === product.product_id} limited={cartShakeId === product.product_id} />)}</div> : <div className="wbo-shop-empty"><Icon name="products" size={32} /><h2>{products.length ? "No matching products" : "No products available yet"}</h2><p>{products.length ? "Try a different search or remove a filter." : "Published products will appear here when available."}</p>{hasFilters && <button type="button" className="wbo-shop-apply" onClick={reset}>Clear filters</button>}</div>}
          {pages > 1 && <nav className="wbo-shop-pagination" aria-label="Catalog pages"><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page === pages} onClick={() => changePage(page + 1)}>Next</button></nav>}
        </div>
      </div>
    </section>
  );
}
