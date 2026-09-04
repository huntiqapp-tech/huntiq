# Bright Data + Home Depot shadow validation — 2026-09-04

## Purpose
This note records the public documentation used to implement HUNTIQ's bounded Bright Data Home Depot shadow-validation lifecycle. It does not grant customer-display, retention, or redistribution rights. Those remain pending until the applicable commercial terms are explicitly reviewed and recorded.

## Bright Data API lifecycle
Bright Data's current Web Scraper API documentation describes the asynchronous collection lifecycle as:

1. Trigger a collection with `POST /datasets/v3/trigger` and capture the returned `snapshot_id`.
2. Poll `GET /datasets/v3/progress/{snapshot_id}` until status is `ready` or `failed`.
3. Download a completed snapshot with `GET /datasets/v3/snapshot/{snapshot_id}?format=json`.

The documented progress states are `starting`, `running`, `ready`, and `failed`. Snapshot downloads are retained for a limited window, so HUNTIQ's validation workflow should review a completed shadow run promptly rather than treating provider storage as permanent history.

Implementation consequence: `lib/brightdata-home-depot.js` now supports trigger, bounded progress polling, JSON download, normalization to canonical observations, and a hard shadow-review boundary. The smoke command prints a sanitized summary only; raw provider rows are not logged by the CLI.

## Home Depot public validation rules
Home Depot's public site currently states that local store prices may vary from displayed prices and that products shown as available are normally stocked but inventory levels cannot be guaranteed. Store-mode/app pages also describe store-specific stock information, while pickup pages describe store pickup as a fulfillment option.

HUNTIQ consequences:
- ZIP/store identity must remain attached to Home Depot observations.
- A provider observation must be manually compared against the same product and location context; a different store or ZIP is not an acceptable crosscheck.
- Availability remains evidence, not guaranteed possession.
- Pickup eligibility is fulfillment evidence, not a guaranteed completed acquisition.
- Provider output remains `internal-only`, non-redistributable, history-promotion-disabled, and alert-disabled until rights plus manual source validation are explicitly recorded.

## Public sources checked
- Bright Data API Reference — Monitor Progress: https://docs.brightdata.com/api-reference/scrapers/management-apis/monitor-progress
- Bright Data API Reference — Download Snapshot: https://docs.brightdata.com/api-reference/scrapers/delivery-apis/download-snapshot
- Bright Data API Reference — Get Snapshots: https://docs.brightdata.com/api-reference/scrapers/management-apis/get-snapshots
- The Home Depot — Shop Our Stores / site footer pricing and inventory notice: https://www.homedepot.com/c/About_Our_Stores
- The Home Depot — Pick Up In Store: https://www.homedepot.com/c/pick_up_in_store

## Validation checklist for the first authenticated run
- Explicit Home Depot product URL supplied via trusted runtime environment.
- Optional ZIP is five digits and matches the manual source check.
- Trigger budget remains capped at one record for smoke validation.
- Snapshot reaches `ready`; failed/unknown states fail closed.
- Download is a JSON array and normalizes successfully.
- Manual source page comparison records product identity, location identity, price, timestamp, and availability agreement.
- Display, retention, and redistribution rights are separately reviewed.
- No history promotion, anomaly authority, resale-profit authority, or alerts before all existing readiness gates pass.
