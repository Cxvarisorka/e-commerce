# Test Cases — Security & Platform (cross-cutting)

> Related code: `server/app.js`, `server/config/rateLimit.config.js`,
> `server/middlewares/security.middleware.js`, `server/middlewares/validate.middleware.js`,
> `server/config/upload.config.js`, `server/controllers/error.controller.js`

Covers concerns that span all features: rate limits, security headers,
input sanitization, error handling, CORS, file uploads, and health.

**Rate limits (express-rate-limit):**
| Limiter | Window | Limit | Applied to |
|---------|--------|-------|-----------|
| globalLimiter | 10 min | 500 / IP | all (skips `/api/payment/webhook`) |
| apiLimiter | 15 min | 200 | all `/api/*` |
| authLimiter | 15 min | 10 **failed** | `/auth/signup`, `/auth/signin` |
| uploadLimiter | 60 min | 30 | product/category create+edit |
| paymentLimiter | 15 min | 20 | `/payment/checkout` |
| aiRateLimiter | 1 min | 10 | product create |

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-SEC-01 | Health endpoint up | Low | Functional | Not Run |
| TC-SEC-02 | Security headers present (helmet) | High | Security | Not Run |
| TC-SEC-03 | CORS restricted to CLIENT_URL + credentials | High | Security | Not Run |
| TC-SEC-04 | NoSQL injection sanitized | Critical | Security | Not Run |
| TC-SEC-05 | HPP parameter pollution handled | Medium | Security | Not Run |
| TC-SEC-06 | Global error handler hides internals | High | Security | Not Run |
| TC-SEC-07 | Validation returns generic 400 | Low | Negative | Not Run |
| TC-SEC-08 | Global rate limit (500/10min) | Medium | Security | Not Run |
| TC-SEC-09 | API rate limit (200/15min) | Medium | Security | Not Run |
| TC-SEC-10 | Upload limiter (30/60min) | Medium | Security | Not Run |
| TC-SEC-11 | AI limiter (10/min) on product create | Medium | Security | Not Run |
| TC-SEC-12 | File upload type/size restriction | High | Security | Not Run |
| TC-SEC-13 | Uploaded filename collision/traversal | Medium | Security | Not Run |
| TC-SEC-14 | Cookie flags in production | Critical | Security | Not Run |
| TC-SEC-15 | Webhook excluded from limiters & JSON parsing | High | Functional | Not Run |
| TC-SEC-16 | 404 for unknown route | Low | Negative | Not Run |

---

### TC-SEC-01 — Health endpoint up
- **Priority:** Low · **Type:** Functional · **Endpoint:** `GET /health`
- **Expected result:** `200`, `{ status:"success", message:"Server is running!" }`.

### TC-SEC-02 — Security headers present (helmet)
- **Priority:** High · **Type:** Security
- **Steps:** Inspect response headers on any endpoint.
- **Expected result:** helmet defaults present (e.g. `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `X-Frame-Options`/CSP). No `X-Powered-By: Express`.

### TC-SEC-03 — CORS restricted to CLIENT_URL + credentials
- **Priority:** High · **Type:** Security
- **Steps:** Send requests with `Origin: <CLIENT_URL>` and with a foreign origin.
- **Expected result:** `Access-Control-Allow-Origin` echoes only `CLIENT_URL`; `Access-Control-Allow-Credentials: true`. Foreign origins not allowed.

### TC-SEC-04 — NoSQL injection sanitized
- **Priority:** Critical · **Type:** Security
- **Steps:** POST `/auth/signin` with `{ "email": { "$gt": "" }, "password": "..." }`.
- **Expected result:** Operator keys stripped/replaced (`replaceWith:"_"`); no auth bypass. Login fails normally. Repeat with query/params containing `$`/`.`.

### TC-SEC-05 — HPP parameter pollution handled
- **Priority:** Medium · **Type:** Security
- **Steps:** Send duplicated query params (e.g. `?role=user&role=admin`).
- **Expected result:** `hpp()` collapses duplicates; no unexpected array handling.

### TC-SEC-06 — Global error handler hides internals
- **Priority:** High · **Type:** Security
- **Steps:** Trigger a server error (e.g. malformed ObjectId where not guarded).
- **Expected result:** Client receives a sanitized message + appropriate status; **no** stack trace or DB internals in production. Review `error.controller.js` dev/prod branching.

### TC-SEC-07 — Validation returns generic 400
- **Priority:** Low · **Type:** Negative
- **Steps:** Send any body failing a Zod schema.
- **Expected result:** `400`, `"Validation failed!"`. **Note:** the message is generic (no per-field detail) by design in `validate.middleware.js`; confirm this matches the desired API contract (frontend cannot show field-level errors).

### TC-SEC-08 — Global rate limit (500/10min)
- **Priority:** Medium · **Type:** Security
- **Expected result:** Exceeding 500 requests/10 min/IP → `429` `{status:"error", message:"Too many requests — please try again later.", retryAfter}`. `RateLimit` (draft-8) headers present.

### TC-SEC-09 — API rate limit (200/15min)
- **Priority:** Medium · **Type:** Security
- **Steps:** Exceed 200 `/api/*` requests in 15 min.
- **Expected result:** `429`, `"API rate limit exceeded — please slow down."`.

### TC-SEC-10 — Upload limiter (30/60min)
- **Priority:** Medium · **Type:** Security
- **Steps:** Exceed 30 product/category create+edit calls in an hour.
- **Expected result:** `429`, `"Upload limit reached…"`.

### TC-SEC-11 — AI limiter (10/min) on product create
- **Priority:** Medium · **Type:** Security
- **Steps:** Call `POST /api/product/:categoryId` >10×/min.
- **Expected result:** `429` (aiRateLimiter) — protects the Groq AI moderation quota.

### TC-SEC-12 — File upload type/size restriction
- **Priority:** High · **Type:** Security
- **Steps:** Upload a non-image (e.g. `.exe`/`.html`) and a very large file as a product/category image.
- **Expected result (standard):** Non-images and oversized files rejected. **[DEFECT-WATCH]** `upload.config.js` sets no `fileFilter` and no `limits` → any file type and unbounded size are accepted. Expected to FAIL; recommend `fileFilter` (image mimetypes) + `limits.fileSize`.

### TC-SEC-13 — Uploaded filename collision/traversal
- **Priority:** Medium · **Type:** Security
- **Steps:** Upload files with identical names and with `../` in the original name.
- **Expected result:** Stored as `Date.now()-originalname` under `images/`; verify no path traversal escapes the `images/` dir and concurrent same-name uploads don't overwrite each other.

### TC-SEC-14 — Cookie flags in production
- **Priority:** Critical · **Type:** Security
- **Steps:** With `NODE_ENV` ≠ `dev`, sign in and inspect `Set-Cookie`.
- **Expected result:** `jwt` cookie is `HttpOnly; Secure; SameSite=Strict`. (In `dev`: `SameSite=Lax`, not secure.)

### TC-SEC-15 — Webhook excluded from limiters & JSON parsing
- **Priority:** High · **Type:** Functional
- **Steps:** Confirm `/api/payment/webhook` uses `express.raw` and is skipped by `globalLimiter`.
- **Expected result:** Webhook receives the raw body (needed for Stripe signature verification) and is not throttled by the global limiter. Note: `apiLimiter` is mounted on `/api` — verify high-volume Stripe events are not unintentionally rate-limited.

### TC-SEC-16 — 404 for unknown route
- **Priority:** Low · **Type:** Negative
- **Steps:** `GET /api/does-not-exist`.
- **Expected result:** A clean 404 (or handled error), not an unhandled crash. **[DEFECT-WATCH]** No explicit catch-all 404 route is registered before the error handler — confirm the response is reasonable.
