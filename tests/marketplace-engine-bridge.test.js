const assert=require('assert');
const bridge=require('../lib/marketplace-engine-bridge');
const base={buyPrice:70,marketValue:100,feeRate:.15,shipping:15,buyerShippingRevenue:15,marketplaceFeeOnShipping:true};
const feeOn=bridge.economics(base);const feeOff=bridge.economics({...base,marketplaceFeeOnShipping:false});
assert.equal(feeOn.grossSellerRevenue,115);assert.equal(feeOn.marketplaceFeeBase,115);assert.equal(feeOff.marketplaceFeeBase,100);assert(feeOn.fees>feeOff.fees);assert(feeOn.profit<feeOff.profit);assert(feeOn.roi<feeOff.roi);
const taxFee=bridge.economics({buyPrice:70,marketValue:100,feeRate:.15,buyerSalesTax:8,marketplaceFeeOnSalesTax:true});assert.equal(taxFee.marketplaceFeeBase,108);assert.equal(taxFee.buyerSalesTax,8);
const evaluated=bridge.evaluateOpportunity({price:70,priceHistory:[100,100,100,100],referencePrice:100,comps:{d30:100,d60:100,d90:100,soldCount:30,soldWindowDays:90,activeListingCount:5,currentAsks:[100]},feeRate:.15,shipping:15,buyerShippingRevenue:15,marketplaceFeeOnShipping:true,dataQuality:1,evidenceQuality:1});assert.equal(evaluated.economics.marketplaceFeeBase,115);assert.equal(evaluated.economics.grossSellerRevenue,115);assert(evaluated.flipScore>=0);
console.log('marketplace-engine-bridge tests passed');