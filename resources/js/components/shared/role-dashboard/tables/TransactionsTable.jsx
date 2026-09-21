import React from "react";
import Empty from "../common/Empty.jsx";
import { date, number } from "../utils/formatters.js";

export default function TransactionsTable({
  transactions = [],
}) {
  if (!transactions.length) {
    return (
      <Empty text="No stock movements found." />
    );
  }

  return (
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
          {transactions.map(
            (transaction) => (
              <tr
                key={
                  transaction.transaction_id
                }
              >
                <td>
                  {date(
                    transaction.timestamp,
                  )}
                </td>
                <td>
                  {
                    transaction.transaction_type
                  }
                </td>
                <td>
                  {
                    transaction.batch_number
                  }
                </td>
                <td>
                  {
                    transaction.product_name
                  }
                </td>
                <td>
                  {transaction.quantity_change >
                  0
                    ? "+"
                    : ""}
                  {number(
                    transaction.quantity_change,
                  )}
                </td>
                <td>
                  {transaction.performed_by ||
                    "-"}
                </td>
                <td>
                  {transaction.reference_note ||
                    "-"}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
