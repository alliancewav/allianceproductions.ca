# Alliance Productions Studio — Stripe Pricing & Invoicing Guide (CAD)
_Generated: 2026-01-08_

Client-facing invoices are grouped by product prefixes: `SESSION —`, `POST —`, `DELIV —`, `FEES —`, `CREDIT —`.

## How to build invoices (standard patterns)

### Recording / studio booking (modular)
- `SESSION — Studio Workspace` × hours (room/infrastructure)
- `SESSION — Recording Engineer` × hours (staff time)
- Optional: `SESSION — Producer / Session Direction` × hours
- Optional: `SESSION — After-Hours Premium` × hours
- If client overstays: `SESSION — Overtime` × (30-minute blocks)

### Offsite / external booking
- `SESSION — Recording Engineer` × hours
- `FEES — Travel` × kilometers (quantity = km from AP studio)

### Post-production
- Mixing can be itemized to keep totals consistent while increasing clarity.
- Deliverables and rush fees are added only when requested.

## Policy reference (keep consistent across invoices)
- 30+ minutes late may be treated as late/no-show.
- Time beyond the booked end time is billed as overtime.
- Sessions outside regular hours include an after-hours premium.
- Offsite work can include travel charges plus the same hourly services.
- Rush delivery and exports are billed only if requested.

## Stripe catalog (products + prices)
Each product section lists existing Stripe IDs and the current CAD prices. Suggested internal fields (Price description + Lookup key) are provided to standardize invoicing.

### SESSION — After-Hours Premium
- Product ID: `prod_TkXzYqHPjKmqB8`
- Product description: Premium for sessions outside standard hours.
- Prices:
  - CA$5.00 — Price ID `price_1Sn2tS3xrxQgBTzKavZ6ksCc`
    - Suggested Price description (internal): `Group=Session Services | Unit=Hourly | Duration=60m | Applies=AfterHoursPremium`
    - Suggested Lookup key: `session_after_hours_premium_cad_500`

### SESSION — Overtime
- Product ID: `prod_TkXxKHOXTA0jmQ`
- Product description: Overtime billed in 30-minute increments when sessions exceed booked time.
- Prices:
  - CA$35.00 — Price ID `price_1Sn2ry3xrxQgBTzKjawCJXQT`
    - Suggested Price description (internal): `Group=Session Services | Unit=Per 30m | Duration=30m | Applies=Overtime`
    - Suggested Lookup key: `session_overtime_cad_3500`

### SESSION — Producer / Session Direction
- Product ID: `prod_TkXwPFoHB1GYa5`
- Product description: Producer oversight, arrangement direction, creative leadership during session.
- Prices:
  - CA$27.00 — Price ID `price_1Sn2qo3xrxQgBTzKNkkQQLYT`
    - Suggested Price description (internal): `Group=Session Services | Unit=Hourly | Duration=60m | Includes=Producer`
    - Suggested Lookup key: `session_producer_session_direction_cad_2700`

### SESSION — Recording Engineer
- Product ID: `prod_TkXvmkczyD5juh`
- Product description: Engineer billed separately when studio time is booked without the full recording session rate.
- Prices:
  - CA$23.00 — Price ID `price_1Sn2ps3xrxQgBTzKE2t00jEm`
    - Suggested Price description (internal): `Group=Session Services | Unit=Hourly | Duration=60m | Includes=Engineer`
    - Suggested Lookup key: `session_recording_engineer_cad_2300`

### SESSION — Recording Session
- Product ID: `prod_TbDwVKybu8jeq3`
- Product description: Recording session with engineer. Billed hourly or by block.
- Prices:
  - CA$60.00 — Price ID `price_1Sn17m3xrxQgBTzKfSTCy43K`
    - Suggested Price description (internal): `Group=Session Services | Unit=Hourly | Duration=60m | Legacy=Yes | Includes=Room+Engineer`
    - Suggested Lookup key: `session_recording_session_cad_6000`
  - CA$175.00 — Price ID `price_1Se1UQ3xrxQgBTzKvZ1BZ31u`
    - Suggested Price description (internal): `Group=Session Services | Unit=Block | Duration=180m | Block=3h | Legacy=Yes | Includes=Room+Engineer`
    - Suggested Lookup key: `session_recording_session_cad_17500`
  - Status: **Legacy** (keep for history; stop using for new invoices).

### SESSION — Studio Workspace
- Product ID: `prod_TfGc4aUgawROVb`
- Product description: Usage based access.
- Prices:
  - CA$35.00 — Price ID `price_1Shw5c3xrxQgBTzK8e4mVfsP`
    - Suggested Price description (internal): `Group=Session Services | Unit=Hourly | Duration=60m | Includes=Room`
    - Suggested Lookup key: `session_studio_workspace_cad_3500`

### POST — Additional Revision
- Product ID: `prod_TkYBFy0TbA29vn`
- Product description: Revision beyond included revision policy for the service.
- Prices:
  - CA$5.00 — Price ID `price_1Sn6Qh3xrxQgBTzKaDaq5kmE`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Revision | Scope=Revision | Component=Yes`
    - Suggested Lookup key: `post_additional_revision_cad_500`
  - CA$10.00 — Price ID `price_1Sn3503xrxQgBTzKnBTgNLF5`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Revision | Scope=Revision | Billable=Yes`
    - Suggested Lookup key: `post_additional_revision_cad_1000`

### POST — Mastering
- Product ID: `prod_TbDxb5YNY9oNOm`
- Product description: Mastering for one song/project.
- Prices:
  - CA$25.00 — Price ID `price_1Se1VP3xrxQgBTzKgctU1M8W`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Scope=Master`
    - Suggested Lookup key: `post_mastering_cad_2500`

### POST — Mix + Master
- Product ID: `prod_TfGb2n25mm2pHQ`
- Product description: Bundle: mix + master for one song/project.
- Prices:
  - CA$100.00 — Price ID `price_1Shw4V3xrxQgBTzK5jkxaE25`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Bundle=Mix+Master`
    - Suggested Lookup key: `post_mix_master_cad_10000`

### POST — Mixing
- Product ID: `prod_TbDwx3rIY65ZaI`
- Product description: Full mix for one song/project.
- Prices:
  - CA$55.00 — Price ID `price_1Sn6Of3xrxQgBTzKdSL58Rmw`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Scope=MixCore`
    - Suggested Lookup key: `post_mixing_cad_5500`
  - CA$75.00 — Price ID `price_1Se1V33xrxQgBTzKxBDQemPs`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Scope=Mix | Legacy=Yes`
    - Suggested Lookup key: `post_mixing_cad_7500`
  - Note: Includes a current core-mix price and a legacy flat price.

### POST — Stems Mix Processing
- Product ID: `prod_TkYCctenfTZ4NB`
- Product description: Stem-based mix delivery or complex mix requiring stem workflow.
- Prices:
  - CA$15.00 — Price ID `price_1Sn6PN3xrxQgBTzKIY6MPoZa`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Scope=Routing+Bounce/Print (component)`
    - Suggested Lookup key: `post_stems_mix_processing_cad_1500`
  - CA$100.00 — Price ID `price_1Sn36F3xrxQgBTzKHKnlwGMy`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Scope=FullStemMix (standalone)`
    - Suggested Lookup key: `post_stems_mix_processing_cad_10000`

### POST — Vocal Editing / Comping
- Product ID: `prod_TkY7MaBaQrfBmB`
- Product description: Vocal cleanup, comping, timing edits, breaths/fades for one song/project.
- Prices:
  - CA$0.00 — Price ID `price_1Sn6L33xrxQgBTzKwieZ9kLi`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Included=Yes`
    - Suggested Lookup key: `post_vocal_editing_comping_cad_0`
  - CA$50.00 — Price ID `price_1Sn32x3xrxQgBTzK1XQVvF9D`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Standalone=Yes`
    - Suggested Lookup key: `post_vocal_editing_comping_cad_5000`

### POST — Vocal Tuning
- Product ID: `prod_TkY8gRwAWgxryZ`
- Product description: Pitch correction and tuning for one song/project (Melodyne/Auto-Tune workflow).
- Prices:
  - CA$0.00 — Price ID `price_1Sn6Ly3xrxQgBTzKLJEzk8fB`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Included=Yes`
    - Suggested Lookup key: `post_vocal_tuning_cad_0`
  - CA$60.00 — Price ID `price_1Sn31o3xrxQgBTzKVXw2N7b2`
    - Suggested Price description (internal): `Group=Post-Production | Unit=Per Song | Standalone=Yes`
    - Suggested Lookup key: `post_vocal_tuning_cad_6000`

### DELIV — Alt Versions Pack (Flat)
- Product ID: `prod_TkYHgaIEooZd4H`
- Product description: Instrumental / acapella / clean / radio edits as specified.
- Prices:
  - CA$25.00 — Price ID `price_1Sn3AY3xrxQgBTzKC43E0jVd`
    - Suggested Price description (internal): `Group=Deliverables | Unit=Flat`
    - Suggested Lookup key: `deliv_alt_versions_pack_flat_cad_2500`

### DELIV — Multitrack Session Export (Flat)
- Product ID: `prod_TkYGTYNhmNtZh9`
- Product description: Full multitrack/session export (audio consolidation + session prep).
- Prices:
  - CA$35.00 — Price ID `price_1Sn39k3xrxQgBTzKnSMmW18G`
    - Suggested Price description (internal): `Group=Deliverables | Unit=Flat`
    - Suggested Lookup key: `deliv_multitrack_session_export_flat_cad_3500`

### DELIV — Project Recall / Archive Retrieval (Flat)
- Product ID: `prod_TkYIGwLBdxvfAY`
- Product description: Retrieval of archived sessions/projects and preparation for delivery.
- Prices:
  - CA$20.00 — Price ID `price_1Sn3Bh3xrxQgBTzKtAk9CkQb`
    - Suggested Price description (internal): `Group=Deliverables | Unit=Flat`
    - Suggested Lookup key: `deliv_project_recall_archive_retrieval_flat_cad_2000`

### DELIV — Stems Export (Flat)
- Product ID: `prod_TkYEGlSCtkBpEk`
- Product description: Consolidated stems delivered to client specification.
- Prices:
  - CA$25.00 — Price ID `price_1Sn38V3xrxQgBTzKWFiSvnWB`
    - Suggested Price description (internal): `Group=Deliverables | Unit=Flat`
    - Suggested Lookup key: `deliv_stems_export_flat_cad_2500`

### DELIV — USB / Media (Flat)
- Product ID: `prod_TkYIe9IrgVRG7r`
- Product description: Physical media provided for delivery.
- Prices:
  - CA$15.00 — Price ID `price_1Sn3CK3xrxQgBTzKJLAtZNFu`
    - Suggested Price description (internal): `Group=Deliverables | Unit=Flat`
    - Suggested Lookup key: `deliv_usb_media_flat_cad_1500`

### FEES — Late Arrival / No-Show (Flat)
- Product ID: `prod_TkYLOZARrz56al`
- Product description: Applied according to studio policy for late/no-show bookings.
- Prices:
  - CA$60.00 — Price ID `price_1Sn3EY3xrxQgBTzKyga3cV2o`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat`
    - Suggested Lookup key: `fees_late_arrival_no_show_flat_cad_6000`

### FEES — Rush Turnaround (24h) (Flat)
- Product ID: `prod_TkYKhvS4h0HdSb`
- Product description: Priority delivery within 24 hours (where feasible).
- Prices:
  - CA$100.00 — Price ID `price_1Sn3Da3xrxQgBTzKggOiMP9c`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat`
    - Suggested Lookup key: `fees_rush_turnaround_24h_flat_cad_10000`

### FEES — Rush Turnaround (48h) (Flat)
- Product ID: `prod_TkYJindpV9mUom`
- Product description: Priority delivery within 48 hours (where feasible).
- Prices:
  - CA$50.00 — Price ID `price_1Sn3D13xrxQgBTzK4kcq3ud3`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat`
    - Suggested Lookup key: `fees_rush_turnaround_48h_flat_cad_5000`

### FEES — Travel
- Product ID: `prod_TkYMNlLZysXNp1`
- Product description: Travel billed per unit (km or fixed unit) for offsite work.
- Prices:
  - CA$1.00 — Price ID `price_1Sn3FZ3xrxQgBTzKqdqBtAnL`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Per km | Set quantity = kilometers`
    - Suggested Lookup key: `fees_travel_cad_100`

### CREDIT — Booking Retainer (Deposit)
- Product ID: `prod_TkYROyS21lPuck`
- Product description: Booking retainer applied toward final invoice per studio policy.
- Prices:
  - CA$50.00 — Price ID `price_1Sn3Kr3xrxQgBTzKgW4ID7Vk`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat | Type=Deposit`
    - Suggested Lookup key: `credit_booking_retainer_deposit_cad_5000`
  - CA$100.00 — Price ID `price_1Sn3Kr3xrxQgBTzKITdBF0UC`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat | Type=Deposit`
    - Suggested Lookup key: `credit_booking_retainer_deposit_cad_10000`
  - CA$200.00 — Price ID `price_1Sn3Kr3xrxQgBTzKMkIluT7V`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat | Type=Deposit`
    - Suggested Lookup key: `credit_booking_retainer_deposit_cad_20000`
  - CA$500.00 — Price ID `price_1Sn3Kr3xrxQgBTzKb74LD2UP`
    - Suggested Price description (internal): `Group=Fees & Credits | Unit=Flat | Type=Deposit`
    - Suggested Lookup key: `credit_booking_retainer_deposit_cad_50000`
