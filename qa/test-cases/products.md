# Test Cases — Products

> Related code: `server/routers/product.router.js`, `server/controllers/product.controller.js`,
> `server/validations/product.validation.js`, `server/models/product.model.js`,
> `server/services/groqService.js` (AI moderation)

**Routes**
- `GET    /api/product` — list (public)
- `POST   /api/product/:categoryId` — create (protect, admin|seller, upload ≤5 images, AI rate limit, `validationProductSchema`)
- `PATCH  /api/product/:productId` — edit (protect, upload ≤5 images, `validationProductSchema`)
- `DELETE /api/product/:productId` — delete (protect, admin|seller)

**validationProductSchema:** `title` 5–50, `description` 10–500,
`price` number, `stock` number. (Not `.strict()`.)

> Note: create runs an AI check `validateProduct(title, description, price)`;
> if it returns `rejected` / `needs_review`, the API responds `400` with the
> AI result. Attributes in the body must all be within the category's
> `allowedAttributes`.

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-PROD-01 | List products (public) | Medium | Functional | Not Run |
| TC-PROD-02 | Seller creates valid product | Critical | Functional | Not Run |
| TC-PROD-03 | Create with up to 5 images | Medium | Functional | Not Run |
| TC-PROD-04 | Create rejects 6th image | Medium | Boundary | Not Run |
| TC-PROD-05 | Create title too short (<5) | Medium | Boundary | Not Run |
| TC-PROD-06 | Create price as string | High | Negative | Not Run |
| TC-PROD-07 | Create under non-existent category | Medium | Negative | Not Run |
| TC-PROD-08 | Create under inactive category | High | Functional | Not Run |
| TC-PROD-09 | Create with disallowed attribute | High | Negative | Not Run |
| TC-PROD-10 | Create flagged by AI moderation | High | Functional | Not Run |
| TC-PROD-11 | Regular user cannot create | Critical | Authorization | Not Run |
| TC-PROD-12 | Create without auth | High | Authorization | Not Run |
| TC-PROD-13 | Owner edits own product | High | Functional | Not Run |
| TC-PROD-14 | Edit requires full valid body | Medium | Negative | Not Run |
| TC-PROD-15 | Non-owner cannot edit | Critical | Authorization | Not Run |
| TC-PROD-16 | Admin cannot edit others' product | Medium | Authorization | Not Run |
| TC-PROD-17 | Edit non-existent product | Low | Negative | Not Run |
| TC-PROD-18 | Owner deletes own product | High | Functional | Not Run |
| TC-PROD-19 | Admin deletes any product | High | Authorization | Not Run |
| TC-PROD-20 | Non-owner non-admin cannot delete | Critical | Authorization | Not Run |
| TC-PROD-21 | Delete non-existent product | Low | Negative | Not Run |
| TC-PROD-22 | Negative price / stock | Medium | Boundary | Not Run |

---

### TC-PROD-01 — List products (public)
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `GET /api/product`
- **Expected result:** `200`, `data.products` array. No auth required.

### TC-PROD-02 — Seller creates valid product
- **Priority:** Critical · **Type:** Functional · **Endpoint:** `POST /api/product/:categoryId`
- **Preconditions:** Logged in as seller/admin; category exists and is active.
- **Steps:** POST multipart with `title`(≥5), `description`(≥10), `price`(number), `stock`(number), optional images.
- **Expected result:** `201`; product created with `universal.sellerId = current user`, category linked, `stock` default 1 if omitted.

### TC-PROD-03 — Create with up to 5 images
- **Priority:** Medium · **Type:** Functional
- **Steps:** Attach 5 image files.
- **Expected result:** `201`; `universal.images` has 5 entries `{src, alt:"Product image"}`.

### TC-PROD-04 — Create rejects 6th image
- **Priority:** Medium · **Type:** Boundary
- **Steps:** Attach 6 image files.
- **Expected result:** Upload rejected by `upload.array("images", 5)` (Multer `LIMIT_UNEXPECTED_FILE`) → `400`/handled error, product not created.

### TC-PROD-05 — Create title too short (<5)
- **Priority:** Medium · **Type:** Boundary
- **Steps:** `title="abc"`.
- **Expected result:** `400`, title min-length error.

### TC-PROD-06 — Create price as string
- **Priority:** High · **Type:** Negative
- **Steps:** Send `price:"10"` (string). Note: multipart fields arrive as strings — confirm the client coerces to number before send.
- **Expected result:** `400` — schema requires `price` to be a number. Documents the multipart/number coercion requirement.

### TC-PROD-07 — Create under non-existent category
- **Priority:** Medium · **Type:** Negative
- **Steps:** POST `/api/product/<missing categoryId>`.
- **Expected result:** `404`, `"Category not found!"`.

### TC-PROD-08 — Create under inactive category
- **Priority:** High · **Type:** Functional
- **Preconditions:** Category with `isActive=false`.
- **Steps:** Create a product under it.
- **Expected result:** `400`, `"You cant create new product because this category is disable"`.

### TC-PROD-09 — Create with disallowed attribute
- **Priority:** High · **Type:** Negative
- **Steps:** Body includes `attributes:{ color:"red" }` where `color` is **not** in category `allowedAttributes`.
- **Expected result:** `400`, `"You passed the wrong properties!"`.

### TC-PROD-10 — Create flagged by AI moderation
- **Priority:** High · **Type:** Functional
- **Steps:** Submit a product whose title/description triggers `rejected` or `needs_review`.
- **Expected result:** `400` with the AI `result` JSON; product not created.

### TC-PROD-11 — Regular user cannot create
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As `user`, POST a product.
- **Expected result:** `401`, `"User is not authorized!"` (`allowedTo("admin","seller")`).

### TC-PROD-12 — Create without auth
- **Priority:** High · **Type:** Authorization
- **Expected result:** `401`, `"Token is required!"`.

### TC-PROD-13 — Owner edits own product
- **Priority:** High · **Type:** Functional · **Endpoint:** `PATCH /api/product/:productId`
- **Steps:** As the seller who owns it, PATCH with valid title/description/price/stock.
- **Expected result:** `200`, product updated.

### TC-PROD-14 — Edit requires full valid body
- **Priority:** Medium · **Type:** Negative
- **Steps:** PATCH with only `{ price: 20 }`.
- **Expected result:** `400` — `validationProductSchema` requires title/description/price/stock all present. **[DEFECT-WATCH]** Edit is intended to be partial (controller does `if (title) …`), but the validation middleware forces a full body, so partial edits are impossible. Expected to FAIL for partial input; recommend a separate partial/`.partial()` schema for edit.

### TC-PROD-15 — Non-owner cannot edit
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As a different seller, PATCH someone else's product.
- **Expected result:** `401`, `"You cant edit this product!"`.

### TC-PROD-16 — Admin cannot edit others' product
- **Priority:** Medium · **Type:** Authorization
- **Steps:** As admin, PATCH a seller's product.
- **Expected result (observed):** `401` — edit checks ownership only, with **no** admin override (unlike delete). Confirm whether admins should be allowed to edit; document the asymmetry vs delete.

### TC-PROD-17 — Edit non-existent product
- **Priority:** Low · **Type:** Negative
- **Expected result:** `404`, `"Product not found!"`.

### TC-PROD-18 — Owner deletes own product
- **Priority:** High · **Type:** Functional · **Endpoint:** `DELETE /api/product/:productId`
- **Expected result:** `200`, `"Product deleted successfully!"`.

### TC-PROD-19 — Admin deletes any product
- **Priority:** High · **Type:** Authorization
- **Steps:** As admin, delete a seller's product.
- **Expected result:** `200` — delete allows owner **or** admin.

### TC-PROD-20 — Non-owner non-admin cannot delete
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As a different seller, delete another seller's product.
- **Expected result:** `401`, `"You cant delete this product!"`.

### TC-PROD-21 — Delete non-existent product
- **Priority:** Low · **Type:** Negative
- **Expected result:** `404`, `"Product not found!"`.

### TC-PROD-22 — Negative price / stock
- **Priority:** Medium · **Type:** Boundary
- **Steps:** Create with `price:-5` or `stock:-1`.
- **Expected result (standard):** Rejected with `400`. **[DEFECT-WATCH]** Schema only checks `z.number()` with no `.min(0)`, and the model has no min — negatives are currently accepted. Expected to FAIL; recommend non-negative constraints (critical for pricing integrity).
