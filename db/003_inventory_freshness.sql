PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inventory_confidence_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  store_key TEXT NOT NULL,
  inventory_observed_at TEXT,
  computed_at TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_reliability REAL NOT NULL,
  half_life_hours REAL NOT NULL,
  age_hours REAL,
  freshness REAL NOT NULL,
  temporal_factor REAL NOT NULL,
  raw_fulfillment_confidence INTEGER NOT NULL,
  effective_fulfillment_confidence INTEGER NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER,
  confidence_fingerprint TEXT NOT NULL,
  UNIQUE(retailer, product_key, store_key, computed_at, confidence_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_inventory_confidence_lookup
ON inventory_confidence_snapshots(retailer, product_key, store_key, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_confidence_stale
ON inventory_confidence_snapshots(stale, computed_at DESC);
