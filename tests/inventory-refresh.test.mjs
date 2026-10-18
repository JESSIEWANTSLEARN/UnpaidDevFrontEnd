import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
import { applyInventoryUpdate } from '../resources/js/utils/inventoryUpdates.mjs';
import { INITIAL_FORMS } from '../resources/js/config/super-admin/superAdminConfig.js';

// Run the actual hook code with deterministic React state/effect scheduling and mocked HTTP boundaries.
function harness(kind, { legacy=false, preview=false, fail=false }={}) {
  const slots=[], effects=[], pending=[], calls=[];
  let cursor=0, effectCursor=0, block=false, release, rejectRelease;
  const dashboard=()=>block?new Promise((resolve,reject)=>{release=()=>{block=false;resolve(data);};rejectRelease=()=>{block=false;reject(new Error('Old refresh failed'));};}):Promise.resolve(data);
  const react={
    useState(initial) {const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],(next)=>{slots[i]=typeof next==='function'?next(slots[i]):next;}];},
    useRef(initial) {const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
    useEffect(fn,deps) {const i=effectCursor++;const old=effects[i];if(!old||deps.some((value,index)=>!Object.is(value,old.deps[index])))pending.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});},
  };
  const data={role:'Inventory_Controller',products:[{product_id:1,available_stock:2,reorder_point:5}],batches:[],transactions:[],metrics:{},settings:{}};
  if(kind==='admin')delete data.role;
  const update={product_stocks:[{product_id:1,available_stock:5}],batches:[{batch_id:1,product_id:1,current_quantity:5,received_date:'2026-10-18'}],transactions:[],metrics:{total_stock:5,low_stock_items:1,out_of_stock:0}};
  const mutate=async(name)=>{calls.push(name);if(fail)throw Object.assign(new Error('Rejected'),{status:422});return legacy?{message:'Saved'}:{message:'Saved',inventory_update:update};};
  const roleApi={loadRoleDashboard:async()=>{calls.push('dashboard');return dashboard();}};
  for(const name of ['roleStockIn','roleAdjustStock','roleWriteOffStock','roleReceivePurchaseOrder'])roleApi[name]=()=>mutate(name);
  const adminApi={apiRequest:async(path)=>{calls.push(path);return path.endsWith('dashboard-data')?dashboard():mutate('save');}};
  const navigate=()=>{};
  const modules={
    react,'react-router-dom':{useNavigate:()=>navigate},
    '../../utils/inventoryUpdates.mjs':{applyInventoryUpdate},
    '../../config/api.js':{backendUrl:(path)=>path,csrfFetch:async()=>({ok:true})},
    '../../config/roleDashboardConfig.js':{routeForRole:()=>'/user'},
    '../../services/shared/roleDashboardApi.js':roleApi,
    '../../config/super-admin/superAdminConfig.js':{INITIAL_FORMS},
    '../../services/super-admin/superAdminApi.js':adminApi,
    '../../utils/super-admin/superAdminUtils.js':{initials:()=>'',Logo:''},
  };
  const source=readFileSync(new URL(kind==='admin'?'../resources/js/hooks/super-admin/useSuperAdmin.js':'../resources/js/hooks/role-dashboard/useRoleDashboard.js',import.meta.url),'utf8');
  const context={module:{exports:{}},exports:{},require:(name)=>{if(!modules[name])throw new Error(name);return modules[name];},localStorage:{getItem:()=>null,setItem(){}},window:{matchMedia:()=>({matches:false}),location:{},confirm:()=>true},fetch:async()=>{calls.push('session');return {ok:true,json:async()=>({authenticated:true,role:preview?'super_admin':'Inventory_Controller'})};}};
  vm.runInNewContext(transformSync(source,{format:'cjs'}).code,context);
  const hook=context.module.exports.default;
  const render=()=>{cursor=0;effectCursor=0;return kind==='admin'?hook():hook({roleKey:'Inventory_Controller',previewMode:preview,config:{liveData:true,modules:[]}});};
  const settle=async()=>{while(pending.length)pending.shift()();await new Promise(setImmediate);};
  return {calls,render,settle,blockNextDashboard:()=>{block=true;},releaseDashboard:()=>release(),rejectDashboard:()=>rejectRelease()};
}

for(const action of ['handleStockIn','handleAdjustment','handleWriteOff','handleReceivePurchaseOrder']) {
  test(`staff ${action} saves once and makes no second session or dashboard request`,async()=>{
    const h=harness('staff');h.render();await h.settle();const before=h.render();
    assert.equal(before.loading,false);await before[action]({batch_id:1});h.render();await h.settle();const after=h.render();
    assert.equal(h.calls.filter(x=>x==='dashboard').length,1);assert.equal(h.calls.filter(x=>x==='session').length,1);
    assert.equal(after.data.products[0].available_stock,5);assert.equal(after.loading,false);
    assert.equal(after.data.settings,before.data.settings);
  });
}
test('admin stock-in merges its result without a second dashboard request',async()=>{
  const h=harness('admin');h.render();await h.settle();const before=h.render();
  await before.modalProps.onStockIn();h.render();await h.settle();const after=h.render();
  assert.equal(h.calls.filter(x=>x.endsWith('dashboard-data')).length,1);assert.equal(h.calls.filter(x=>x==='save').length,1);
  assert.equal(after.data.products[0].available_stock,5);assert.equal(after.loading,false);
});
test('failed staff save retains data and never starts a refresh',async()=>{
  const h=harness('staff',{fail:true});h.render();await h.settle();const before=h.render();
  await assert.rejects(()=>before.handleStockIn({}),/Rejected/);h.render();await h.settle();const after=h.render();
  assert.equal(after.data,before.data);assert.equal(h.calls.filter(x=>x==='dashboard').length,1);assert.equal(after.error,'Rejected');
});
test('role preview cannot mutate inventory',async()=>{
  const h=harness('staff',{preview:true});h.render();await h.settle();await h.render().handleStockIn({});
  assert.equal(h.calls.includes('roleStockIn'),false);
});
test('legacy backend response still falls back to a fresh dashboard for staged deployment',async()=>{
  const h=harness('staff',{legacy:true});h.render();await h.settle();await h.render().handleStockIn({});
  h.render();await h.settle();assert.equal(h.calls.filter(x=>x==='dashboard').length,2);
});
test('inventory import callback can apply its response without triggering a dashboard reload',async()=>{
  const h=harness('staff');h.render();await h.settle();h.render().refresh({inventory_update:{product_stocks:[{product_id:1,available_stock:11}],batches:[]}});
  h.render();await h.settle();assert.equal(h.render().data.products[0].available_stock,11);assert.equal(h.calls.filter(x=>x==='dashboard').length,1);
});

for(const kind of ['staff','admin'])test(`${kind} ignores an old dashboard response arriving after a successful inventory save`,async()=>{
  const h=harness(kind);h.render();await h.settle();h.render();h.blockNextDashboard();h.render().refresh();h.render();await h.settle();
  const pending=h.render();if(kind==='staff')await pending.handleStockIn({});else await pending.modalProps.onStockIn();
  h.releaseDashboard();await h.settle();assert.equal(h.render().data.products[0].available_stock,5);
});

for(const kind of ['staff','admin'])test(`${kind} ignores an old refresh error after a successful save`,async()=>{
  const h=harness(kind);h.render();await h.settle();h.render();h.blockNextDashboard();h.render().refresh();h.render();await h.settle();
  const pending=h.render();if(kind==='staff')await pending.handleStockIn({});else await pending.modalProps.onStockIn();
  h.rejectDashboard();await h.settle();const after=h.render();assert.equal(after.data.products[0].available_stock,5);assert.equal(after.error,'');
});
