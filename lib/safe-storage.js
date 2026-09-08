(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.HuntIQSafeStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

function memoryStore(){
  const map=new Map();
  return{
    getItem(key){return map.has(key)?map.get(key):null;},
    setItem(key,value){map.set(String(key),String(value));},
    removeItem(key){map.delete(key);},
    clear(){map.clear();}
  };
}

function probeStore(candidate){
  if(!candidate)return null;
  try{
    const probe='__huntiq_storage_probe__';
    candidate.setItem(probe,'1');
    const ok=candidate.getItem(probe)==='1';
    candidate.removeItem(probe);
    return ok?candidate:null;
  }catch(_err){
    return null;
  }
}

function resolveStore(preferred){
  if(preferred){
    const probed=probeStore(preferred);
    if(probed)return probed;
  }
  const local=typeof localStorage!=='undefined'?probeStore(localStorage):null;
  if(local)return local;
  const session=typeof sessionStorage!=='undefined'?probeStore(sessionStorage):null;
  if(session)return session;
  return memoryStore();
}

function isHostileKey(value){
  const key=String(value);
  if(!key||key.length>240)return true;
  if(key==='__proto__'||key==='constructor'||key==='prototype')return true;
  if(/[<>\u0000]/.test(key))return true;
  return false;
}

function sanitizeIdList(value){
  if(!Array.isArray(value))return [];
  const out=[];
  const seen=new Set();
  for(const item of value){
    if(item==null||typeof item==='object')continue;
    const id=String(item).trim();
    if(isHostileKey(id)||seen.has(id))continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function readRaw(store,key){
  try{
    return store.getItem(key);
  }catch(_err){
    return null;
  }
}

function writeRaw(store,key,value){
  try{
    store.setItem(key,value);
    return true;
  }catch(_err){
    return false;
  }
}

function clearKey(store,key){
  try{store.removeItem(key);}catch(_err){}
}

function readList(key,preferred){
  const store=preferred||resolveStore();
  const raw=readRaw(store,key);
  if(raw==null||raw==='')return [];
  try{
    const parsed=JSON.parse(raw);
    const list=sanitizeIdList(parsed);
    if(!Array.isArray(parsed)){
      clearKey(store,key);
      return [];
    }
    return list;
  }catch(_err){
    clearKey(store,key);
    return [];
  }
}

function writeList(key,ids,preferred){
  const store=preferred||resolveStore();
  const list=sanitizeIdList([...ids||[]]);
  const ok=writeRaw(store,key,JSON.stringify(list));
  return{ok,ids:list,persisted:ok};
}

return{memoryStore,resolveStore,sanitizeIdList,readList,writeList,readRaw,writeRaw};
});
