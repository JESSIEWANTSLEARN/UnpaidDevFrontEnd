import React, { useState } from "react";
import SalesOrdersTable from "../../../sales/tables/SalesOrdersTable.jsx";
import { money } from "../utils/formatters.js";
import {
  Choice,
  ModuleButton,
  Workspace,
  WorkspaceTable,
} from "./WorkspacePrimitives.jsx";
import {
  list,
  numeric,
  datedOrders,
  salesOutcomes,
  salesStage,
} from "./workspaceData.js";

export default function SalesWorkspace({
  roleKey,
  data,
  previewMode,
  busy,
  onSalesOrderStatus,
  onModuleChange,
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stage, setStage] = useState("All open");
  const [search, setSearch] = useState("");
  if (roleKey === "Sales_Manager") {
    const invalidRange = from && to && from > to;
    const orders = invalidRange ? [] : datedOrders(data.orders, from, to);
    const outcomes = salesOutcomes(orders);
    const fulfilled = orders.filter((o) => o.status === "FULFILLED");
    const fulfilledValue = fulfilled.reduce(
      (sum, o) => sum + numeric(o.total_amount),
      0,
    );
    return (
      <Workspace
        title="Sales Analysis"
        description="Compare order outcomes within an order-date range. Only fulfilled orders contribute to fulfilled sales value."
        scope="Based on the latest 150 orders supplied by the dashboard, not all-time sales. Dates filter when the order was placed, not when payment or fulfillment occurred. Values are gross order amounts, before any refunds."
      >
        <div className="role-workspace-controls">
          <label className="role-workspace-choice">
            <span>Order date from</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="role-workspace-choice">
            <span>Order date to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="role-live-secondary"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear dates
          </button>
          <ModuleButton module="Orders" onModuleChange={onModuleChange} />
        </div>
        {invalidRange ? (
          <p className="role-live-form-error" role="alert">
            Start date must be on or before end date.
          </p>
        ) : (
          <>
            <div className="role-workspace-summary" role="status">
              <span>
                <strong>{orders.length}</strong> orders in range
              </span>
              <span>
                <strong>{fulfilled.length}</strong> fulfilled orders
              </span>
              <span>
                <strong>{money(fulfilledValue)}</strong> fulfilled value
              </span>
              <span>
                <strong>
                  {fulfilled.length
                    ? money(fulfilledValue / fulfilled.length)
                    : "—"}
                </strong>{" "}
                average fulfilled order
              </span>
            </div>
            <WorkspaceTable
              headings={[
                "Order outcome",
                "Orders",
                "Units",
                "Gross order value",
              ]}
              rows={outcomes.map((row) => ({
                key: row.status,
                cells: [row.status, row.count, row.units, money(row.amount)],
              }))}
            />
          </>
        )}
      </Workspace>
    );
  }
  const needle = search.trim().toLowerCase();
  const orders = list(data.orders)
    .filter((order) => {
      const condition = salesStage(order);
      return (
        condition &&
        (stage === "All open" || condition === stage) &&
        (!needle ||
          [
            order.order_id,
            order.customer_name,
            order.payment_reference_number,
          ].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(needle),
          ))
      );
    })
    .sort(
      (a, b) =>
        String(a.order_date || "9999").localeCompare(
          String(b.order_date || "9999"),
        ) || numeric(a.order_id) - numeric(b.order_id),
    );
  return (
    <Workspace
      title="Fulfillment Queue"
      description="Work through open orders by their next step, oldest order first. Existing order actions keep their role and payment rules."
      scope="Uses the latest 150 loaded orders. Payment verification must follow your normal payment-checking process."
    >
      <div className="role-workspace-controls">
        <Choice
          label="Fulfillment stage"
          value={stage}
          onChange={setStage}
          options={[
            "All open",
            "Verify payment",
            "Awaiting payment",
            "Ready to process",
            "Ready to fulfill",
          ]}
        />
        <label className="role-workspace-choice">
          <span>Find order or customer</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span role="status">{orders.length} matching orders</span>
      </div>
      <SalesOrdersTable
        orders={orders}
        previewMode={previewMode}
        busy={busy}
        onStatus={onSalesOrderStatus}
      />
    </Workspace>
  );
}
