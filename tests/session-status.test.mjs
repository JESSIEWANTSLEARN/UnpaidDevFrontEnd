import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionStatusReader} from '../resources/js/utils/sessionStatusRequest.mjs';

test('concurrent gate and presence consumers share one request and parsed result', async () => {
    let calls=0, finish;
    const read=createSessionStatusReader(()=>{calls++;return new Promise(resolve=>{finish=resolve;});});
    const first=read(), second=read();
    assert.equal(first,second);
    await Promise.resolve();
    assert.equal(calls,1);
    const result={response:{ok:true},data:{authenticated:true,role:'Inventory_Controller',idle_seconds:86400}};
    finish(result);
    assert.equal(await first,result);
    assert.equal(await second,result);
});

test('next page entry reads the server again, including a newly expired session', async () => {
    let calls=0;
    const read=createSessionStatusReader(async()=>({data:{authenticated:++calls===1}}));
    assert.equal((await read()).data.authenticated,true);
    assert.equal((await read()).data.authenticated,false);
    assert.equal(calls,2);
});

test('a failed shared read is released so Retry can recover', async () => {
    let calls=0;
    const read=createSessionStatusReader(async()=>{if(++calls===1)throw new Error('offline');return {data:{authenticated:true}};});
    const results=await Promise.allSettled([read(),read()]);
    assert.ok(results.every(x=>x.status==='rejected'));
    assert.equal(calls,1);
    assert.equal((await read()).data.authenticated,true);
    assert.equal(calls,2);
});
