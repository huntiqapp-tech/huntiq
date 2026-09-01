# CVS public-source research

Updated 2026-09-01.

## Findings

- CVS publicly states that inventory and prices can vary between online and in-store offerings. HUNTIQ must therefore keep CVS online observations separate from store-specific observations rather than blending them into one price-history baseline.
- CVS Terms of Use, last updated December 1, 2025, grant access to CVS services for personal, non-commercial use. No production HUNTIQ crawler or retained price-history ingestion should be enabled from cvs.com without a rights-cleared provider or explicit permission.
- No public retail product/inventory API suitable for HUNTIQ production ingestion was identified during this research pass.

## HUNTIQ policy

`retailer=CVS` observations should preserve `storeId/ZIP/channel/observedAt/source/verified`. Treat public-site observations as research context only. Production ingestion remains disabled until an authorized API, licensed data provider, or explicit commercial-use permission is available.
