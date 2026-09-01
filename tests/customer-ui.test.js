const assert=require('assert');
const UI=require('../lib/customer-ui');
assert.equal(UI.parseNumber('$72 net'),'72');
function fakeCard({score=0,roi=0,profit=0,badge='',confidence='',drop=''}){const map={'.flip':{textContent:String(score)},'.roi':{textContent:`${roi}%`},'.profit':{textContent:`$${profit}`},'.badge':{textContent:badge},'.confidence span':{textContent:confidence},'.drop':{textContent:drop}};return{querySelector:s=>map[s]||null};}
assert.equal(UI.decisionFromCard(fakeCard({score:94,roi:147,profit:72})),'STRONG BUY');
assert.equal(UI.decisionFromCard(fakeCard({score:80,roi:45,profit:55})),'BUY');
assert.equal(UI.decisionFromCard(fakeCard({score:60,roi:12,profit:20,badge:'Probable Error'})),'WATCH');
assert.equal(UI.decisionFromCard(fakeCard({score:40,roi:10,profit:-5})),'WAIT');
const signals=UI.signalSummary(fakeCard({confidence:'Anomaly 88% · Evidence 92% · Resale band confidence 78% · Alert eligible',drop:'68% below historical baseline · Max buy $61 · STRONG BUY'}));
assert.deepEqual(signals,{evidence:92,resaleConfidence:78,anomalyConfidence:88,maxBuy:'$61',alertReady:true});
console.log('customer-ui tests passed');