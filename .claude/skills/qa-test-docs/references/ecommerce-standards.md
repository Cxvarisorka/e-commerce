# E-commerce QA Standards & Quality Dimensions

Reference checklist to ensure generated test documentation covers the
dimensions that matter for an online store. Pull the relevant rows into any
test plan/cases doc for the feature under test.

## 1. Functional correctness
- Happy path completes and persists (DB write confirmed).
- CRUD operations return correct resource shape.
- List/search/filter/sort/pagination return correct, stable results.
- State transitions are valid (e.g. order: created → paid → shipped).

## 2. Input validation & negative paths
- Required fields enforced; reject empty/missing.
- Type, length, format, and range limits (match the Zod/validation schema).
- Trimming, case-sensitivity, and unicode/emoji handling.
- Duplicate handling (e.g. duplicate email on register → 409/400).
- SQL/NoSQL injection and XSS payloads are sanitized/rejected.

## 3. Authentication & authorization
- Login with valid/invalid/locked credentials.
- Password rules enforced (length, complexity per validation schema).
- Token/session: expiry, refresh, logout invalidates access.
- Role enforcement: guest vs. user vs. admin on each protected route.
- Unauthorized → 401; authenticated-but-forbidden → 403.
- IDOR: user A cannot read/modify user B's resources.

## 4. Cart, checkout & payments
- Add/update/remove cart items; quantity bounds; empty cart handling.
- Price, tax, discount, and total recalculated correctly.
- Stock/inventory decrement on purchase; out-of-stock blocked.
- Payment success, failure, decline, and timeout handled distinctly.
- Idempotency: double-submit / refresh does not double-charge.
- No sensitive card data stored/logged (PCI mindset).
- Currency formatting and rounding correct.

## 5. Catalog, reviews & comments
- Product visibility (published/unpublished, in/out of stock).
- Reviews/comments: only authenticated users; one review per user/product if required.
- Rating bounds (e.g. 1–5); moderation/ownership for edit/delete.
- Profanity/spam handling if applicable.

## 6. Security
- HTTPS-only assumptions; secure cookies; CORS rules.
- Rate limiting / brute-force protection on auth endpoints.
- Error responses don't leak stack traces or internals.
- File upload validation (type/size) where applicable.
- Headers (CSP, etc.) via security middleware.

## 7. Performance & reliability
- Response time under expected load for list/search endpoints.
- Pagination prevents unbounded responses.
- Graceful handling of DB/network failure (5xx → friendly message).
- Concurrency: simultaneous edits / last purchase of stock.

## 8. Usability & accessibility (frontend)
- Responsive across mobile/tablet/desktop breakpoints.
- Forms: inline validation, clear error/success toasts.
- Keyboard navigation and focus order; labels for inputs.
- Color contrast; screen-reader friendly alt text.
- Loading and empty states present.

## 9. Cross-browser / cross-device
- Latest Chrome, Firefox, Safari, Edge.
- iOS Safari and Android Chrome.

## 10. Data integrity & i18n
- Timestamps/timezones consistent.
- Numeric precision for money.
- Localization/encoding of names and addresses.

## Priority guidance
- **Critical:** auth, payments, order placement, data loss, security.
- **High:** catalog browse/search, cart, profile.
- **Medium:** reviews, comments, filters, sorting.
- **Low:** cosmetic, rarely-used admin tooling.
