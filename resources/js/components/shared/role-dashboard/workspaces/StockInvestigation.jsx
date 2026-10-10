import React, { useState } from "react";
import BatchesTable from "../tables/BatchesTable.jsx";
import TransactionsTable from "../tables/TransactionsTable.jsx";
import { Choice, ModuleButton, Workspace } from "./WorkspacePrimitives.jsx";
import { list, numeric } from "./workspaceData.js";

export default function StockInvestigation({ data, onModuleChange }) {
  const [productId, setProductId] = useState("");
  const product = list(data.products).find(
    (p) => String(p.product_id) === productId,
  );
  return (
    <>
      <Workspace
        title="Stock Investigation"
        description="Select a product to inspect its available stock, recent batch records, and movement history together."
        scope="Available stock comes from the product total. Batch and transaction lists each cover up to 100 recent records across all products; their sums are not a complete stock reconciliation."
      >
        <div className="role-workspace-controls">
          <Choice
            label="Investigate product"
            value={productId}
            onChange={setProductId}
            options={[
              ["", "Select a product"],
              ...list(data.products).map((p) => [
                String(p.product_id),
                `${p.sku} · ${p.name}`,
              ]),
            ]}
          />
        </div>
        {product && (
          <div className="role-workspace-controls">
            <p>
              <strong>
                {numeric(product.available_stock)} available units
              </strong>{" "}
              · Reorder point: {numeric(product.reorder_point)} · Supplier:{" "}
              {product.supplier_name || "Unassigned"}
            </p>
            <ModuleButton
              module="Adjustments"
              onModuleChange={onModuleChange}
            />
            <ModuleButton module="Write Offs" onModuleChange={onModuleChange} />
          </div>
        )}
      </Workspace>
      {product && (
        <>
          <Workspace title="Product batches">
            <BatchesTable
              key={productId}
              batches={list(data.batches).filter(
                (b) => String(b.product_id) === productId,
              )}
            />
          </Workspace>
          <Workspace title="Product movement history">
            <TransactionsTable
              key={productId}
              transactions={list(data.transactions).filter(
                (t) => String(t.product_id) === productId,
              )}
            />
          </Workspace>
        </>
      )}
    </>
  );
}
