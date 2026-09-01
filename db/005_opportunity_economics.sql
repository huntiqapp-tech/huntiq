PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS opportunity_economics_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  store_key TEXT,
  computed_at TEXT NOT NULL,
  observed_price REAL NOT NULL,
  baseline_price REAL,
  anomaly_score REAL,
  anomaly_confidence REAL,
  resale_market_value REAL,
  resale_confidence REAL,
  sold_7 INTEGER,
  sold_30 INTEGER,
  sold_90 INTEGER,
  active_listings INTEGER,
  best_channel TEXT,
  sale_price REAL,
  total_cost REAL,
  gross_profit REAL,
  gross_roi REAL,
  expected_return_cost REAL NOT NULL DEFAULT 0,
  risk_adjusted_profit REAL,
  risk_adjusted_roi REAL,
  expected_days_to_sell REAL,
  sell_through_probability REAL,
  alert_score REAL,
  recommendation TEXT,
  source_fingerprint TEXT,
  snapshot_fingerprint TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_lookup
ON opportunity_economics_snapshots(retailer, product_key, store_key, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_economics_alerts
ON opportunity_economics_snapshots(alert_score DESC, computed_at DESC);

CREATE TABLE IF NOT EXISTS resale_channel_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  opportunity_snapshot_id INTEGER NOT NULL,
  channel_name TEXT NOT NULL,
  sale_price REAL NOT NULL,
  fee_rate REAL NOT NULL DEFAULT 0,
  total_fees REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  holding_days REAL NOT NULL DEFAULT 0,
  return_rate REAL NOT NULL DEFAULT 0,
  expected_return_cost REAL NOT NULL DEFAULT 0,
  profit REAL NOT NULL,
  roi REAL NOT NULL,
  risk_adjusted_profit REAL NOT NULL,
  risk_adjusted_roi REAL NOT NULL,
  margin_of_safety REAL,
  max_buy_price REAL,
  confidence REAL,
  channel_score REAL,
  FOREIGN KEY(opportunity_snapshot_id) REFERENCES opportunity_economics_snapshots(id) ON DELETE CASCADE,
  UNIQUE(opportunity_snapshot_id, channel_name)
);

CREATE INDEX IF NOT EXISTS idx_resale_channel_ranking
ON resale_channel_snapshots(opportunity_snapshot_id, channel_score DESC);
