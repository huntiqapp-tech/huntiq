'use strict';

const http=require('http');
const fs=require('fs');
const os=require('os');
const path=require('path');
const {spawn}=require('child_process');

const ROOT=path.resolve(__dirname,'..','..');

function mime(file){
  if(file.endsWith('.html'))return 'text/html; charset=utf-8';
  if(file.endsWith('.js'))return 'text/javascript; charset=utf-8';
  if(file.endsWith('.css'))return 'text/css; charset=utf-8';
  if(file.endsWith('.webmanifest'))return 'application/manifest+json';
  if(file.endsWith('.json'))return 'application/json; charset=utf-8';
  if(file.endsWith('.svg'))return 'image/svg+xml';
  return 'application/octet-stream';
}

function startStaticServer(){
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');
    let rel=decodeURIComponent(url.pathname);
    if(rel==='/'||rel==='')rel='index.html';
    else rel=rel.replace(/^\/+/,'');
    const file=path.normalize(path.join(ROOT,rel));
    if(!file.startsWith(ROOT)){res.writeHead(403);res.end('forbidden');return;}
    fs.readFile(file,(err,data)=>{
      if(err){res.writeHead(err.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});res.end(err.code==='ENOENT'?'Not found':'error');return;}
      res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store'});
      res.end(data);
    });
  });
  return new Promise(resolve=>{
    server.listen(0,'127.0.0.1',()=>{
      const {port}=server.address();
      resolve({server,port,origin:`http://127.0.0.1:${port}`});
    });
  });
}

function findChrome(){
  const candidates=[
    process.env.CHROME_PATH,
    process.env.GOOGLE_CHROME_SHIM,
    '/usr/local/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome'
  ].filter(Boolean);
  const existing=candidates.find(file=>fs.existsSync(file));
  if(existing)return existing;
  try{
    const {execSync}=require('child_process');
    const resolved=execSync('command -v google-chrome-stable || command -v google-chrome || command -v chromium-browser || command -v chromium || command -v chrome',{encoding:'utf8'}).trim().split('\n').filter(Boolean)[0];
    return resolved||null;
  }catch(_err){
    return null;
  }
}

function waitForDevtools(child,timeoutMs=20000){
  return new Promise((resolve,reject)=>{
    let buf='';
    const timer=setTimeout(()=>reject(new Error(`Chrome DevTools port not found. stderr=${buf.slice(-500)}`)),timeoutMs);
    const onData=chunk=>{
      buf+=chunk.toString();
      const match=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if(match){
        clearTimeout(timer);
        child.stderr.off('data',onData);
        resolve(match[1]);
      }
    };
    child.stderr.on('data',onData);
  });
}

async function jsonGet(url){
  const res=await fetch(url);
  if(!res.ok)throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

function connectWs(url){
  return new Promise((resolve,reject)=>{
    const ws=new WebSocket(url);
    ws.addEventListener('open',()=>resolve(ws),{once:true});
    ws.addEventListener('error',event=>reject(event.error||new Error('WebSocket error')),{once:true});
  });
}

function debugOriginFromWs(wsUrl){
  const parsed=new URL(wsUrl);
  return `http://${parsed.hostname}:${parsed.port}`;
}

class CdpSession{
  constructor(ws){
    this.ws=ws;
    this.id=0;
    this.pending=new Map();
    this.console=[];
    this.exceptions=[];
    this.ws.addEventListener('message',event=>{
      const msg=JSON.parse(event.data.toString());
      if(msg.method==='Runtime.consoleAPICalled'){
        const text=(msg.params.args||[]).map(arg=>arg.value==null?arg.description||'':String(arg.value)).join(' ');
        this.console.push({type:msg.params.type,text});
      }
      if(msg.method==='Runtime.exceptionThrown'){
        const detail=msg.params.exceptionDetails||{};
        this.exceptions.push(detail.text||(detail.exception&&detail.exception.description)||'exception');
      }
      if(msg.id&&this.pending.has(msg.id)){
        const {resolve,reject}=this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if(msg.error)reject(new Error(msg.error.message||JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method,params={}){
    const id=++this.id;
    this.ws.send(JSON.stringify({id,method,params}));
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{
        if(this.pending.has(id)){
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      },25000);
      this.pending.set(id,{
        resolve:value=>{clearTimeout(timer);resolve(value);},
        reject:err=>{clearTimeout(timer);reject(err);}
      });
    });
  }
  async evaluate(expression){
    const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(result.exceptionDetails){
      const detail=result.exceptionDetails;
      throw new Error(detail.text||(detail.exception&&detail.exception.description)||'evaluate failed');
    }
    return result.result?result.result.value:undefined;
  }
  close(){
    try{this.ws.close();}catch(_err){}
  }
}

async function launchChrome(){
  const chrome=findChrome();
  if(!chrome)return null;
  const userDataDir=fs.mkdtempSync(path.join(os.tmpdir(),'huntiq-e2e-'));
  const child=spawn(chrome,[
    '--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage',
    '--disable-extensions','--no-first-run','--no-default-browser-check',
    '--disable-background-networking','--disable-sync','--mute-audio',
    `--user-data-dir=${userDataDir}`,'--remote-debugging-port=0','about:blank'
  ],{stdio:['ignore','pipe','pipe']});
  const inspector=await waitForDevtools(child);
  const origin=debugOriginFromWs(inspector);
  const version=await jsonGet(`${origin}/json/version`);
  const browserWs=await connectWs(version.webSocketDebuggerUrl);
  const browser=new CdpSession(browserWs);
  return {chrome,child,browser,userDataDir,debugOrigin:origin};
}

async function waitUntil(page,expression,timeoutMs=15000){
  const started=Date.now();
  let last;
  while(Date.now()-started<timeoutMs){
    last=await page.evaluate(expression);
    if(last)return last;
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw new Error(`Timed out waiting for ${expression}; last=${JSON.stringify(last)}`);
}

async function openPage(session,url,{beforeLoad=null}={}){
  const {targetId}=await session.browser.send('Target.createTarget',{url:'about:blank'});
  const targets=await jsonGet(`${session.debugOrigin}/json/list`);
  const target=targets.find(item=>item.id===targetId)||targets.find(item=>item.type==='page');
  const pageWs=await connectWs(target.webSocketDebuggerUrl);
  const page=new CdpSession(pageWs);
  await page.send('Runtime.enable');
  await page.send('Page.enable');
  await page.send('Network.enable');
  if(beforeLoad)await page.send('Page.addScriptToEvaluateOnNewDocument',{source:beforeLoad});
  await page.send('Page.navigate',{url});
  await waitUntil(page,'document.readyState==="complete"');
  await waitUntil(page,'Boolean(document.body&&document.body.dataset.huntiqStatus&&document.body.dataset.huntiqStatus!=="loading")');
  return page;
}

async function closeChrome(session){
  if(!session)return;
  try{session.browser.close();}catch(_err){}
  if(session.child&&session.child.pid){
    try{process.kill(session.child.pid,'SIGTERM');}catch(_err){}
  }
}

module.exports={startStaticServer,findChrome,launchChrome,openPage,closeChrome,waitUntil,CdpSession};
