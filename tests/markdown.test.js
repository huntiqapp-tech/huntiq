const assert=require('assert');
const M=require('../lib/markdown');
const obs=[
 {price:199,inventory:8,observedAt:'2026-08-01T12:00:00Z'},
 {price:149,inventory:7,observedAt:'2026-08-08T12:00:00Z'},
 {price:79,inventory:5,observedAt:'2026-08-15T12:00:00Z'},
 {price:29,inventory:3,observedAt:'2026-08-22T12:00:00Z'},
 {price:3.03,inventory:2,observedAt:'2026-08-29T12:00:00Z'}
];
const events=M.detectMarkdownEvents(obs);assert.equal(events.length,4);assert(events[3].dropPct>80);
const velocity=M.markdownVelocity(obs);assert(velocity.velocityScore>=60);assert.equal(velocity.events,4);
const inv=M.inventorySignal(obs);assert.equal(inv.start,8);assert.equal(inv.current,2);assert(inv.signal>=70);
const penny=M.pennyProbability({observations:obs,currentPrice:3.03,referencePrice:199,anomalyConfidence:92,dataQuality:0.95});assert(penny.score>=65);assert(['High','Very High'].includes(penny.label));
const normal=M.pennyProbability({observations:[{price:99,observedAt:'2026-08-01'},{price:95,observedAt:'2026-08-29'}],currentPrice:95,referencePrice:99,anomalyConfidence:12,dataQuality:0.9});assert(normal.score<45);
console.log('markdown intelligence tests passed');