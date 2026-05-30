# Test Cases — Payments / Checkout

> Related code: `server/routers/payment.router.js`, `server/controllers/payment.controller.js`,
> `server/models/payment.model.js`. Provider: **Stripe** (Checkout + Connect transfers).

**Routes**
- `POST /api/payment/checkout` — create Stripe Checkout session (protect, `paymentLimiter`)
- `POST /api/payment/webhook` — Stripe webhook (raw body, signature-verified, no auth)

**Request body (checkout):** `userOrder: [{ id: <productId>, quantity: <int> }]`.
**Business rules:** quantity must be a positive integer; all products must exist;
every product's seller must have a `stripeAccountId`; platform commission = 5%
per item; a `Payment` record is created with `status:"pending"`.

> ⚠️ Use Stripe **test mode** keys and test cards. Never use real card data.

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-PAY-01 | Create checkout session (happy path) | Critical | Functional | Not Run |
| TC-PAY-02 | Payment record created as pending | High | Functional | Not Run |
| TC-PAY-03 | Commission/seller split is correct (5%) | Critical | Functional | Not Run |
| TC-PAY-04 | Checkout without auth | Critical | Authorization | Not Run |
| TC-PAY-05 | Quantity zero / negative | High | Negative | Not Run |
| TC-PAY-06 | Quantity non-integer | Medium | Negative | Not Run |
| TC-PAY-07 | Product ids not found | Medium | Negative | Not Run |
| TC-PAY-08 | Seller without Stripe account | High | Negative | Not Run |
| TC-PAY-09 | paymentLimiter blocks carding | High | Security | Not Run |
| TC-PAY-10 | Webhook rejects bad signature | Critical | Security | Not Run |
| TC-PAY-11 | Webhook completes payment + transfers | Critical | Functional | Not Run |
| TC-PAY-12 | Webhook idempotency (replay) | High | Security | Not Run |
| TC-PAY-13 | Webhook payment_failed sets status | High | Functional | Not Run |
| TC-PAY-14 | Webhook unpaid session ignored | Medium | Functional | Not Run |
| TC-PAY-15 | Amount sent to Stripe in cents | High | Functional | Not Run |

---

### TC-PAY-01 — Create checkout session (happy path)
- **Priority:** Critical · **Type:** Functional · **Endpoint:** `POST /api/payment/checkout`
- **Preconditions:** Logged in; products exist; their sellers have `stripeAccountId`.
- **Steps:** POST `{ "userOrder": [{ "id": "<prodId>", "quantity": 2 }] }`.
- **Expected result:** `201`, `data.sessionUrl` (Stripe URL) + `data.sessionId` + `data.payment` returned.

### TC-PAY-02 — Payment record created as pending
- **Priority:** High · **Type:** Functional
- **Steps:** After TC-PAY-01, inspect the Payment doc.
- **Expected result:** `status:"pending"`, `stripeSessionId` set, `sellerDistributions` populated, `webhookProcessed:false`.

### TC-PAY-03 — Commission/seller split is correct (5%)
- **Priority:** Critical · **Type:** Functional
- **Steps:** Order qty 2 of a $100 product. Inspect distribution math.
- **Expected result:** `itemTotal=200`, `commission=10.00` (5%), `sellerAmount=190.00`, `platformCommission=10`, `sellerNetAmount=190`. Verify rounding to 2 decimals.

### TC-PAY-04 — Checkout without auth
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `401`, `"Token is required!"`.

### TC-PAY-05 — Quantity zero / negative
- **Priority:** High · **Type:** Negative
- **Steps:** `quantity:0`, then `-1`.
- **Expected result:** `400`, `"Incorrect quantity!"`. **[DEFECT-WATCH]** The check runs inside `Array.reduce` and calls `next(...)` but does not stop the loop/return from the handler — verify a single 400 is sent and no "headers already sent" error occurs for multi-item carts.

### TC-PAY-06 — Quantity non-integer
- **Priority:** Medium · **Type:** Negative
- **Steps:** `quantity:1.5`.
- **Expected result:** `400`, `"Incorrect quantity!"` (`Number.isInteger` check).

### TC-PAY-07 — Product ids not found
- **Priority:** Medium · **Type:** Negative
- **Steps:** `userOrder` with ids that don't exist.
- **Expected result:** `404`, `"Products cant be found"`.

### TC-PAY-08 — Seller without Stripe account
- **Priority:** High · **Type:** Negative
- **Preconditions:** A product whose seller has no `stripeAccountId`.
- **Steps:** Checkout that product.
- **Expected result:** `400`, `"All sellers must have a Stripe account connected before checkout."` No session created.

### TC-PAY-09 — paymentLimiter blocks carding
- **Priority:** High · **Type:** Security
- **Steps:** Rapidly call `/checkout` beyond the configured limit.
- **Expected result:** `429 Too Many Requests` once the limit is exceeded.

### TC-PAY-10 — Webhook rejects bad signature
- **Priority:** Critical · **Type:** Security · **Endpoint:** `POST /api/payment/webhook`
- **Steps:** POST a body with a missing/invalid `stripe-signature`.
- **Expected result:** `400`, `"Webhook error: …"`. Payment state unchanged. (Webhook uses raw body + `STRIPE_WEBHOOK_SECRET`.)

### TC-PAY-11 — Webhook completes payment + transfers
- **Priority:** Critical · **Type:** Functional
- **Steps:** Send a valid `checkout.session.completed` event (Stripe CLI) for a paid session.
- **Expected result:** Matching Payment → `status:"succeeded"`, `webhookProcessed:true`; `sellerTransfers` created (one per seller account) with the net amounts; `200 {received:true}`.

### TC-PAY-12 — Webhook idempotency (replay)
- **Priority:** High · **Type:** Security
- **Steps:** Re-deliver the same `checkout.session.completed` event.
- **Expected result (standard):** No double transfer / no duplicate payout. **[DEFECT-WATCH]** Handler does not check `webhookProcessed` before creating transfers, so a replay can issue Stripe transfers again. Expected to FAIL; recommend short-circuiting when `webhookProcessed===true`.

### TC-PAY-13 — Webhook payment_failed sets status
- **Priority:** High · **Type:** Functional
- **Steps:** Send `payment_intent.payment_failed`.
- **Expected result:** Matching Payment → `status:"failed"`, `webhookProcessed:true`, `200 {received:true}`. **[DEFECT-WATCH]** Lookup uses `paymentIntent.payment_details?.order_reference` to find the session, which is not a standard Stripe field — verify the failed payment is actually matched; otherwise status never updates.

### TC-PAY-14 — Webhook unpaid session ignored
- **Priority:** Medium · **Type:** Functional
- **Steps:** Send `checkout.session.completed` with `payment_status != "paid"`.
- **Expected result:** `200 {received:true}`, no status change, no transfers.

### TC-PAY-15 — Amount sent to Stripe in cents
- **Priority:** High · **Type:** Functional
- **Steps:** Inspect `line_items` unit_amount for a $100 product.
- **Expected result:** `unit_amount = 10000` (price × 100). Verify no floating-point rounding error for prices like $19.99.
