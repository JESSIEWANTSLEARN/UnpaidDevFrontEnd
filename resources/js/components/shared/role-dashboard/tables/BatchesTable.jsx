import React from "react";
import Empty from "../common/Empty.jsx";
import { date, number } from "../utils/formatters.js";

export default function BatchesTable({ batches = [] }) {
  if (!batches.length) {
    return (
      <Empty text="No inventory batches found." />
    );
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Received</th>
            <th>Current</th>
            <th>Received Date</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.batch_id}>
              <td>{batch.batch_number}</td>
              <td>{batch.product_name}</td>
              <td>{batch.sku}</td>
              <td>
                {number(
                  batch.quantity_received,
                )}
              </td>
              <td>
                {number(
                  batch.current_quantity,
                )}
              </td>
              <td>
                {date(batch.received_date)}
              </td>
              <td>{date(batch.expiry_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
