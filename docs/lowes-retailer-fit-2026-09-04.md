# Lowe's retailer fit — 2026-09-04

Public-source modeling notes for HUNTIQ. No account access was used.

## Pricing and location identity
- Lowe's Lowest Price Guarantee explicitly excludes comparisons between one Lowe's store and another and between ZIP codes. HUNTIQ should therefore preserve store/ZIP identity in raw observations and never collapse Lowe's into one national price-history baseline.
- A successful price match is a transaction-specific acquisition adjustment, not a new ordinary shelf-price observation. Clearance, closeout, damaged, open-box, seasonal, third-party marketplace, membership-wholesaler, volume/wholesale and several promotional prices are excluded from the guarantee.
- Lowe's reserves the right to limit price-match requests to reasonable quantities; quantity assumptions must remain separate from observed price history.

Source: https://www.lowes.com/l/about/lowest-price-guarantee

## Rewards and acquisition economics
- MyLowe's Rewards earns points on eligible settled/fulfilled purchases; points later convert to MyLowe's Money. Newly earned points are deferred value and must not reduce raw observed item price.
- MyLowe's Money can be applied on a later eligible transaction and has redemption restrictions, so only already-earned, actually redeemable value belongs in transaction-specific acquisition economics.
- MyLowe's Pro Rewards is separately designed for contractors/business professionals. In 2026 it uses points toward MyLowe's Money or rewards, and Pro credit-card discounts have their own combination restrictions. HUNTIQ should model these as buyer/account-specific economics, never anonymous shelf price.

Sources:
- https://www.lowes.com/l/about/mylowes-rewards
- https://www.lowes.com/l/Pro/pro-benefits

## Fulfillment and inventory
- Same-day delivery is limited to eligible in-stock items and is subject to availability. Fulfillment eligibility should be treated as evidence of possible acquisition, not guaranteed possession.
- Product selection and promotional eligibility can vary by location. Location and fulfillment channel therefore remain part of the observation identity.

Source: https://www.lowes.com/l/about/mylowes-rewards

## HUNTIQ implementation rules
1. Keep Lowe's store/ZIP histories isolated.
2. Record ordinary observed price separately from price-match, coupon, credit-card, reward, rebate and volume-discount economics.
3. Do not promote an account-specific or manually matched acquisition price into the anonymous price-history baseline.
4. Treat clearance/open-box/damaged states as separate condition/lifecycle evidence.
5. Quantity-limited or fulfillment-dependent opportunities must pass quantity and availability gates before urgent alerts.
6. Public-page observations remain shadow-only until source rights, retention and customer-display rules are explicitly approved.
