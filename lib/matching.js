(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HuntIQMatching=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const compact=s=>clean(s).replace(/\s+/g,'');
const tokens=s=>new Set(clean(s).split(' ').filter(x=>x.length>1));
const jaccard=(a,b)=>{const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/(A.size+B.size-i);};
const first=(obj,keys)=>{for(const k of keys){const v=obj&&obj[k];if(v!=null&&String(v).trim())return String(v).trim();}return'';};
const gtin=o=>first(o,['gtin','upc','ean','barcode']).replace(/\D/g,'');
const model=o=>compact(first(o,['model','modelNumber','manufacturerModelNumber','mpn']));
const brand=o=>compact(first(o,['brand','manufacturer']));
const title=o=>first(o,['title','name','productName']);
const condition=o=>clean(first(o,['condition','itemCondition']));
const bundleWords=['bundle','combo','kit with','2 pack','two pack','3 pack','three pack','lot of','pair of'];
const refurbWords=['refurbished','renewed','remanufactured','reconditioned'];
function flags(o={}){const t=clean(title(o));return{bundle:bundleWords.some(w=>t.includes(w)),refurb:refurbWords.some(w=>t.includes(w))||condition(o).includes('refurb'),openBox:condition(o).includes('open box')||t.includes('open box')};}
function productMatch(retail={},resale={}){const rg=gtin(retail),sg=gtin(resale),rm=model(retail),sm=model(resale),rb=brand(retail),sb=brand(resale);const rf=flags(retail),sf=flags(resale);let score=0;const reasons=[];
if(rg&&sg){if(rg===sg){score=98;reasons.push('exact-gtin');}else{return{score:0,label:'Mismatch',reasons:['gtin-mismatch'],identity:'gtin'};}}
if(!score&&rm&&sm){if(rm===sm){score=92;reasons.push('exact-model');}else if(rb&&sb&&rb===sb)return{score:8,label:'Mismatch',reasons:['model-mismatch'],identity:'model'};}
if(!score){const sim=jaccard(title(retail),title(resale));score=Math.round(sim*72);if(rb&&sb){score+=rb===sb?14:-22;reasons.push(rb===sb?'brand-match':'brand-mismatch');}if(sim>=.65)reasons.push('strong-title');else if(sim>=.4)reasons.push('partial-title');else reasons.push('weak-title');}
if(rf.bundle!==sf.bundle){score-=28;reasons.push('bundle-mismatch');}
if(rf.refurb!==sf.refurb){score-=22;reasons.push('refurb-mismatch');}
if(rf.openBox!==sf.openBox){score-=10;reasons.push('condition-mismatch');}
score=Math.round(clamp(score,0,100));const label=score>=90?'Exact':score>=75?'Strong':score>=60?'Possible':score>=40?'Weak':'Mismatch';return{score,label,reasons,identity:rg&&sg?'gtin':rm&&sm?'model':'title'};}
function filterMatched(retail,list=[],minimum=75){return(list||[]).map(item=>({item,match:productMatch(retail,item)})).filter(x=>x.match.score>=minimum).sort((a,b)=>b.match.score-a.match.score);}
return{clean,jaccard,productMatch,filterMatched};
});