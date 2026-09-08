importScripts('./lib/pwa-cache-manifest.js');
const MANIFEST=self.HUNTIQ_PWA_MANIFEST||{};
const CACHE=MANIFEST.cache||'huntiq-public-v111';
const REQUIRED=Array.isArray(MANIFEST.required)?MANIFEST.required:['./','./index.html'];
const OPTIONAL=Array.isArray(MANIFEST.optional)?MANIFEST.optional:[];

async function addUrl(cache,url,required){
  try{
    await cache.add(url);
  }catch(err){
    if(required)throw err;
  }
}

async function addAllSafe(cache,urls,required){
  for(const url of urls)await addUrl(cache,url,required);
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await addAllSafe(cache,REQUIRED,true);
    await addAllSafe(cache,OPTIONAL,false);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

function isNavigationRequest(request){
  if(request.mode==='navigate')return true;
  const accept=request.headers.get('accept')||'';
  return request.destination==='document'&&accept.includes('text/html');
}

function notFound(){
  return new Response('Not found',{status:404,statusText:'Not Found',headers:{'Content-Type':'text/plain; charset=utf-8'}});
}

async function navigationResponse(request){
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const copy=response.clone();
      const cache=await caches.open(CACHE);
      await cache.put('./index.html',copy);
    }
    return response;
  }catch(_err){
    return (await caches.match('./index.html'))||(await caches.match('./'))||notFound();
  }
}

async function assetResponse(event){
  const cached=await caches.match(event.request);
  const refresh=fetch(event.request).then(response=>{
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>null);
  if(cached){
    event.waitUntil(refresh);
    return cached;
  }
  const network=await refresh;
  if(network)return network;
  return notFound();
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(isNavigationRequest(event.request)){
    event.respondWith(navigationResponse(event.request));
    return;
  }
  event.respondWith(assetResponse(event));
});

