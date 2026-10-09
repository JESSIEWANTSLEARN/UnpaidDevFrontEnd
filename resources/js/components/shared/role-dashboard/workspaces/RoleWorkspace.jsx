import React from "react";
import OperationsMonitoring from "./OperationsMonitoring.jsx";
import PurchasingWorkspace from "./PurchasingWorkspace.jsx";
import WarehousePlanning from "./WarehousePlanning.jsx";
import StockInvestigation from "./StockInvestigation.jsx";
import SalesWorkspace from "./SalesWorkspace.jsx";

export default function RoleWorkspace(props) {
  switch (props.roleKey) {
    case "Operations_Manager":
      return <OperationsMonitoring {...props} />;
    case "Purchasing_Manager":
    case "Purchasing_Staff":
      return <PurchasingWorkspace {...props} />;
    case "Warehouse_Admin":
      return <WarehousePlanning {...props} />;
    case "Inventory_Controller":
      return <StockInvestigation {...props} />;
    case "Sales_Manager":
    case "Sales_Staff":
      return <SalesWorkspace {...props} />;
    default:
      return null;
  }
}
