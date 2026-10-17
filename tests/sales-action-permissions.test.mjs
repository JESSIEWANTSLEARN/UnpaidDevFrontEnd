import test from "node:test";
import assert from "node:assert/strict";
import { salesOrderActions, canRefundReturn } from "../resources/js/utils/salesActionPermissions.mjs";

test("staff fulfill ready orders while managers handle payment and exceptions", () => {
  assert.deepEqual(salesOrderActions("Sales_Staff"), ["process", "fulfill"]);
  assert.deepEqual(salesOrderActions("Sales_Manager"), ["verify_payment", "process", "fulfill", "unfulfill", "cancel"]);
  assert.deepEqual(salesOrderActions("Operations_Manager"), []);
  assert.equal(canRefundReturn("Sales_Staff"), false);
  assert.equal(canRefundReturn("Sales_Manager"), true);
});
