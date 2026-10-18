// Mirrors the server's sales-action policy; the API always enforces it.
export function salesOrderActions(roleKey) {
  if (roleKey === "Sales_Manager") {
    return ["verify_payment", "process", "fulfill", "unfulfill", "cancel"];
  }
  if (roleKey === "Sales_Staff") return ["process", "fulfill"];
  return [];
}

export function canRefundReturn(roleKey) {
  return roleKey === "Sales_Manager";
}
