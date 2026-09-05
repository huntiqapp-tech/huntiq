# Home Depot public retailer research — 2026-09-05

## HUNTIQ modeling implications

- Keep Home Depot price history scoped by store/location and channel. Home Depot states that local store prices may vary from those displayed online.
- Treat displayed inventory as observed availability, not secured inventory. Home Depot states that products shown as available are normally stocked but inventory levels cannot be guaranteed.
- Store pickup is a fulfillment option, not proof that stock is reserved until the order is actually processed/ready. Home Depot advertises pickup workflows separately from inventory guarantees.
- Keep special-order and ZIP-dependent availability/pricing distinct from ordinary local-stock observations; Home Depot product/category pages can state that delivery and availability vary by ZIP code and may require Pro Desk contact for pricing.
- Price-match eligibility is conditional acquisition economics. It should not overwrite raw shelf/web price history unless the matched transaction is separately observed and verified.

## Public sources checked

1. Home Depot Price Match Guarantee & Price Inquiries
   https://www.homedepot.com/c/price-match-and-price-check
   - Includes Home Depot's standing notice that local store prices may vary from displayed prices and displayed availability is not guaranteed inventory.

2. Home Depot Pick Up In Store
   https://www.homedepot.com/c/pick_up_in_store
   - Describes the online-order/store-pickup fulfillment workflow.

3. Home Depot Curbside Pickup
   https://www.homedepot.com/c/curbside_pickup
   - Describes app-driven curbside pickup as an order fulfillment flow.

4. Example Home Depot product/category availability language
   https://www.homedepot.com/b/Building-Materials-Insulation-Foam-Board-Insulation/1/Interior-Exterior/XPS/N-5yc1vZbaxxZ1z0w1xoZ1z0y5ksZ1z11cv0
   - Shows examples where delivery/availability may vary by ZIP and special-order pricing requires direct contact.

## Data-quality rule

A Home Depot observation should preserve retailer, exact product identity/model, store or ZIP context, channel, observed price, observation timestamp, provider retrieval timestamp, and availability state. Search-result snippets or generic site-wide price statements must not be promoted into verified price history.
