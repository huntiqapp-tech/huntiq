(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.HuntIQEnpCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  /**
   * No-scrape ENP calculator.
   *
   * ROI basis: acquisition (cash out the door), not sticker buy.
   *   acquisition = buy + tax(buy) + acquireShip
   *   sellFees    = referralRate * sell + fbaOrShipOut + otherFees
   *   profit/ENP  = sell - sellFees - acquisition
   *   ROI         = profit / acquisition
   *
   * Max buy solves both:
   *   profit >= minProfit  AND  ROI >= targetRoi
   * using netProceeds = sell * (1 - referralRate) - fbaOrShipOut - otherFees
   *   profitCap = (netProceeds - minProfit - acquireShip) / (1 + taxRate)
   *   roiCap    = (netProceeds / (1 + targetRoi) - acquireShip) / (1 + taxRate)
   *   maxBuy    = max(0, min(profitCap, roiCap))
   *
   * Existing lib/decision.js maxBuy treats shipping + misc as one post-netSale
   * fixed cost and does not separate outbound/FBA fees from acquire shipping,
   * so this digital-product path keeps a dedicated helper.
   */

  const TRUST_LINE = 'Comps are user-entered, not live Keepa or Home Depot data.';
  const ROI_BASIS = 'acquisition';
  const HISTORY_KEY = 'huntiq_enp_history_v1';
  const GATE_KEY = 'huntiq_enp_gate_v1';
  const HISTORY_LIMIT = 20;
  const FREE_PER_DAY = 3;
  const MAYBE_TOLERANCE = 0.1;

  const RETAILERS = ['Home Depot', "Lowe's", 'Walmart', 'Best Buy', 'Other'];
  const MARKETPLACES = [
    { id: 'amazon-fba', label: 'Amazon FBA', referralPct: 15, outboundLabel: 'FBA fee' },
    { id: 'amazon-fbm', label: 'Amazon FBM', referralPct: 15, outboundLabel: 'Shipping out' },
    { id: 'ebay', label: 'eBay', referralPct: 13, outboundLabel: 'Shipping out' }
  ];

  const money = (n) => +(Number(n) || 0).toFixed(2);
  const pct = (n) => +(Number(n) || 0).toFixed(2);

  function marketplaceById(id) {
    return MARKETPLACES.find((m) => m.id === id) || MARKETPLACES[0];
  }

  function defaultReferralPct(marketplaceId) {
    return marketplaceById(marketplaceId).referralPct;
  }

  function localDayKey(now = new Date()) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function num(value, fallback = null) {
    if (value === '' || value == null) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }

  function scenario(sellPrice, referralRate, fbaOrShipOut, otherFees, acquisition) {
    const sell = Math.max(0, Number(sellPrice) || 0);
    const sellFees = sell * referralRate + fbaOrShipOut + otherFees;
    const profit = sell - sellFees - acquisition;
    const roi = acquisition > 0 ? (profit / acquisition) * 100 : 0;
    return {
      sellPrice: money(sell),
      sellFees: money(sellFees),
      referralFee: money(sell * referralRate),
      profit: money(profit),
      roi: pct(roi)
    };
  }

  function maxBuyPrice({ netProceeds, acquireShip, taxRate, targetRoiRate, minProfit }) {
    const profitCap = (netProceeds - minProfit - acquireShip) / (1 + taxRate);
    const roiCap = (netProceeds / (1 + targetRoiRate) - acquireShip) / (1 + taxRate);
    return money(Math.max(0, Math.min(profitCap, roiCap)));
  }

  function verdictFor({ headroom, profit, roi, buyPrice, maxBuy, minProfit, targetRoi }) {
    const hitsProfit = profit + 1e-9 >= minProfit;
    const hitsRoi = roi + 1e-9 >= targetRoi;
    if (headroom + 1e-9 >= 0 && hitsProfit && hitsRoi) return 'BUY';
    const closeProfit = profit + 1e-9 >= minProfit * (1 - MAYBE_TOLERANCE);
    const closeRoi = roi + 1e-9 >= targetRoi * (1 - MAYBE_TOLERANCE);
    const closeBuy = maxBuy > 0 ? buyPrice <= maxBuy * (1 + MAYBE_TOLERANCE) : false;
    if (closeProfit && closeRoi && closeBuy && profit > 0) return 'MAYBE';
    return 'PASS';
  }

  function evaluate(input = {}) {
    const errors = [];
    const marketplace = marketplaceById(input.marketplace);
    const buyPrice = num(input.buyPrice);
    const sellPrice = num(input.sellPrice);
    const fbaOrShipOut = num(input.fbaOrShipOut);
    const taxRatePct = num(input.taxRatePct, 6);
    const acquireShip = num(input.acquireShip, 0);
    const units = num(input.units, 1);
    const referralPct = num(input.referralPct, marketplace.referralPct);
    const otherFees = num(input.otherFees, 0);
    const conservativeSell = num(input.conservativeSell, null);
    const optimisticSell = num(input.optimisticSell, null);
    const targetRoi = num(input.targetRoi, 30);
    const minProfit = num(input.minProfit, 15);
    const title = String(input.title || '').trim();
    const retailer = RETAILERS.includes(input.retailer) ? input.retailer : 'Other';

    if (!(buyPrice > 0)) errors.push('Buy price is required.');
    if (!(sellPrice > 0)) errors.push('Expected sell price is required.');
    if (!Number.isFinite(fbaOrShipOut) || fbaOrShipOut < 0) errors.push('FBA fee or shipping out is required.');
    if (!Number.isFinite(taxRatePct) || taxRatePct < 0) errors.push('Tax rate must be zero or greater.');
    if (!Number.isFinite(acquireShip) || acquireShip < 0) errors.push('Shipping/gas to acquire must be zero or greater.');
    if (!Number.isFinite(units) || units < 1 || !Number.isInteger(Number(units))) errors.push('Units must be a whole number of 1 or more.');
    if (!Number.isFinite(referralPct) || referralPct < 0 || referralPct >= 100) errors.push('Referral fee must be between 0 and 100.');
    if (!Number.isFinite(otherFees) || otherFees < 0) errors.push('Other fees must be zero or greater.');
    if (conservativeSell != null && !(conservativeSell >= 0)) errors.push('Conservative sell low must be zero or greater.');
    if (optimisticSell != null && !(optimisticSell >= 0)) errors.push('Optimistic sell high must be zero or greater.');
    if (!Number.isFinite(targetRoi) || targetRoi < 0) errors.push('Target ROI must be zero or greater.');
    if (!Number.isFinite(minProfit)) errors.push('Min profit must be a number.');

    if (errors.length) {
      return { ok: false, errors, trustLine: TRUST_LINE, roiBasis: ROI_BASIS };
    }

    const taxRate = taxRatePct / 100;
    const referralRate = referralPct / 100;
    const acquisition = buyPrice * (1 + taxRate) + acquireShip;
    const expected = scenario(sellPrice, referralRate, fbaOrShipOut, otherFees, acquisition);
    const netProceeds = sellPrice * (1 - referralRate) - fbaOrShipOut - otherFees;
    const maxBuy = maxBuyPrice({
      netProceeds,
      acquireShip,
      taxRate,
      targetRoiRate: targetRoi / 100,
      minProfit
    });
    const headroom = money(maxBuy - buyPrice);
    const breakEvenSell = referralRate < 1
      ? money((acquisition + fbaOrShipOut + otherFees) / (1 - referralRate))
      : null;
    const downside = conservativeSell != null
      ? scenario(conservativeSell, referralRate, fbaOrShipOut, otherFees, acquisition)
      : null;
    const upside = optimisticSell != null
      ? scenario(optimisticSell, referralRate, fbaOrShipOut, otherFees, acquisition)
      : null;
    const verdict = verdictFor({
      headroom,
      profit: expected.profit,
      roi: expected.roi,
      buyPrice,
      maxBuy,
      minProfit,
      targetRoi
    });

    return {
      ok: true,
      errors: [],
      title: title || null,
      retailer,
      marketplace: marketplace.id,
      marketplaceLabel: marketplace.label,
      units: Number(units),
      buyPrice: money(buyPrice),
      taxRatePct: pct(taxRatePct),
      acquireShip: money(acquireShip),
      acquisition: money(acquisition),
      acquisitionTotal: money(acquisition * units),
      sellPrice: expected.sellPrice,
      referralPct: pct(referralPct),
      fbaOrShipOut: money(fbaOrShipOut),
      otherFees: money(otherFees),
      sellFees: expected.sellFees,
      enpPerUnit: expected.profit,
      enpTotal: money(expected.profit * units),
      roi: expected.roi,
      roiBasis: ROI_BASIS,
      targetRoi: pct(targetRoi),
      minProfit: money(minProfit),
      maxBuyPrice: maxBuy,
      headroom,
      breakEvenSell,
      downsideEnp: downside ? downside.profit : null,
      downsideRoi: downside ? downside.roi : null,
      upsideEnp: upside ? upside.profit : null,
      upsideRoi: upside ? upside.roi : null,
      verdict,
      trustLine: TRUST_LINE,
      heroMetric: 'enp',
      input: {
        title,
        retailer,
        marketplace: marketplace.id,
        buyPrice: money(buyPrice),
        taxRatePct: pct(taxRatePct),
        acquireShip: money(acquireShip),
        units: Number(units),
        sellPrice: money(sellPrice),
        conservativeSell: conservativeSell == null ? '' : money(conservativeSell),
        optimisticSell: optimisticSell == null ? '' : money(optimisticSell),
        referralPct: pct(referralPct),
        fbaOrShipOut: money(fbaOrShipOut),
        otherFees: money(otherFees),
        targetRoi: pct(targetRoi),
        minProfit: money(minProfit)
      }
    };
  }

  function memoryStore(seed = {}) {
    const data = { ...seed };
    return {
      getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
      setItem: (key, value) => { data[key] = String(value); },
      removeItem: (key) => { delete data[key]; },
      _data: data
    };
  }

  function resolveStore(store) {
    if (store) return store;
    if (typeof localStorage !== 'undefined') return localStorage;
    return memoryStore();
  }

  function readJson(store, key, fallback) {
    try {
      const raw = store.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function readGate(store, now = new Date()) {
    const storage = resolveStore(store);
    const day = localDayKey(now);
    const raw = readJson(storage, GATE_KEY, {});
    if (!raw || raw.day !== day) {
      return { day, count: 0, remaining: FREE_PER_DAY, locked: false, freePerDay: FREE_PER_DAY };
    }
    const count = Math.max(0, Number(raw.count) || 0);
    return {
      day,
      count,
      remaining: Math.max(0, FREE_PER_DAY - count),
      locked: count >= FREE_PER_DAY,
      freePerDay: FREE_PER_DAY
    };
  }

  function consumeCalculation(store, now = new Date()) {
    const storage = resolveStore(store);
    const gate = readGate(storage, now);
    if (gate.locked) return { allowed: false, ...gate };
    const next = { day: gate.day, count: gate.count + 1 };
    storage.setItem(GATE_KEY, JSON.stringify(next));
    return {
      allowed: true,
      day: next.day,
      count: next.count,
      remaining: Math.max(0, FREE_PER_DAY - next.count),
      locked: next.count >= FREE_PER_DAY,
      freePerDay: FREE_PER_DAY
    };
  }

  function readHistory(store) {
    const rows = readJson(resolveStore(store), HISTORY_KEY, []);
    return Array.isArray(rows) ? rows.slice(0, HISTORY_LIMIT) : [];
  }

  function recordRun(result, store, now = new Date()) {
    if (!result || result.ok !== true) return readHistory(store);
    const storage = resolveStore(store);
    const entry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      at: now.toISOString(),
      title: result.title,
      retailer: result.retailer,
      marketplace: result.marketplace,
      marketplaceLabel: result.marketplaceLabel,
      buyPrice: result.buyPrice,
      sellPrice: result.sellPrice,
      units: result.units,
      verdict: result.verdict,
      enpPerUnit: result.enpPerUnit,
      enpTotal: result.enpTotal,
      roi: result.roi,
      maxBuyPrice: result.maxBuyPrice,
      input: result.input || null
    };
    const next = [entry, ...readHistory(storage)].slice(0, HISTORY_LIMIT);
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  }

  return {
    TRUST_LINE,
    ROI_BASIS,
    HISTORY_KEY,
    GATE_KEY,
    HISTORY_LIMIT,
    FREE_PER_DAY,
    MAYBE_TOLERANCE,
    RETAILERS,
    MARKETPLACES,
    evaluate,
    defaultReferralPct,
    marketplaceById,
    localDayKey,
    memoryStore,
    readGate,
    consumeCalculation,
    readHistory,
    recordRun
  };
});
