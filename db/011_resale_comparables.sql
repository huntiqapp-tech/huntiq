-- Completed-sale comparable storage. Active asking listings may be stored as market evidence
-- elsewhere, but must not be inserted here as completed-sale history.
CREATE TABLE IF NOT EXISTS resale_comparable_observations (
  id INTEGER PRIMARY KEY,
  product_key TEXT NOT NULL,
  source TEXT NOT NULL,
  source_listing_id TEXT,
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN ('completed_sale')),
  sale_status TEXT NOT NULL,
  sold_at TEXT NOT NULL,
  sale_price REAL NOT NULL CHECK (sale_price >= 0),
  shipping_price REAL NOT NULL DEFAULT 0 CHECK (shipping_price >= 0),
  delivered_price REAL NOT NULL CHECK (delivered_price > 0),
  condition TEXT,
  match_score REAL NOT NULL DEFAULT 100 CHECK (match_score >= 0 AND match_score <= 100),
  source_confidence REAL NOT NULL DEFAULT 100 CHECK (source_confidence >= 0 AND source_confidence <= 100),
  currency TEXT NOT NULL DEFAULT 'USD',
  observed_at TEXT NOT NULL,
  raw_reference TEXT,
  UNIQUE(source, source_listing_id, sold_at)
);
CREATE INDEX IF NOT EXISTS idx_resale_comp_product_sold ON resale_comparable_observations(product_key, sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_resale_comp_source_sold ON resale_comparable_observations(source, sold_at DESC);
