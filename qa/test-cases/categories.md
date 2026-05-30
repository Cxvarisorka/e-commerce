# Test Cases — Categories

> Related code: `server/routers/category.router.js`, `server/controllers/category.controller.js`,
> `server/validations/category..validation.js`, `server/models/category.model.js`

**Routes**
- `GET  /api/category` — list (public)
- `POST /api/category` — create (protect, admin, image upload, `createCategorySchema`)
- `PATCH /api/category/:id` — edit (protect, admin, image upload, `editCategorySchema`)
- `DELETE /api/category/:id` — delete (protect, admin)

**createCategorySchema (`.strict()`):** `name` ≤30, `description` ≤500,
`parentCategory` string (**required**), `allowedAttributes` string[].
**editCategorySchema (`.strict()`):** same + `isActive` boolean (all required).
Create requires an uploaded `image` file.

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-CAT-01 | List categories (public) | Medium | Functional | Not Run |
| TC-CAT-02 | Admin creates category with image | High | Functional | Not Run |
| TC-CAT-03 | Create without image file | High | Negative | Not Run |
| TC-CAT-04 | Create missing parentCategory | Medium | Negative | Not Run |
| TC-CAT-05 | Create with extra/unknown field | Medium | Negative | Not Run |
| TC-CAT-06 | Create name over 30 chars | Low | Boundary | Not Run |
| TC-CAT-07 | Non-admin cannot create | Critical | Authorization | Not Run |
| TC-CAT-08 | Create without auth | High | Authorization | Not Run |
| TC-CAT-09 | Admin edits category | High | Functional | Not Run |
| TC-CAT-10 | Edit non-existent category | Medium | Negative | Not Run |
| TC-CAT-11 | Non-admin cannot edit | Critical | Authorization | Not Run |
| TC-CAT-12 | Deactivate category (isActive=false) | High | Functional | Not Run |
| TC-CAT-13 | Admin deletes category | High | Functional | Not Run |
| TC-CAT-14 | Non-admin cannot delete | Critical | Authorization | Not Run |

---

### TC-CAT-01 — List categories (public)
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `GET /api/category`
- **Expected result:** `200`, `{ status:"success", data:{ categories:[…] } }`. No auth needed.

### TC-CAT-02 — Admin creates category with image
- **Priority:** High · **Type:** Functional · **Endpoint:** `POST /api/category`
- **Preconditions:** Logged in as admin.
- **Steps:** POST multipart: `image` file + `{ name:"Phones", description:"...", parentCategory:"Electronics", allowedAttributes:["ram","storage"] }`.
- **Expected result:** `201`, category created with `image.src=/images/<file>`, `isActive` defaults to `true`.

### TC-CAT-03 — Create without image file
- **Priority:** High · **Type:** Negative
- **Steps:** As admin, POST valid body but **no** file.
- **Expected result (standard):** `400` with a clear "image required" message. **[DEFECT-WATCH]** Controller reads `req.file.filename` unguarded → likely `500 TypeError` when no file. Expected to FAIL; recommend validating `req.file`.

### TC-CAT-04 — Create missing parentCategory
- **Priority:** Medium · **Type:** Negative
- **Steps:** As admin, POST without `parentCategory`.
- **Expected result:** `400` — schema requires `parentCategory`.

### TC-CAT-05 — Create with extra/unknown field
- **Priority:** Medium · **Type:** Negative
- **Steps:** Add `{ "foo": "bar" }` to the body.
- **Expected result:** `400` — `.strict()` rejects unknown keys.

### TC-CAT-06 — Create name over 30 chars
- **Priority:** Low · **Type:** Boundary
- **Steps:** `name` = 31 chars.
- **Expected result:** `400`, validation error (max 30).

### TC-CAT-07 — Non-admin cannot create
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As `seller`/`user`, POST a category.
- **Expected result:** `401`, `"User is not authorized!"` (blocked by `allowedTo("admin")`).

### TC-CAT-08 — Create without auth
- **Priority:** High · **Type:** Authorization
- **Expected result:** `401`, `"Token is required!"`.

### TC-CAT-09 — Admin edits category
- **Priority:** High · **Type:** Functional · **Endpoint:** `PATCH /api/category/:id`
- **Steps:** As admin, PATCH with all required fields (name, description, parentCategory, allowedAttributes, isActive).
- **Expected result:** `200`, updated category returned.

### TC-CAT-10 — Edit non-existent category
- **Priority:** Medium · **Type:** Negative
- **Steps:** As admin, PATCH a valid-but-missing id.
- **Expected result:** `404`, `"Category not found!"`.

### TC-CAT-11 — Non-admin cannot edit
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `401` (route `allowedTo("admin")`).

### TC-CAT-12 — Deactivate category (isActive=false)
- **Priority:** High · **Type:** Functional
- **Steps:** As admin, PATCH `isActive:false`.
- **Expected result (standard):** Category becomes inactive; creating products under it is then blocked (see TC-PROD-08). **[DEFECT-WATCH]** Controller uses `if (isActive) category.isActive = isActive;` — passing `false` is falsy and is **ignored**, so a category cannot be deactivated via edit. Expected to FAIL; recommend an explicit `!== undefined` check.

### TC-CAT-13 — Admin deletes category
- **Priority:** High · **Type:** Functional · **Endpoint:** `DELETE /api/category/:id`
- **Expected result:** `200`, `"Category deleted successfully!"`. (Consider orphaned products referencing the category — see TC-PROD notes.)

### TC-CAT-14 — Non-admin cannot delete
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `401`, `"User is not authorized!"`.
