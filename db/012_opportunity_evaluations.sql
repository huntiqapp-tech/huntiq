-- HUNTIQ integrated opportunity evaluation snapshots
-- Stores the exact market/economics/evidence state used to decide whether an alert was eligible.
CREATE TABLE IF NOT EXISTS opportunity_evaluations (
  evaluation_id TEXT PRIMARY KEY,
  opportunity_key TEXT NOT NULL,
  retailer TEXT NOT NULL,
  sku TEXT NOT NULL,
  store_id TEXT,
  evaluated_at TEXT NOT NULL,
  market_value REAL NOT NULL CHECK (market_value >= 0),
  market_value_window_days INTEGER CHECK (market_value_window_days IN (30,60,90)),
  resale_confidence REAL NOT NULL CHECK (resale_confidence >= 0 AND resale_confidence <= 100),
  completed_sale_count_90 INTEGER NOT NULL DEFAULT 0 CHECK (completed_sale_count_90 >= 0),
  downside_sale_price REAL NOT NULL DEFAULT 0 CHECK (downside_sale_price >= 0),
  best_channel TEXT,
  risk_adjusted_profit REAL,
  risk_adjusted_roi REAL,
  downside_profit REAL,
  downside_roi REAL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('strong-buy','buy','watch','skip')),
  alert_eligible INTEGER NOT NULL DEFAULT 0 CHECK (alert_eligible IN (0,1)),
  alert_level TEXT,
  blockers_json TEXT NOT NULL DEFAULT '[]',
  evidence_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_opportunity_evaluations_key_time ON opportunity_evaluations(opportunity_key,evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_evaluations_alert ON opportunity_evaluations(alert_eligible,recommendation,evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_evaluations_retailer_sku ON opportunity_evaluations(retailer,sku,evaluated_at DESC);