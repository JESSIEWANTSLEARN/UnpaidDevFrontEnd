import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeDashboardUpdate, queueDashboardRefresh, importRefreshSections } from '../resources/js/utils/dashboardRefresh.mjs';
import { startVisiblePolling } from '../resources/js/utils/visiblePolling.mjs';

test('partial dashboard response preserves unrelated arrays, counters, and alerts',()=>{
 const users=[{user_id:1}],products=[{product_id:1}],stockAlert={title:'Low Stock'};
 const before={users,products,metrics:{total_stock:5,pending_approval_pos:3},alerts:[stockAlert,{title:'Open Purchase Orders'}]};
 const after=mergeDashboardUpdate(before,{purchase_orders:[],metrics:{pending_approval_pos:0},alerts:[],replace_alert_titles:['Open Purchase Orders','Purchase Orders Awaiting Approval']});
 assert.equal(after.users,users);assert.equal(after.products,products);assert.equal(after.metrics.total_stock,5);assert.equal(after.metrics.pending_approval_pos,0);assert.deepEqual(after.alerts,[stockAlert]);assert.equal('replace_alert_titles' in after,false);
});
test('refresh queue serializes concurrent requests instead of overlapping them',async()=>{
 const queue={current:Promise.resolve()},revision={current:0};let release,inFlight=0,peak=0;const applied=[];
 const first=queueDashboardRefresh(queue,revision,async()=>{inFlight++;peak=Math.max(peak,inFlight);await new Promise(r=>release=r);inFlight--;return 1;},x=>applied.push(x),assert.fail);
 const second=queueDashboardRefresh(queue,revision,async()=>{inFlight++;peak=Math.max(peak,inFlight);inFlight--;return 2;},x=>applied.push(x),assert.fail);
 await new Promise(setImmediate);release();await Promise.all([first,second]);assert.equal(peak,1);assert.deepEqual(applied,[1,2]);
});
test('stale response is discarded and retried after another inventory mutation',async()=>{
 const queue={current:Promise.resolve()},revision={current:0};let count=0;const applied=[];
 await queueDashboardRefresh(queue,revision,async()=>{count++;if(count===1)revision.current++;return count;},x=>applied.push(x),assert.fail);
 assert.deepEqual(applied,[2]);
});
test('import types select dependent domains and unknown/inventory imports retain fallback',()=>{
 assert.deepEqual(importRefreshSections({import:{import_type:'SUPPLIERS'}}),['suppliers','products','purchase_orders']);
 assert.ok(importRefreshSections({import:{import_type:'PRODUCTS'}},true).includes('categories'));
 assert.equal(importRefreshSections({import:{import_type:'INVENTORY'}}),null);
});
function browser(){
 const listeners=new Map();let tick;const page={visibilityState:'visible',addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name)=>listeners.delete(name)};
 const host={setInterval:(fn)=>{tick=fn;return 1;},clearInterval:()=>{tick=null;},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name)=>listeners.delete(name)};
 return {document:page,window:host,navigator:{onLine:true},tick:()=>tick?.(),emit:(name)=>listeners.get(name)?.(),listeners};
}
test('hidden/offline polling pauses, visibility resumes, and in-flight ticks never overlap',async()=>{
 const env=browser();let calls=0,release;const stop=startVisiblePolling(async()=>{calls++;await new Promise(r=>release=r);},5000,env);
 env.document.visibilityState='hidden';await env.tick();assert.equal(calls,0);
 env.document.visibilityState='visible';env.navigator.onLine=false;await env.emit('visibilitychange');assert.equal(calls,0);
 env.navigator.onLine=true;const pending=env.emit('online');assert.equal(calls,1);await env.tick();assert.equal(calls,1);release();await pending;
 const next=env.tick();assert.equal(calls,2);stop();release();await next;assert.equal(env.listeners.size,0);await env.tick();assert.equal(calls,2);
});
test('polling failure releases the in-flight guard and can recover',async()=>{
 const env=browser();let calls=0;const stop=startVisiblePolling(async()=>{calls++;throw new Error('offline');},5000,env);
 await env.tick();await env.tick();assert.equal(calls,2);stop();
});
