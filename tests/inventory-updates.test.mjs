import test from 'node:test';
import assert from 'node:assert/strict';
import { applyInventoryUpdate } from '../resources/js/utils/inventoryUpdates.mjs';

const fixture = () => ({
  role: 'Inventory_Controller',
  products: [{product_id:1, available_stock:2, reorder_point:5, recommended_reorder_quantity:8}, {product_id:2, available_stock:9, reorder_point:3, recommended_reorder_quantity:0}],
  batches:[{batch_id:1,product_id:1,current_quantity:2,received_date:'2026-10-18',expiry_date:'2026-11-01'}],
  transactions:[], metrics:{pending_orders:1,open_purchase_orders:1,pending_approval_pos:0,ordered_pos:1},
  suppliers:[{supplier_id:1}], orders:[{order_id:1}], users:[{user_id:1}], settings:{company_name:'WBO'},
  purchase_orders:[{po_id:1,po_detail_id:1,status:'ORDERED',quantity_received:0,created_at:'2026-10-18'}],
});
const delta = () => ({product_stocks:[{product_id:'1',available_stock:7}],batches:[{batch_id:1,product_id:1,current_quantity:7,received_date:'2026-10-18',expiry_date:'2026-11-01'}],transactions:[{transaction_id:1,transaction_type:'RECEIVE',timestamp:'2026-10-18 09:00:00'}],metrics:{total_stock:16,low_stock_items:0,out_of_stock:0},today:'2026-10-18',expiry_cutoff:'2026-11-17'});

test('inventory merge preserves unrelated datasets and unchanged product identities',()=>{
  const original=fixture(); const before=structuredClone(original); const next=applyInventoryUpdate(original,delta());
  assert.deepEqual(original,before);
  for(const key of ['orders','users','settings','suppliers','purchase_orders']) assert.equal(next[key],original[key]);
  assert.equal(next.products[1],original.products[1]);
  assert.equal(next.products[0].available_stock,7);
  assert.equal(next.products[0].recommended_reorder_quantity,0);
  assert.equal(next.metrics.pending_orders,1);
  assert.equal(next.metrics.receipts_today,1);
  assert.equal(next.metrics.expiring_batches,1);
});
test('repeated inventory snapshots are idempotent and never double-add quantities',()=>{
  const first=applyInventoryUpdate(fixture(),delta()); const next=applyInventoryUpdate(first,delta());
  assert.deepEqual(next,first); assert.equal(next.batches.length,1);
});
test('write-off clears zero-stock batches from expiry watch and rebuilds reorder alerts',()=>{
  const change=delta(); change.product_stocks[0].available_stock=0; change.batches[0].current_quantity=0;
  change.metrics={total_stock:9,low_stock_items:0,out_of_stock:1};
  const next=applyInventoryUpdate(fixture(),change);
  assert.equal(next.expiring_batches.length,0); assert.equal(next.metrics.reorder_needs,1);
  assert.equal(next.reorder_needs[0].recommended_reorder_quantity,10);
  assert.equal(next.alerts[0].title,'Out of Stock');
});
test('receipt replaces all rows of the affected purchase order and updates open counters',()=>{
  const current=fixture();current.purchase_orders.push({po_id:2,po_detail_id:2,status:'ORDERED',created_at:'2026-10-17'});
  const change={...delta(),purchase_order_ids:[1],purchase_orders:[{po_id:1,po_detail_id:1,status:'RECEIVED',quantity_received:5,created_at:'2026-10-18'}]};
  const next=applyInventoryUpdate(current,change);
  assert.equal(next.purchase_orders.length,2);assert.equal(next.metrics.open_purchase_orders,1);assert.equal(next.metrics.ordered_pos,1);
  assert.equal(next.purchase_orders[1],current.purchase_orders[1]);
});
test('admin category counters merge without discarding category metadata',()=>{
  const current=fixture();delete current.role;current.categories=[{category_id:3,category:'Cooling',total_stock:2,is_active:true}];
  const next=applyInventoryUpdate(current,{...delta(),categories:[{category_id:3,total_stock:7}],stock_trend:[{net_movement:5}]});
  assert.deepEqual(next.categories[0],{category_id:3,category:'Cooling',total_stock:7,is_active:true});
  assert.equal(next.stock_trend[0].net_movement,5);assert.equal(next.orders,current.orders);
});
test('staff batch window stays capped while admin retains all historical batches',()=>{
  const current=fixture();current.batches=Array.from({length:100},(_,i)=>({batch_id:i+1,received_date:'2026-10-01'}));
  const change={...delta(),batches:[{batch_id:101,received_date:'2026-10-18',current_quantity:3}]};
  const staff=applyInventoryUpdate(current,change);assert.equal(staff.batches.length,100);assert.equal(staff.batches[0].batch_id,101);
  delete current.role;const admin=applyInventoryUpdate(current,change);assert.equal(admin.batches.length,101);
});
test('absent or legacy responses do not corrupt dashboard data',()=>{
  const current=fixture();assert.equal(applyInventoryUpdate(current,undefined),current);assert.equal(applyInventoryUpdate(null,delta()),null);
});
