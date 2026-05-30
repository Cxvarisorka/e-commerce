# Test Cases — Reviews

> Related code: `server/routers/review.router.js`, `server/controllers/review.controller.js`,
> `server/validations/review.validation.js`, `server/models/review.model.js`

**Routes**
- `GET    /api/review` — list all (public)
- `GET    /api/review/:productId` — get one (public) — *see TC-REV-03*
- `POST   /api/review/:productId` — create (protect, `reviewSchema`)
- `PATCH  /api/review/:reviewId` — update own (protect, `reviewSchema`)
- `DELETE /api/review/:reviewId` — delete own (protect)

**reviewSchema (`.strict()`):** `rating` number 1–5, `comment` 5–200 chars.
**Model:** unique compound index `{ user, product }` → one review per user/product.

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-REV-01 | List reviews | Low | Functional | Not Run |
| TC-REV-02 | Create valid review | High | Functional | Not Run |
| TC-REV-03 | Get review "by product" returns by review id | Medium | Negative | Not Run |
| TC-REV-04 | Duplicate review by same user | High | Negative | Not Run |
| TC-REV-05 | Rating below 1 / above 5 | Medium | Boundary | Not Run |
| TC-REV-06 | Comment too short (<5) | Medium | Boundary | Not Run |
| TC-REV-07 | Comment too long (>200) | Low | Boundary | Not Run |
| TC-REV-08 | Create review without auth | High | Authorization | Not Run |
| TC-REV-09 | Update own review | Medium | Functional | Not Run |
| TC-REV-10 | Update another user's review | Critical | Authorization | Not Run |
| TC-REV-11 | Delete own review | Medium | Functional | Not Run |
| TC-REV-12 | Delete another user's review | Critical | Authorization | Not Run |
| TC-REV-13 | Delete/update non-existent review | Low | Negative | Not Run |
| TC-REV-14 | Review linked to product.reviews | Medium | Functional | Not Run |

---

### TC-REV-01 — List reviews
- **Priority:** Low · **Type:** Functional · **Endpoint:** `GET /api/review`
- **Expected result:** `200`, `data.reviews` array.

### TC-REV-02 — Create valid review
- **Priority:** High · **Type:** Functional · **Endpoint:** `POST /api/review/:productId`
- **Preconditions:** Logged in; product exists.
- **Steps:** POST `{ "rating": 5, "comment": "Great product" }`.
- **Expected result:** `201`, review created with `user=current`, `product=:productId`; product's `reviews` array updated.

### TC-REV-03 — Get review "by product" returns by review id
- **Priority:** Medium · **Type:** Negative
- **Steps:** `GET /api/review/:productId` with a real product id that has reviews.
- **Expected result (standard):** Should return the reviews **for that product**. **[DEFECT-WATCH]** `getReviewById` calls `Review.findById(productId)` — it treats the param as a *review* id, so passing a product id returns `404 "No review found with this id"`. Route/param is misleading. Expected to FAIL for the stated intent.

### TC-REV-04 — Duplicate review by same user
- **Priority:** High · **Type:** Negative
- **Steps:** Same user posts a second review for the same product.
- **Expected result (standard):** `400`/`409` "already reviewed". **[DEFECT-WATCH]** Unique index throws a Mongo duplicate-key error that `createReview` does not catch → likely surfaces as `500`. Expected to FAIL; recommend catching and returning a clean conflict.

### TC-REV-05 — Rating below 1 / above 5
- **Priority:** Medium · **Type:** Boundary
- **Steps:** POST `rating:0`, then `rating:6`.
- **Expected result:** `400` for both (schema `min(1).max(5)`). Confirm 1 and 5 pass.

### TC-REV-06 — Comment too short (<5)
- **Priority:** Medium · **Type:** Boundary
- **Steps:** `comment:"ok"`.
- **Expected result:** `400`, min-length error.

### TC-REV-07 — Comment too long (>200)
- **Priority:** Low · **Type:** Boundary
- **Steps:** 201-char comment.
- **Expected result:** `400`, max-length error.

### TC-REV-08 — Create review without auth
- **Priority:** High · **Type:** Authorization
- **Expected result:** `401`, `"Token is required!"`.

### TC-REV-09 — Update own review
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `PATCH /api/review/:reviewId`
- **Expected result:** `200`, review updated (rating/comment).

### TC-REV-10 — Update another user's review
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As user B, PATCH user A's review.
- **Expected result:** `403`, `"You are not authorized to update this review"`.

### TC-REV-11 — Delete own review
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `DELETE /api/review/:reviewId`
- **Expected result:** `200`, `"Review deleted successfully"`; review removed and pulled from product. **[DEFECT-WATCH]** Delete pulls from `reviews` while create pushes to `reviews`; verify the product array stays consistent.

### TC-REV-12 — Delete another user's review
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `403`, `"You are not authorized to delete this review"`.

### TC-REV-13 — Delete/update non-existent review
- **Priority:** Low · **Type:** Negative
- **Expected result:** `404`, `"No review found with this id"`.

### TC-REV-14 — Review linked to product.reviews
- **Priority:** Medium · **Type:** Functional
- **Steps:** After TC-REV-02, fetch the product.
- **Expected result:** Product's `reviews` contains the new review id.
