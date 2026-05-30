# Test Cases — Comments

> Related code: `server/routers/comment.router.js`, `server/controllers/comment.controller.js`,
> `server/validations/comment.validation.js`, `server/models/comment.model.js`

**Routes**
- `GET    /api/comment` — list all (public)
- `GET    /api/comment/:commentId` — get one (public)
- `POST   /api/comment/:productId` — create (protect, `commentSchema`)
- `PATCH  /api/comment/:commentId` — update own (protect, `commentSchema`)
- `DELETE /api/comment/:commentId` — delete own (protect)

**commentSchema (`.strict()`):** `content` 1–200 chars.

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-CMT-01 | List comments | Low | Functional | Not Run |
| TC-CMT-02 | Create valid comment | High | Functional | Not Run |
| TC-CMT-03 | Get comment by id | Low | Functional | Not Run |
| TC-CMT-04 | Get comment not found | Low | Negative | Not Run |
| TC-CMT-05 | Empty content rejected | Medium | Negative | Not Run |
| TC-CMT-06 | Content too long (>200) | Low | Boundary | Not Run |
| TC-CMT-07 | Extra field rejected | Low | Negative | Not Run |
| TC-CMT-08 | Create without auth | High | Authorization | Not Run |
| TC-CMT-09 | Update own comment | Medium | Functional | Not Run |
| TC-CMT-10 | Update another user's comment | Critical | Authorization | Not Run |
| TC-CMT-11 | Delete own comment | Medium | Functional | Not Run |
| TC-CMT-12 | Delete another user's comment | Critical | Authorization | Not Run |
| TC-CMT-13 | Comment linked to product.comments | Medium | Functional | Not Run |
| TC-CMT-14 | XSS payload in content stored safely | High | Security | Not Run |

---

### TC-CMT-01 — List comments
- **Priority:** Low · **Type:** Functional · **Endpoint:** `GET /api/comment`
- **Expected result:** `200`, `data` array. (Note: handler returns `status:"succass"` typo — track if API contract assertions are strict.)

### TC-CMT-02 — Create valid comment
- **Priority:** High · **Type:** Functional · **Endpoint:** `POST /api/comment/:productId`
- **Preconditions:** Logged in; product exists.
- **Steps:** POST `{ "content": "Nice!" }`.
- **Expected result:** `201`, `"Comment created successfully!"`; comment linked to user + product.

### TC-CMT-03 — Get comment by id
- **Priority:** Low · **Type:** Functional · **Endpoint:** `GET /api/comment/:commentId`
- **Expected result:** `200`, the comment.

### TC-CMT-04 — Get comment not found
- **Priority:** Low · **Type:** Negative
- **Expected result:** `404`, `"No comment found with this id"`. (Malformed id may surface a cast error — verify it is a clean 4xx, not 500.)

### TC-CMT-05 — Empty content rejected
- **Priority:** Medium · **Type:** Negative
- **Steps:** POST `{ "content": "" }`.
- **Expected result:** `400` — schema `min(1)`.

### TC-CMT-06 — Content too long (>200)
- **Priority:** Low · **Type:** Boundary
- **Steps:** 201-char content.
- **Expected result:** `400`, max-length error.

### TC-CMT-07 — Extra field rejected
- **Priority:** Low · **Type:** Negative
- **Steps:** POST `{ "content":"hi", "rating":5 }`.
- **Expected result:** `400` — `.strict()` rejects `rating`.

### TC-CMT-08 — Create without auth
- **Priority:** High · **Type:** Authorization
- **Expected result:** `401`, `"Token is required!"`.

### TC-CMT-09 — Update own comment
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `PATCH /api/comment/:commentId`
- **Expected result:** `200`, `"Comment updated successfully!"`.

### TC-CMT-10 — Update another user's comment
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `401`, `"You are not authorized to update this comment"`.

### TC-CMT-11 — Delete own comment
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `DELETE /api/comment/:commentId`
- **Expected result:** `200`, `"Comment deleted successfully!"`. **[DEFECT-WATCH]** Delete does `$pull: { comments: id }` but the product stores it at `universal.comments` (create uses `$push: { "universal.comments" }`). The pull path is wrong → the id is **not** removed from the product. Expected to FAIL the consistency check; recommend `$pull: { "universal.comments": id }`.

### TC-CMT-12 — Delete another user's comment
- **Priority:** Critical · **Type:** Authorization
- **Expected result:** `401`, `"You are not authorized to delete this comment"`.

### TC-CMT-13 — Comment linked to product.comments
- **Priority:** Medium · **Type:** Functional
- **Steps:** After TC-CMT-02, fetch the product.
- **Expected result:** `universal.comments` contains the new comment id.

### TC-CMT-14 — XSS payload in content stored safely
- **Priority:** High · **Type:** Security
- **Steps:** POST `content: "<script>alert(1)</script>"`.
- **Expected result:** Stored as data; when rendered on the frontend it must be escaped/not executed. Verify React output encoding (no `dangerouslySetInnerHTML`).
