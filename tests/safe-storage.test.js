'use strict';
const assert=require('assert');
const {sanitizeIdList,readList,writeList,memoryStore}=require('../lib/safe-storage');

assert.deepEqual(sanitizeIdList(['a','b','a','__proto__','<script>',{id:'x'},null,'']),['a','b']);
assert.deepEqual(sanitizeIdList('not-an-array'),[]);
assert.deepEqual(sanitizeIdList({0:'x',length:1}),[]);

const store=memoryStore();
assert.deepEqual(readList('huntiq_watchlist_v1',store),[]);

store.setItem('huntiq_watchlist_v1','{not json');
assert.deepEqual(readList('huntiq_watchlist_v1',store),[]);
assert.equal(store.getItem('huntiq_watchlist_v1'),null,'corrupt JSON must be cleared');

store.setItem('huntiq_watchlist_v1',JSON.stringify({hostile:true}));
assert.deepEqual(readList('huntiq_watchlist_v1',store),[]);

store.setItem('huntiq_watchlist_v1',JSON.stringify(['ok','__proto__',['nested'],'<img>']));
assert.deepEqual(readList('huntiq_watchlist_v1',store),['ok']);

const saved=writeList('huntiq_watchlist_v1',['hd-m18','bb-tv'],store);
assert.equal(saved.ok,true);
assert.deepEqual(JSON.parse(store.getItem('huntiq_watchlist_v1')),['hd-m18','bb-tv']);

const quotaStore={
  getItem(){return '[]';},
  setItem(){const err=new Error('quota');err.name='QuotaExceededError';throw err;},
  removeItem(){}
};
const quota=writeList('huntiq_watchlist_v1',['x'],quotaStore);
assert.equal(quota.ok,false);
assert.deepEqual(quota.ids,['x']);

const securityStore={
  getItem(){const err=new Error('blocked');err.name='SecurityError';throw err;},
  setItem(){const err=new Error('blocked');err.name='SecurityError';throw err;},
  removeItem(){const err=new Error('blocked');err.name='SecurityError';throw err;}
};
assert.doesNotThrow(()=>readList('huntiq_watchlist_v1',securityStore));
assert.deepEqual(readList('huntiq_watchlist_v1',securityStore),[]);
assert.equal(writeList('huntiq_watchlist_v1',['x'],securityStore).ok,false);

console.log('safe-storage tests passed');
