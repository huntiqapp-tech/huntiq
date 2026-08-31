CREATE TABLE IF NOT EXISTS price_consensus_snapshots (
  id INTEGER PRIMARY KEY,
  retailer TEXT NOT NULL,
  product_id TEXT NOT NULL,
  store_id TEXT,
  condition_scope TEXT NOT NULL DEFAULT 'new',
  price_scope TEXT NOT NULL DEFAULT 'store',
  median_price REAL,
  source_count INTEGER NOT NULL DEFAULT 0,
  source_agreement_pct REAL NOT NULL DEFAULT 0,
  spread_pct REAL NOT NULL DEFAULT 0,
  freshness_score REAL NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  conflicting INTEGER NOT NULL DEFAULT 0,
  observation_count INTEGER NOT NULL DEFAULT 0,
  stale_or_invalid_count INTEGER NOT NULL DEFAULT 0,
  fingerprint TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  UNIQUE(retailer, product_id, store_id, condition_scope, price_scope, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_price_consensus_lookup
ON price_consensus_snapshots(retailer, product_id, store_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS price_consensus_sources (
  consensus_id INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  source_median_price REAL,
  PRIMARY KEY(consensus_id, source_id),
  FOREIGN KEY(consensus_id) REFERENCES price_consensus_snapshots(id) ON DELETE CASCADE
);
