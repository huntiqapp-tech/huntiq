const assert=require('assert');
const C=require('../lib/retailer-observation-contract');

const good={retailer:'Best Buy',sku:'6531631',storeId:'123',currentPrice:399.99,regularPrice:599.99,observedAt:'2026-09-01T20:00:00Z',source:'Best Buy API',sourceFamily:'retailer',sourceUrl:'https://example.test/p',verificationState:'retailer-api',evidenceQuality:.98,provider:'bestbuy',providerRecordId:'6531631:123',retrievedAt:'2026-09-01T20:00:01Z',retentionPolicy:'source-limited',redistributionAllowed:false};
let v=C.validateRetailObservation(good);
assert.strictEqual(v.ok,true);assert.deepStrictEqual(v.errors,[]);assert.strictEqual(C.observationIdentity(good),'best buy::123::6531631');assert.strictEqual(C.canPersistHistorically(good),true);assert.strictEqual(C.canRedistribute(good),false);

const bad={...good,currentPrice:-1,evidenceQuality:1.5,observedAt:'not-a-date',inventoryCount:-4,retentionPolicy:'forever'};
v=C.validateRetailObservation(bad);assert.strictEqual(v.ok,false);for(const e of ['negative-current-price','invalid-inventory-count','invalid-observed-at','invalid-evidence-quality','invalid-retention-policy'])assert(v.errors.includes(e),e);

const ephemeral={...good,retentionPolicy:'ephemeral'};assert.strictEqual(C.canPersistHistorically(ephemeral),false);
const redistributable={...good,retentionPolicy:'unrestricted',redistributionAllowed:true};assert.strictEqual(C.canRedistribute(redistributable),true);
const unknown={...good,retentionPolicy:'unknown'};v=C.validateRetailObservation(unknown);assert(v.warnings.includes('retention-policy-unknown'));assert.strictEqual(C.canPersistHistorically(unknown),false);
console.log('retailer-observation-contract tests passed');
