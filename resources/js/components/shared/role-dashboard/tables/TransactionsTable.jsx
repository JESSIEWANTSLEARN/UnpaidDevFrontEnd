import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { date, number } from "../utils/formatters.js";

export default function TransactionsTable({
  transactions = [],
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(
    () =>
      [...new Set(transactions.map((item) => item.transaction_type).filter(Boolean))].sort(),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const typeMatch =
        type === "all" || transaction.transaction_type === type;

      const searchMatch =
        !needle ||
        [
          transaction.transaction_id,
          transaction.transaction_type,
          transaction.batch_number,
          transaction.product_name,
          transaction.performed_by,
          transaction.performed_by_user_id,
          transaction.reference_note,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(needle)
        );

      return typeMatch && searchMatch;
    });
  }, [transactions, search, type]);

  if (!transactions.length) {
    return <Empty text="No stock movements found." />;
  }

  return (
    <>
      <div className="role-live-filter-bar">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search movement, batch, product, user..."
            aria-label="Search stock movements"
          />
          {search && (
            <button
              className="role-live-search-clear"
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        <select
          className="role-live-filter-select"
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter stock movements by type"
        >
          <option value="all">All Movement Types</option>
          {types.map((movementType) => (
            <option key={movementType} value={movementType}>
              {movementType}
            </option>
          ))}
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <Empty text="No stock movements match your filters." />
      ) : (
        <div className="role-live-table-wrap">
          <table className="role-live-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Batch</th>
                <th>Product</th>
                <th>Change</th>
                <th>Performed By</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td>{date(transaction.timestamp)}</td>
                  <td>{transaction.transaction_type}</td>
                  <td>{transaction.batch_number}</td>
                  <td>{transaction.product_name}</td>
                  <td>
                    {transaction.quantity_change > 0 ? "+" : ""}
                    {number(transaction.quantity_change)}
                  </td>
                  <td>{transaction.performed_by || "-"}</td>
                  <td>{transaction.reference_note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}