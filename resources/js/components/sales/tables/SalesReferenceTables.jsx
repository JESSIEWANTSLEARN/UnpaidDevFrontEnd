import React, { useMemo, useState } from "react";
import { SalesEmpty } from "../common/SalesDashboardPrimitives.jsx";
import {
  formatDate,
  formatMoney,
  formatNumber,
} from "../utils/salesFormatters.js";

function SearchBox({ value, onChange, label, placeholder }) {
  return (
    <div className="role-live-search-wrap">
      <input
        className="role-live-search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value && (
        <button className="role-live-search-clear" type="button" onClick={() => onChange("")}>
          Clear
        </button>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, label, allLabel, options }) {
  return (
    <select
      className="role-live-filter-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => {
        const [optionValue, optionLabel] = Array.isArray(option)
          ? option
          : [option, option];
        return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
      })}
    </select>
  );
}

export function SalesCustomersTable({ customers = [] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = useMemo(
    () => [...new Set(customers.map((customer) => customer.account_status).filter(Boolean))].sort(),
    [customers],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return customers.filter((customer) =>
      (status === "all" || customer.account_status === status) &&
      (!needle || [customer.user_id, customer.name, customer.email, customer.contact_number, customer.account_status]
        .some((value) => String(value ?? "").toLowerCase().includes(needle))),
    );
  }, [customers, search, status]);

  if (!customers.length) return <SalesEmpty text="No System User customers found." />;
  if (!filtered.length) return <>
    <div className="role-live-filter-bar" role="search">
      <SearchBox value={search} onChange={setSearch} label="Search customers" placeholder="Search customer, email, or contact..." />
      <FilterSelect value={status} onChange={setStatus} label="Filter customers by account status" allLabel="All statuses" options={statuses} />
    </div>
    <SalesEmpty text="No customers match your search and filter." />
  </>;

  return (
    <>
      <div className="role-live-filter-bar" role="search">
        <SearchBox value={search} onChange={setSearch} label="Search customers" placeholder="Search customer, email, or contact..." />
        <FilterSelect value={status} onChange={setStatus} label="Filter customers by account status" allLabel="All statuses" options={statuses} />
      </div>
      <div className="sales-role-table-wrap">
        <table className="sales-role-table">
          <thead><tr><th>Customer</th><th>Contact</th><th>Status</th><th>Orders</th><th>Fulfilled</th><th>Total Spent</th><th>Last Order</th></tr></thead>
          <tbody>{filtered.map((customer) => (
            <tr key={customer.user_id}>
              <td><strong>{customer.name}</strong><small>{customer.email}</small></td>
              <td>{customer.contact_number || "-"}</td>
              <td>{customer.account_status}</td>
              <td>{formatNumber(customer.order_count)}</td>
              <td>{formatNumber(customer.fulfilled_orders)}</td>
              <td>{formatMoney(customer.total_spent)}</td>
              <td>{formatDate(customer.last_order_at)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

export function SalesProductPerformanceTable({ rows = [] }) {
  const [search, setSearch] = useState("");
  const [orderCount, setOrderCount] = useState("all");
  const counts = useMemo(
    () => [...new Set(rows.map((row) => String(row.order_count ?? "0")))].sort((a, b) => Number(a) - Number(b)),
    [rows],
  );
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) =>
      (orderCount === "all" || String(row.order_count ?? "0") === orderCount) &&
      (!needle || [row.product_id, row.sku, row.name, row.units_sold, row.order_count, row.revenue]
        .some((value) => String(value ?? "").toLowerCase().includes(needle))),
    );
  }, [rows, search, orderCount]);

  if (!rows.length) return <SalesEmpty text="No fulfilled sales yet." />;

  return (
    <>
      <div className="role-live-filter-bar" role="search">
        <SearchBox value={search} onChange={setSearch} label="Search product performance" placeholder="Search product, SKU, or sales value..." />
        <FilterSelect
          value={orderCount}
          onChange={setOrderCount}
          label="Filter products by number of orders"
          allLabel="All order counts"
          options={counts.map((count) => [count, `${count} ${Number(count) === 1 ? "order" : "orders"}`])}
        />
      </div>
      {filtered.length ? (
        <div className="sales-role-table-wrap">
          <table className="sales-role-table">
            <thead><tr><th>SKU</th><th>Product</th><th>Units Sold</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>{filtered.map((row) => (
              <tr key={row.product_id}><td>{row.sku}</td><td>{row.name}</td><td>{formatNumber(row.units_sold)}</td><td>{formatNumber(row.order_count)}</td><td>{formatMoney(row.revenue)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : <SalesEmpty text="No products match your search and filter." />}
    </>
  );
}

export function SalesAvailabilityTable({ products = [] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  );
  const rows = useMemo(() => products.map((product) => {
    const stock = Number(product.available_stock || 0);
    const reorderPoint = Number(product.reorder_point ?? 10);
    const condition = stock <= 0 ? "OUT" : stock <= reorderPoint ? "LOW" : "OK";
    return { ...product, stock, condition };
  }), [products]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((product) =>
      (category === "all" || product.category === category) &&
      (conditionFilter === "all" || product.condition === conditionFilter) &&
      (!needle || [product.product_id, product.sku, product.name, product.category, product.condition]
        .some((value) => String(value ?? "").toLowerCase().includes(needle))),
    );
  }, [rows, search, category, conditionFilter]);

  if (!products.length) return <SalesEmpty text="No products found." />;

  return (
    <>
      <div className="role-live-filter-bar" role="search">
        <SearchBox value={search} onChange={setSearch} label="Search product availability" placeholder="Search product, SKU, or category..." />
        <FilterSelect value={category} onChange={setCategory} label="Filter products by category" allLabel="All categories" options={categories} />
        <FilterSelect value={conditionFilter} onChange={setConditionFilter} label="Filter products by stock condition" allLabel="All stock conditions" options={["OUT", "LOW", "OK"]} />
      </div>
      {filtered.length ? (
        <div className="sales-role-table-wrap">
          <table className="sales-role-table">
            <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Available</th><th>Condition</th></tr></thead>
            <tbody>{filtered.map((product) => (
              <tr key={product.product_id}>
                <td>{product.sku}</td><td>{product.name}</td><td>{product.category}</td><td>{formatMoney(product.unit_price)}</td><td>{formatNumber(product.stock)}</td>
                <td><span className={`sales-stock stock-${product.condition.toLowerCase()}`}>{product.condition}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <SalesEmpty text="No products match your search and filters." />}
    </>
  );
}
