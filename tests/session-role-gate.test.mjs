import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
const source=transformSync(readFileSync(new URL('../resources/js/components/shared/session/SessionRoleGate.jsx',import.meta.url),'utf8'),{format:'cjs',jsx:'automatic',loader:'jsx'}).code;
function harness(result) {
    const slots=[],effects=[];let cursor=0;
    const Navigate=()=>{}, Provider=()=>{};
    const modules={
        react:{useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},useEffect(fn){effects.push(fn);}},
        'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
        'react-router-dom':{Navigate},
        '../../../services/auth/sessionStatus.js':{VerifiedSessionContext:{Provider},readSessionStatus:async()=>result},
    };
    const context={module:{exports:{}},exports:{},AbortController,require:name=>{if(!modules[name])throw new Error(name);return modules[name];}};
    vm.runInNewContext(source,context);
    const Gate=context.module.exports.default;
    return {Navigate,Provider,render(role){cursor=0;return Gate({role,children:'PRIVATE'});},async verify(){effects.shift()();await new Promise(setImmediate);}};
}
const roles=['super_admin','Operations_Manager','Purchasing_Manager','Purchasing_Staff','Warehouse_Admin','Inventory_Controller','Sales_Manager','Sales_Staff','User_Admin','System_User'];
for(const role of roles) {
    test(`gate hides ${role} content until confirmed and rejects another role`,async()=>{
        const allowed=harness({response:{ok:true,status:200},data:{authenticated:true,role}});
        assert.equal(allowed.render(role).type,'main');await allowed.verify();
        const page=allowed.render(role);
        assert.equal(page.type,allowed.Provider);assert.equal(page.props.children,'PRIVATE');
        assert.equal(allowed.render('unrelated-role').type,'main');
        const denied=harness({response:{ok:true,status:200},data:{authenticated:true,role:'unrelated-role'}});
        denied.render(role);await denied.verify();assert.equal(denied.render(role).type,denied.Navigate);
    });
}
test('guest is sent to login and server failure never exposes protected content',async()=>{
    const guest=harness({response:{ok:true,status:200},data:{authenticated:false}});
    guest.render('super_admin');await guest.verify();assert.equal(guest.render('super_admin').type,guest.Navigate);
    const failure=harness({response:{ok:false,status:503},data:{}});
    failure.render('super_admin');await failure.verify();assert.equal(failure.render('super_admin').type,'main');
});
