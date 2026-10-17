import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogCategories, filterCatalog, validatePriceRange } from '../resources/js/utils/customer/catalogFilters.mjs';
const products = [
  { product_id: 1, name: 'Fan', category: ' Cooling ', unit_price: '100.00', available_stock: 2, sku: 'F01', description: null },
  { product_id: 2, name: 'Air purifier', category: 'Air care', unit_price: '200', available_stock: 0, sku: 'A02', description: 'Quiet filter' },
  { product_id: 3, name: 'Cable', category: null, unit_price: '0', available_stock: 3, sku: null },
];
test('categories use actual data and retain unassigned products', () => {
  assert.deepEqual(catalogCategories(products), [['Air care', 1], ['Cooling', 1], ['Uncategorized', 1]]);
  assert.deepEqual(filterCatalog(products, { category: 'Uncategorized' }).map(p => p.product_id), [3]);
});
test('search, category, stock and inclusive price boundaries combine', () => {
  assert.deepEqual(filterCatalog(products, { search: ' f01 ', category: 'Cooling', stock: 'in', min: '100', max: '100' }).map(p => p.product_id), [1]);
  assert.equal(filterCatalog(products, { search: 'quiet', stock: 'in' }).length, 0);
  assert.equal(filterCatalog(products, { search: 'quiet', stock: 'out' }).length, 1);
  assert.equal(filterCatalog(products, { min: '0', max: '0' })[0].product_id, 3);
});
test('sorting uses numeric prices without changing input ordering', () => {
  assert.deepEqual(filterCatalog(products, { sort: 'price-desc' }).map(p => p.product_id), [2, 1, 3]);
  assert.deepEqual(products.map(p => p.product_id), [1, 2, 3]);
});
test('price range rejects invalid and reversed values and accepts open bounds', () => {
  for (const [min,max] of [['-1',''],['x','10'],['Infinity',''],['200','100']]) assert.ok(validatePriceRange(min,max));
  for (const [min,max] of [['',''],['0',''],['','100'],['99.99','99.99']]) assert.equal(validatePriceRange(min,max), '');
});
