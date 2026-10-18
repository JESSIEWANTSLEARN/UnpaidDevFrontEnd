import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';

function harness(previewMode=false){
 const slots=[],effects=[],pending=[],calls=[];let cursor=0,ei=0;
 const react={useMemo:fn=>fn(),useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];},useEffect(fn,deps){const i=ei++;if(!effects[i]||deps.some((v,j)=>!Object.is(v,effects[i][j])))pending.push(()=>{effects[i]=deps;fn();});}};
 const untouched={user_id:2,name:'Other',role:'System_User',account_status:'active'};
 const api={loadUserAdminDashboard:async(preview,id)=>{calls.push(['read',id]);return id?{partial_users:true,users:[{user_id:id,name:'Updated',role:'System_User',account_status:'active'}],metrics:{total_users:2}}:{users:[{user_id:1,name:'Old',role:'System_User',account_status:'active'},untouched],metrics:{total_users:2}};},createManagedUser:async()=>{calls.push(['create']);return{user_id:3};},updateManagedUser:async(id)=>{calls.push(['update',id]);return{message:'Saved'};},loadManagedUserSessions:async(id)=>{calls.push(['sessions',id]);return{sessions:[{session_id:'S1'}]};},revokeManagedUserSession:async()=>({}),revokeAllManagedUserSessions:async()=>({})};
 const context={module:{exports:{}},exports:{},window:{confirm:()=>true},require:name=>name==='react'?react:api};
 vm.runInNewContext(transformSync(readFileSync(new URL('../resources/js/hooks/user-admin/useUserAdminDashboard.js',import.meta.url),'utf8'),{format:'cjs'}).code,context);
 const render=()=>{cursor=0;ei=0;return context.module.exports.default({previewMode});};
 const settle=async()=>{while(pending.length)pending.shift()();await new Promise(setImmediate);};return{render,settle,calls,untouched};
}
test('User Admin update fetches one account and preserves other account objects',async()=>{
 const h=harness();h.render();await h.settle();await h.render().handleUpdate(1,{});const after=h.render();assert.deepEqual(h.calls.filter(c=>c[0]==='read'),[['read',null],['read',1]]);assert.equal(after.data.users.find(u=>u.user_id===2),h.untouched);assert.equal(after.data.metrics.total_users,2);
});
test('User Admin creation and session revocation refresh the affected account',async()=>{
 const h=harness();h.render();await h.settle();await h.render().handleCreate({});assert.equal(h.calls.at(-1)[1],3);
 await h.render().openSessions({user_id:1,name:'Test'});await h.render().handleRevoke('S1');assert.ok(h.calls.some(c=>c[0]==='read'&&c[1]===1));
});
test('User Admin preview cannot create or update accounts',async()=>{
 const h=harness(true);h.render();await h.settle();await h.render().handleCreate({});await h.render().handleUpdate(1,{});assert.equal(h.calls.some(c=>['create','update'].includes(c[0])),false);
});
