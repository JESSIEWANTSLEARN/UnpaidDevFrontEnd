import test from 'node:test';
import assert from 'node:assert/strict';
import { filterOrders, filterReviews } from '../resources/js/utils/customer/historyFilters.mjs';
const orders = [
 { order_id: 1, status: 'FULFILLED', order_date: '2026-01-01', items: [{ product_name:'Cooling fan', sku:'FAN-1' }] },
 { order_id: 2, status: 'PENDING', order_date: '2026-02-01', items: [{ product_name:'Purifier', sku:'AIR-2' }] },
];
const reviews = [
 { review_id: 1, product_name:'Cooling fan', sku:'FAN-1', rating:5, title:'Quiet', comment:'Very nice' },
 { review_id: 2, product_name:'Purifier', sku:'AIR-2', rating:2, title:'Loud', comment:'Needs improvement' },
];
test('orders search number, item name, SKU and status; sort dates', () => {
 assert.deepEqual(filterOrders(orders,{query:'fan'}).map(x=>x.order_id),[1]);
 assert.deepEqual(filterOrders(orders,{query:'air-2'}).map(x=>x.order_id),[2]);
 assert.deepEqual(filterOrders(orders,{query:'pending'}).map(x=>x.order_id),[2]);
 assert.deepEqual(filterOrders(orders,{sort:'newest'}).map(x=>x.order_id),[2,1]);
 assert.deepEqual(filterOrders(orders,{sort:'oldest'}).map(x=>x.order_id),[1,2]);
});
test('review search, rating filter and sort are independent', () => {
 assert.deepEqual(filterReviews(reviews,{query:'nice'}).map(x=>x.review_id),[1]);
 assert.deepEqual(filterReviews(reviews,{rating:'2'}).map(x=>x.review_id),[2]);
 assert.deepEqual(filterReviews(reviews,{sort:'highest'}).map(x=>x.review_id),[1,2]);
 assert.deepEqual(filterReviews(reviews,{sort:'lowest'}).map(x=>x.review_id),[2,1]);
 assert.deepEqual(filterReviews(reviews,{sort:'oldest'}).map(x=>x.review_id),[1,2]);
});
