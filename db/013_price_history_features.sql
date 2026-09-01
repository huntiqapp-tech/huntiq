-- HUNTIQ price-history feature layer
-- PostgreSQL-compatible. Derives deterministic sequential features without mixing stores.
-- This is intentionally source/provenance preserving; downstream anomaly scoring decides
-- whether a provider/rights_class is eligible for product-facing use.

CREATE INDEX IF NOT EXISTS idx_live_price_product_time
  ON live_price_observations (product_key, location_key, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_price_upc_location_time
  ON live_price_observations (upc, location_key, observed_at DESC)
  WHERE upc IS NOT NULL;

CREATE OR REPLACE VIEW price_history_features AS
WITH ordered AS (
  SELECT
    id,
    retailer,
    product_key,
    location_key,
    sku,
    upc,
    store_id,
    zipcode,
    channel,
    price,
    availability,
    quantity,
    observed_at,
    provider,
    rights_class,
    LAG(price) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
    ) AS previous_price,
    LAG(observed_at) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
    ) AS previous_observed_at,
    MIN(price) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
      ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING
    ) AS prior_12_min_price,
    MAX(price) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
      ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING
    ) AS prior_12_max_price,
    AVG(price) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
      ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING
    ) AS prior_12_avg_price,
    COUNT(*) OVER (
      PARTITION BY retailer, product_key, location_key
      ORDER BY observed_at, id
      ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING
    ) AS prior_sample_count
  FROM live_price_observations
)
SELECT
  *,
  CASE WHEN previous_price > 0
    THEN ROUND(((previous_price - price) / previous_price) * 100, 2)
    ELSE NULL
  END AS drop_from_previous_pct,
  CASE WHEN prior_12_avg_price > 0
    THEN ROUND(((prior_12_avg_price - price) / prior_12_avg_price) * 100, 2)
    ELSE NULL
  END AS drop_from_prior_avg_pct,
  CASE WHEN previous_observed_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (observed_at - previous_observed_at)) / 3600.0
    ELSE NULL
  END AS hours_since_previous,
  CASE
    WHEN prior_sample_count >= 6 AND prior_12_avg_price > 0 AND price <= prior_12_avg_price * 0.50 THEN 'extreme-drop'
    WHEN prior_sample_count >= 3 AND prior_12_avg_price > 0 AND price <= prior_12_avg_price * 0.75 THEN 'large-drop'
    WHEN previous_price IS NOT NULL AND price < previous_price THEN 'markdown'
    ELSE 'normal'
  END AS history_signal
FROM ordered;

-- Consumer code should still require source freshness, anomaly confidence, resale evidence,
-- and positive downside economics before promoting any row into an alert.