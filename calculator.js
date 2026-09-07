(function() {
  'use strict';
  const Enp = globalThis.HuntIQEnpCalculator;
  if (!Enp) return;

  const money = (n) => n == null || !Number.isFinite(Number(n))
    ? 'n/a'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
  const pct = (n) => n == null || !Number.isFinite(Number(n)) ? 'n/a' : `${Number(n).toFixed(1)}%`;

  const form = document.querySelector('#enpForm');
  const results = document.querySelector('#results');
  const gateNote = document.querySelector('#gateNote');
  const unlock = document.querySelector('#unlockGate');
  const historyEl = document.querySelector('#history');
  const referralInput = document.querySelector('#referralPct');
  const outboundLabel = document.querySelector('#outboundLabel');
  const marketplaceSelect = document.querySelector('#marketplace');
  const retailerSelect = document.querySelector('#retailer');
  const year = document.querySelector('#year');

  if (year) year.textContent = String(new Date().getFullYear());

  Enp.RETAILERS.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    retailerSelect.append(option);
  });

  Enp.MARKETPLACES.forEach((market, index) => {
    const option = document.createElement('option');
    option.value = market.id;
    option.textContent = market.label;
    if (index === 0) option.selected = true;
    marketplaceSelect.append(option);
  });

  function applyMarketplaceDefaults() {
    const market = Enp.marketplaceById(marketplaceSelect.value);
    referralInput.value = String(market.referralPct);
    outboundLabel.textContent = market.outboundLabel;
  }

  marketplaceSelect.addEventListener('change', applyMarketplaceDefaults);
  applyMarketplaceDefaults();

  function readForm() {
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    return {
      title: value('title'),
      retailer: value('retailer'),
      marketplace: value('marketplace'),
      buyPrice: value('buyPrice'),
      taxRatePct: value('taxRatePct'),
      acquireShip: value('acquireShip'),
      units: value('units'),
      sellPrice: value('sellPrice'),
      conservativeSell: value('conservativeSell'),
      optimisticSell: value('optimisticSell'),
      referralPct: value('referralPct'),
      fbaOrShipOut: value('fbaOrShipOut'),
      otherFees: value('otherFees'),
      targetRoi: value('targetRoi'),
      minProfit: value('minProfit')
    };
  }

  function fillForm(input) {
    if (!input) return;
    const set = (name, val) => {
      const field = form.elements.namedItem(name);
      if (field) field.value = val == null ? '' : String(val);
    };
    set('title', input.title || '');
    set('retailer', input.retailer || 'Other');
    set('marketplace', input.marketplace || 'amazon-fba');
    applyMarketplaceDefaults();
    set('buyPrice', input.buyPrice);
    set('taxRatePct', input.taxRatePct);
    set('acquireShip', input.acquireShip);
    set('units', input.units);
    set('sellPrice', input.sellPrice);
    set('conservativeSell', input.conservativeSell);
    set('optimisticSell', input.optimisticSell);
    set('referralPct', input.referralPct);
    set('fbaOrShipOut', input.fbaOrShipOut);
    set('otherFees', input.otherFees);
    set('targetRoi', input.targetRoi);
    set('minProfit', input.minProfit);
  }

  function renderGate() {
    const gate = Enp.readGate();
    if (gateNote) {
      gateNote.textContent = gate.locked
        ? `Free daily calculations used (${gate.freePerDay}/${gate.freePerDay}).`
        : `${gate.remaining} free calculation${gate.remaining === 1 ? '' : 's'} left today.`;
    }
    if (unlock) unlock.hidden = !gate.locked;
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = gate.locked;
    return gate;
  }

  function renderHistory() {
    const rows = Enp.readHistory();
    if (!historyEl) return;
    if (!rows.length) {
      historyEl.innerHTML = '<p class="muted">No saved runs yet. Calculations stay on this device.</p>';
      return;
    }
    historyEl.innerHTML = rows.map((row) => `
      <button type="button" class="history-item" data-id="${row.id}">
        <span class="history-verdict ${String(row.verdict || '').toLowerCase()}">${row.verdict}</span>
        <span>
          <strong>${row.title || row.retailer || 'Untitled flip'}</strong>
          <small>${row.marketplaceLabel || row.marketplace} · buy ${money(row.buyPrice)} → sell ${money(row.sellPrice)} · ENP ${money(row.enpPerUnit)} · ${pct(row.roi)} ROI</small>
        </span>
      </button>
    `).join('');
    historyEl.querySelectorAll('.history-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = Enp.readHistory().find((item) => item.id === btn.dataset.id);
        if (row && row.input) fillForm(row.input);
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function resultCard(label, value, note) {
    return `<div class="result-stat"><small>${label}</small><b>${value}</b>${note ? `<span>${note}</span>` : ''}</div>`;
  }

  function renderResult(result) {
    const tone = String(result.verdict || '').toLowerCase();
    results.hidden = false;
    results.innerHTML = `
      <div class="verdict-banner ${tone}">
        <div class="eyebrow">VERDICT</div>
        <p class="verdict-hero ${tone}">${result.verdict}</p>
        <p class="hero-enp">${money(result.enpPerUnit)} ENP / unit</p>
        <p class="muted">${money(result.enpTotal)} total · ${pct(result.roi)} ROI on cash outlay</p>
      </div>
      <div class="result-grid">
        ${resultCard('ENP / unit', money(result.enpPerUnit), 'Expected net profit')}
        ${resultCard('ENP total', money(result.enpTotal), `${result.units} unit${result.units === 1 ? '' : 's'}`)}
        ${resultCard('ROI', pct(result.roi), 'Profit ÷ acquisition')}
        ${resultCard('Max buy', money(result.maxBuyPrice), `Hits ${pct(result.targetRoi)} ROI and ${money(result.minProfit)} min profit`)}
        ${resultCard('Headroom', money(result.headroom), 'Max buy − buy price')}
        ${resultCard('Break-even sell', money(result.breakEvenSell), 'Sell price where ENP is $0')}
        ${resultCard('Downside ENP', result.downsideEnp == null ? '—' : money(result.downsideEnp), result.downsideEnp == null ? 'Add a conservative sell low' : `${pct(result.downsideRoi)} ROI if the low comp hits`)}
        ${resultCard('Acquisition', money(result.acquisition), 'Buy + tax + gas/ship in')}
      </div>
      <p class="trust-line">${result.trustLine}</p>
    `;
  }

  function renderErrors(errors) {
    results.hidden = false;
    results.innerHTML = `<div class="panel">${errors.map((err) => `<p>${err}</p>`).join('')}<p class="trust-line">${Enp.TRUST_LINE}</p></div>`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const gate = Enp.readGate();
    if (gate.locked) {
      renderGate();
      unlock.hidden = false;
      unlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const input = readForm();
    const result = Enp.evaluate(input);
    if (!result.ok) {
      renderErrors(result.errors);
      return;
    }
    Enp.consumeCalculation();
    Enp.recordRun(result);
    renderResult(result);
    renderGate();
    renderHistory();
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const stub = document.querySelector('#unlockStub');
  if (stub) {
    stub.addEventListener('click', (event) => {
      event.preventDefault();
      const note = document.querySelector('#unlockSoon');
      if (note) note.hidden = false;
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }

  renderGate();
  renderHistory();
  document.querySelector('#trustAlways').textContent = Enp.TRUST_LINE;
})();
