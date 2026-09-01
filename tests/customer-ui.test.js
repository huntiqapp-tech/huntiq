const assert=require('assert');
const UI=require('../lib/customer-ui');
assert.equal(UI.parseNumber('$72 net'),'72');
function fakeCard({score=0,roi=0,profit=0,badge=''}){const map={'.flip':{textContent:String(score)},'.roi':{textContent:`${roi}%`},'.profit':{textContent:`$${profit}`},'.badge':{textContent:badge}};return{querySelector:s=>map[s]||null};}
assert.equal(UI.decisionFromCard(fakeCard({score:94,roi:147,profit:72})),'STRONG BUY');
assert.equal(UI.decisionFromCard(fakeCard({score:80,roi:45,profit:55})),'BUY');
assert.equal(UI.decisionFromCard(fakeCard({score:60,roi:12,profit:20,badge:'Probable Error'})),'WATCH');
assert.equal(UI.decisionFromCard(fakeCard({score:40,roi:10,profit:-5})),'WAIT');
console.log('customer-ui tests passed');