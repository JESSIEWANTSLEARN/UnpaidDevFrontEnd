import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';

function customer({wallet=false, failRefresh=false}={}) {
 const slots=[],effects=[],pending=[],calls=[];let cursor=0,ei=0;
 const react={
  createElement:(type,props,...children)=>({type,props:{...props,children}}),
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];},
  useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useMemo:fn=>fn(),
  useEffect(fn,deps){const i=ei++;if(!effects[i]||deps.some((v,j)=>!Object.is(v,effects[i].deps[j])))pending.push(()=>{effects[i]?.cleanup?.();effects[i]={deps,cleanup:fn()};});},
 };
 const request=async(path,options={})=>{
  const method=options.method||'GET';calls.push({path,method});let data={};
  if(path==='/api/user/me')data={user:{user_id:1,name:'Customer',email:'customer@example.test'},stats:{total_orders:1}};
  else if(path==='/api/store/products')data={products:[{product_id:1,name:'Product',sku:'P1',category:'Fixture',description:'Test',unit_price:10,available_stock:20}]};
  else if(path==='/api/user/orders'&&method==='POST')data={order_id:2,total_amount:10};
  else if(path.includes('/cancel'))data={message:'Cancelled'};
  else if(path.startsWith('/api/user/orders?')) {
   if(failRefresh)throw new Error('Unavailable');
   const id=Number(new URLSearchParams(path.split('?')[1]).get('order_id'));
   data={partial_order:true,orders:[{order_id:id,status:id===1?'CANCELLED':'PENDING',order_date:'2026-10-18',items:[],payment:{payment_method:wallet?'WALLET':'CASH_ON_DELIVERY'}}],stats:{total_orders:id===2?2:1}};
  } else if(path==='/api/user/orders')data={orders:[{order_id:1,status:'PENDING',order_date:'2026-10-17',items:[],payment:{payment_method:wallet?'WALLET':'CASH_ON_DELIVERY'}}]};
  else if(path==='/api/user/notifications')data={notifications:[]};
  else if(path==='/api/user/wallet')data={wallet:{balance:'100.00',status:'ACTIVE'},transactions:[]};
  return {ok:true,status:200,json:async()=>data,text:async()=>JSON.stringify(data)};
 };
 const modules={
  react,'react-router-dom':{useNavigate:()=>()=>{}},'../../config/api.js':{csrfFetch:request},
  '../../utils/visiblePolling.mjs':{startVisiblePolling:()=>()=>{}},
  '../../utils/customer/customerStoreUtils.js':{normalizeProduct:p=>p,ORDER_STATUS_FILTERS:[],orderMatchesFilter:()=>true},
  '../../services/customer/cartStorage.js':{cartItemCount:cart=>Object.keys(cart).length,clearGuestCart(){},mergeCartsWithProducts:()=>({}),readGuestCart:()=>({}),readUserCart:()=>({}),writeUserCart(){}},
 };
 const context={module:{exports:{}},exports:{},URLSearchParams,FormData,console,localStorage:{getItem:()=>null,setItem(){}},window:{matchMedia:()=>({matches:false}),scrollTo(){},setTimeout:()=>1},setTimeout:()=>1,clearTimeout(){},require:(name)=>modules[name]??(name.endsWith('.css')?{}:{default:name,CustomerStoreSkeleton:name})};
 vm.runInNewContext(transformSync(readFileSync(new URL('../resources/js/pages/customer/SystemUser.jsx',import.meta.url),'utf8'),{format:'cjs',loader:'jsx'}).code,context);
 const render=()=>{cursor=0;ei=0;return context.module.exports.default({});};
 const settle=async()=>{while(pending.length)pending.shift()();await new Promise(setImmediate);};
 const ctx=(tree)=>Object.assign({},...tree.props.children.filter(Boolean).map(child=>child.props?.ctx||{}));
 return{calls,render,settle,ctx};
}
for(const wallet of [false,true])test(`checkout updates one order and notifications${wallet?' and wallet':''}, preserving profile/catalog`,async()=>{
 const h=customer({wallet});h.render();await h.settle();let before=h.ctx(h.render());before.setCart({1:{product_id:1,quantity:1}});before.setPaymentMethod(wallet?'WALLET':'CASH_ON_DELIVERY');before=h.ctx(h.render());
 const count=h.calls.length;await before.checkout();const after=h.ctx(h.render());const calls=h.calls.slice(count);
 assert.equal(calls.filter(x=>x.path==='/api/user/orders'&&x.method==='POST').length,1);
 assert.ok(calls.some(x=>x.path.includes('order_id=2')));assert.equal(calls.filter(x=>x.path==='/api/user/wallet').length,wallet?1:0);
 assert.equal(calls.some(x=>x.path==='/api/user/me'||x.path==='/api/store/products'),false);
 assert.equal(after.products,before.products);assert.equal(after.user,before.user);assert.equal(after.orders.length,2);assert.equal(after.stats.total_orders,2);assert.equal(after.checkoutStep,'success');assert.equal(after.cartCount,0);
});
test('customer cancellation refreshes only the affected order without catalog/profile reload',async()=>{
 const h=customer();h.render();await h.settle();const before=h.ctx(h.render());const count=h.calls.length;assert.equal(await before.cancelOrder(1,'Changed plans'),true);const after=h.ctx(h.render());
 assert.equal(after.orders[0].status,'CANCELLED');assert.equal(after.products,before.products);assert.equal(h.calls.slice(count).some(x=>x.path==='/api/user/me'||x.path==='/api/store/products'||x.path==='/api/user/wallet'),false);
});
test('checkout success is retained when follow-up read fails; mutation is not replayed',async()=>{
 const h=customer({failRefresh:true});h.render();await h.settle();h.ctx(h.render()).setCart({1:{product_id:1,quantity:1}});await h.ctx(h.render()).checkout();const after=h.ctx(h.render());assert.equal(after.checkoutStep,'success');assert.match(after.error,/Order saved/);assert.equal(h.calls.filter(x=>x.path==='/api/user/orders'&&x.method==='POST').length,1);
});
