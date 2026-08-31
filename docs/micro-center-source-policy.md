# Micro Center public price-source policy

Reviewed: 2026-08-30

Micro Center is a strong retailer for HUNTIQ because pricing and inventory are explicitly store-sensitive and many items are pickup-oriented.

Public Micro Center documentation says pricing and availability of advertised products can vary by retail store and can differ from Micro Center Online. Its store locator instructs customers to select a local store to see local pricing and availability. Micro Center also states that price matching requires the exact same model number and/or UPC, that a brick-and-mortar competitor must have the item in stock at the nearest store, and that clearance, refurbished, open-box, coupon/promo and out-of-stock offers are excluded from normal price matching.

Implementation rules:

- Preserve Micro Center store identity on every local observation; never pool different stores into a single anomaly baseline by default.
- Preserve online/shipping and store/pickup as separate channels because Micro Center says pricing and availability can differ.
- Preserve exact model number and UPC where available; these are first-class identity keys for resale comparison.
- Preserve condition (`new`, `open-box`, `refurbished`, etc.) and never use open-box/clearance prices as direct new-item baseline evidence.
- Treat inventory as a separate state from price. Out-of-stock or unavailable does not mean zero price.
- Timestamp every observed price locally because Micro Center notes pricing and availability can change at any time.
- Treat member/account-only prices as account-scoped evidence. Do not generalize them to anonymous public pricing without explicit authorization.
- Price-protection eligibility is purchase-specific and should never be counted as guaranteed resale profit.

Public references reviewed:

- Micro Center Terms & Conditions / advertised special products
- Micro Center Store Locator
- Micro Center price-match policy
- Micro Center price-protection policy

This policy documents public semantics only. It does not authorize collection methods that violate retailer terms, nor does it require account access.