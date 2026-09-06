import React from "react";
import Icon from "../Icon.jsx";

function LoadingState() {
  return (
    <div className="ops-panel padded ops-state-panel">
      <span className="ops-state-spinner" aria-hidden="true" />
      <div>
        <h2>Loading Super Admin data</h2>
        <p className="ops-subtext">Reading the latest values from the WalangBrownout database.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="ops-panel padded ops-state-panel">
      <span className="stat-icon accent-red"><Icon name="warning" size={17} /></span>
      <div className="ops-state-copy">
        <h2>Unable to load dashboard</h2>
        <p className="ops-subtext">{message}</p>
      </div>
      <button type="button" className="btn-primary" onClick={onRetry}>Try Again</button>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="ops-empty">{text}</div>;
}


function StatCard({ title, value, icon, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top"><span className={`stat-icon accent-${accent}`}><Icon name={icon} size={17} /></span></div>
      <p className="stat-value">{value}</p>
      <div className="stat-bottom"><span className="stat-label">{title}</span></div>
    </div>
  );
}


function ProductName({ product }) {
  return (
    <div className="product-name-cell">
      {product.image_url ? <img src={product.image_url} alt={product.name} className="product-thumb" /> : <span className="product-thumb product-thumb-empty"><Icon name="package" size={15} /></span>}
      <span>{product.name}</span>
    </div>
  );
}

function EmptyTable({ colSpan, text }) {
  return <tr><td colSpan={colSpan}><EmptyState text={text} /></td></tr>;
}


export { LoadingState, ErrorState, EmptyState, StatCard, ProductName, EmptyTable };
