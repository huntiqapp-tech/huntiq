PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS store_inventory_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  store_key TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  quantity INTEGER,
  in_stock INTEGER,
  pickup_available INTEGER,
  fulfillment_confidence INTEGER NOT NULL DEFAULT 55,
  source_kind TEXT NOT NULL,
  source_fingerprint TEXT,
  observation_fingerprint TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_lookup
ON store_inventory_observations(retailer, product_key, store_key, observed_at DESC);

CREATE TABLE IF NOT EXISTS purchase_plan_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  store_key TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  observed_quantity INTEGER,
  fulfillment_confidence INTEGER NOT NULL,
  demand_capacity_units INTEGER NOT NULL,
  planned_units INTEGER NOT NULL,
  unit_cost REAL NOT NULL,
  unit_profit REAL NOT NULL,
  committed_cash REAL NOT NULL,
  lot_profit REAL NOT NULL,
  expected_profit REAL NOT NULL,
  recommendation TEXT NOT NULL,
  plan_fingerprint TEXT NOT NULL,
  UNIQUE(retailer, product_key, store_key, computed_at, plan_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_purchase_plan_lookup
ON purchase_plan_snapshots(retailer, product_key, store_key, computed_at DESC);