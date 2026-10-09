import test from "node:test";
import assert from "node:assert/strict";
import { ROLE_DASHBOARDS } from "../resources/js/config/roleDashboardConfig.js";
import {
  ROLE_WORKSPACES,
  MODULE_PURPOSES,
  resolveRoleModule,
} from "../resources/js/config/roleWorkspaceConfig.js";
import {
  expiryGroup,
  manilaDay,
  salesStage,
  accountReasons,
  procurementPlan,
  datedOrders,
  salesOutcomes,
  uniquePOCount,
} from "../resources/js/components/shared/role-dashboard/workspaces/workspaceData.js";

test("all eight roles have a distinct workspace and every responsibility has a description", () => {
  assert.equal(Object.keys(ROLE_DASHBOARDS).length, 8);
  for (const [role, config] of Object.entries(ROLE_DASHBOARDS)) {
    assert.equal(new Set(config.modules).size, config.modules.length);
    assert.ok(config.modules.includes(ROLE_WORKSPACES[role].title));
    assert.ok(!config.modules.includes("Overview"));
    for (const module of config.modules)
      assert.ok(
        module === ROLE_WORKSPACES[role].title || MODULE_PURPOSES[module],
      );
    assert.equal(
      resolveRoleModule(role, ROLE_WORKSPACES[role].legacy, config.modules),
      ROLE_WORKSPACES[role].title,
    );
    assert.equal(
      resolveRoleModule(role, "Invalid module", config.modules),
      "Overview",
    );
    assert.equal(
      resolveRoleModule(role, "Overview", config.modules),
      "Overview",
    );
  }
});
test("expiry boundaries use Manila days, include today and reject malformed dates", () => {
  const batch = (expiry_date) => ({ current_quantity: 4, expiry_date });
  assert.equal(manilaDay(new Date("2026-10-08T16:01:00Z")), "2026-10-09");
  for (const [date, group] of [
    ["2026-10-08", "Expired"],
    ["2026-10-09", "Within 7 days"],
    ["2026-10-16", "Within 7 days"],
    ["2026-10-17", "8–30 days"],
    ["2026-11-08", "8–30 days"],
    ["2026-11-09", "Later"],
    [null, "No expiry date"],
    ["2026-02-30", "Invalid date"],
  ])
    assert.equal(expiryGroup(batch(date), "2026-10-09"), group);
  assert.equal(
    expiryGroup(
      { current_quantity: 0, expiry_date: "2026-10-01" },
      "2026-10-09",
    ),
    "Empty",
  );
});
test("planning includes only unreceived ordered quantities, excludes draft commitments, and clamps over-receipt", () => {
  const data = {
    reorder_needs: [{ product_id: 1, recommended_reorder_quantity: 20 }],
    purchase_orders: [
      {
        po_id: 1,
        product_id: 1,
        status: "ORDERED",
        quantity_ordered: 10,
        quantity_received: 2,
      },
      {
        po_id: 1,
        product_id: 1,
        status: "PARTIALLY_RECEIVED",
        quantity_ordered: 6,
        quantity_received: 2,
      },
      {
        po_id: 2,
        product_id: 1,
        status: "DRAFT",
        quantity_ordered: 100,
        quantity_received: 0,
      },
      {
        po_id: 3,
        product_id: 1,
        status: "ORDERED",
        quantity_ordered: 2,
        quantity_received: 3,
      },
      {
        po_id: 4,
        product_id: 2,
        status: "ORDERED",
        quantity_ordered: 50,
        quantity_received: 0,
      },
    ],
  };
  assert.equal(procurementPlan(data)[0].incomingQuantity, 12);
  assert.equal(procurementPlan(data)[0].planningGap, 8);
  assert.equal(uniquePOCount(data.purchase_orders), 4);
});
test("fulfillment queues distinguish verification, payment wait, processing and closed orders", () => {
  assert.equal(
    salesStage({ status: "PENDING", payment_method: "CASH_ON_DELIVERY" }),
    "Ready to process",
  );
  assert.equal(
    salesStage({
      status: "PENDING",
      payment_method: "GCASH",
      payment_status: "AWAITING_VERIFICATION",
    }),
    "Verify payment",
  );
  assert.equal(
    salesStage({
      status: "PENDING",
      payment_method: "GCASH",
      payment_status: "PENDING",
    }),
    "Awaiting payment",
  );
  assert.equal(
    salesStage({
      status: "PENDING",
      payment_method: "GCASH",
      payment_status: "PAID",
    }),
    "Ready to process",
  );
  assert.equal(salesStage({ status: "PROCESSING" }), "Ready to fulfill");
  assert.equal(salesStage({ status: "CANCELLED" }), null);
  assert.equal(salesStage({ status: "FULFILLED" }), null);
});
test("date filtering includes both boundary dates and keeps outcome values separate", () => {
  const orders = [
    {
      order_date: "2026-10-01 12:30:00",
      status: "FULFILLED",
      total_amount: "100",
      total_quantity: 2,
    },
    {
      order_date: "2026-10-09",
      status: "PENDING",
      total_amount: 900,
      total_quantity: 3,
    },
    { order_date: "2026-09-30", status: "FULFILLED", total_amount: 200 },
  ];
  const result = datedOrders(orders, "2026-10-01", "2026-10-09");
  assert.equal(result.length, 2);
  assert.equal(
    salesOutcomes(result).find((r) => r.status === "FULFILLED").amount,
    100,
  );
  assert.equal(datedOrders(orders, "2026-11-01", "").length, 0);
});
test("account review reasons flag access conditions without treating every disabled account as active", () => {
  assert.deepEqual(
    accountReasons({
      email_verified_at: "2026-10-01",
      account_status: "disabled",
      active_sessions: 0,
    }),
    [],
  );
  assert.deepEqual(
    accountReasons({
      email_verified_at: null,
      account_status: "disabled",
      active_sessions: 2,
    }),
    ["Unverified email", "Inactive with sessions", "Multiple sessions"],
  );
});
