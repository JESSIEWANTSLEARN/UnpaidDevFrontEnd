import test from 'node:test';
import assert from 'node:assert/strict';
import { filterImportRows, filterImportHistory } from '../resources/js/utils/importFilters.mjs';
test('import preview search combines with validation filter without modifying confirmation data', () => {
 const rows = [{row_number:1, valid:true, data:{sku:'AC-01'}}, {row_number:2, valid:false, data:{sku:'AC-02'}, errors:[{message:'Unknown supplier'}]}];
 assert.deepEqual(filterImportRows(rows, ' ac ', 'valid'), [rows[0]]);
 assert.deepEqual(filterImportRows(rows, 'supplier', 'invalid'), [rows[1]]);
 assert.deepEqual(filterImportRows(rows, 'missing'), []);
 assert.equal(rows.length, 2);
 assert.equal(filterImportRows(rows).length, 2);
});
test('history search matches filename, uploader, type and status case-insensitively', () => {
 const rows = [{original_filename:'stock.csv', uploaded_by_name:'Jessie', import_type:'INVENTORY', status:'COMPLETED'}];
 for(const term of ['stock', 'jessie', 'inventory', 'completed']) assert.equal(filterImportHistory(rows, term).length, 1);
 assert.equal(filterImportHistory(rows, 'unknown').length, 0);
});

test('workflow search includes nested items and combines with exact status', async () => {
 const { filterWorkflowRows } = await import('../resources/js/utils/importFilters.mjs');
 const rows = [{status:'OPEN', items:[{sku:'AIR-01'}]}, {status:'CLOSED', subject:'Air conditioner'}];
 assert.deepEqual(filterWorkflowRows(rows, 'air', 'OPEN'), [rows[0]]);
 assert.equal(filterWorkflowRows(rows, 'air').length, 2);
 assert.equal(filterWorkflowRows(rows, 'air', 'PENDING').length, 0);
});
