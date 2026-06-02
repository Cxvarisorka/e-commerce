# Test Cases — Users / Profile

> Related code: `server/routers/user.router.js`, `server/controllers/user.controller.js`,
> `server/validations/user.validation.js`, `server/models/user.model.js`

**Routes**
- `GET  /api/user` — list all users (**no auth on route**)
- `GET  /api/user/:id` — get one user (**no auth on route**)
- `PATCH /api/user/:id` — update self (protect, avatar upload, `updateUserSchema`)
- `DELETE /api/user/:id` — delete (protect, **admin only**)
- `PATCH /api/user/:id/role` — change role (protect, **admin only**, `updateUserRoleSchema`)

**updateUserSchema (`.strict()`):** `fullname` 3–30, `password` 8–50 (both required).

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-USER-01 | List all users | Medium | Functional | Passed |
| TC-USER-02 | List users does not leak password hashes | Critical | Security | Passed |
| TC-USER-03 | Get user by valid id | Medium | Functional | Passed |
| TC-USER-04 | Get user invalid ObjectId | Medium | Negative | Passed |
| TC-USER-05 | Get user not found | Medium | Negative | Passed |
| TC-USER-06 | Get user by id leaks password hash | Critical | Security | Passed |
| TC-USER-07 | Update own profile | High | Functional | Passed |
| TC-USER-08 | Update profile with avatar upload | Medium | Functional | Not Run |
| TC-USER-09 | Update another user's profile (forbidden) | Critical | Authorization | Not Run |
| TC-USER-10 | Update profile without auth | High | Authorization | Not Run |
| TC-USER-11 | Update profile missing fullname/password | Medium | Negative | Not Run |
| TC-USER-12 | Update password is re-hashed | High | Security | Not Run |
| TC-USER-13 | Admin deletes a user | High | Functional | Not Run |
| TC-USER-14 | Non-admin cannot delete a user | Critical | Authorization | Not Run |
| TC-USER-15 | Self-delete as non-admin blocked by route | High | Authorization | Not Run |
| TC-USER-16 | Delete user not found | Low | Negative | Not Run |
| TC-USER-17 | Admin changes a user's role | High | Functional | Not Run |
| TC-USER-18 | Change role invalid value | Medium | Negative | Not Run |
| TC-USER-19 | Non-admin cannot change roles | Critical | Authorization | Not Run |
| TC-USER-20 | Change role invalid ObjectId | Low | Negative | Not Run |

---

### TC-USER-01 — List all users
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `GET /api/user`
- **Expected result:** `200`, `{ status:"success", data: [users] }`.

### TC-USER-02 — List users does not leak password hashes
- **Priority:** Critical · **Type:** Security
- **Steps:** Inspect each object in `GET /api/user` response.
- **Expected result (standard):** `password` field must be absent. **[DEFECT-WATCH]** `getUsers` returns `User.find()` with no field exclusion → bcrypt hashes are exposed. This case is expected to FAIL; recommend `.select("-password")`.

### TC-USER-03 — Get user by valid id
- **Priority:** Medium · **Type:** Functional · **Endpoint:** `GET /api/user/:id`
- **Expected result:** `200`, returns the matching user object.

### TC-USER-04 — Get user invalid ObjectId
- **Priority:** Medium · **Type:** Negative
- **Steps:** `GET /api/user/123`.
- **Expected result:** `400`, `"Invalid user ID"`.

### TC-USER-05 — Get user not found
- **Priority:** Medium · **Type:** Negative
- **Steps:** GET with a well-formed but non-existent ObjectId.
- **Expected result:** `404`, `"User not found"`.

### TC-USER-06 — Get user by id leaks password hash
- **Priority:** Critical · **Type:** Security
- **Expected result (standard):** Response excludes `password`. **[DEFECT-WATCH]** `getUserById` returns the raw document including the hash, and the route has **no authentication** — anyone can enumerate users and read hashes. Expected to FAIL; recommend auth + `.select("-password")`.

### TC-USER-07 — Update own profile
- **Priority:** High · **Type:** Functional · **Endpoint:** `PATCH /api/user/:id`
- **Preconditions:** Logged in; `:id` == own id.
- **Steps:** PATCH with `{ "fullname": "New Name", "password": "NewPassw0rd" }`.
- **Expected result:** `200`, `data.user` reflects new fullname.

### TC-USER-08 — Update profile with avatar upload
- **Priority:** Medium · **Type:** Functional
- **Steps:** PATCH multipart with `avatar` file + fullname + password.
- **Expected result:** `200`; `avatar` set to stored file path. (With no file, `avatar` becomes `null` — confirm this is acceptable; updating text fields wipes an existing avatar.) **[DEFECT-WATCH]** note the avatar reset on text-only updates.

### TC-USER-09 — Update another user's profile (forbidden)
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As user A, PATCH `/api/user/<userB id>`.
- **Expected result:** `403`, `"You are not authorized to update this user"`.

### TC-USER-10 — Update profile without auth
- **Priority:** High · **Type:** Authorization
- **Steps:** PATCH `/api/user/:id` with no `jwt` cookie.
- **Expected result:** `401`, `"Token is required!"`.

### TC-USER-11 — Update profile missing fullname/password
- **Priority:** Medium · **Type:** Negative
- **Steps:** PATCH self with only `fullname`.
- **Expected result:** `400` (schema requires both; controller also checks). Validation triggers before controller.

### TC-USER-12 — Update password is re-hashed
- **Priority:** High · **Type:** Security
- **Steps:** Update own password, then sign in with the new password.
- **Expected result:** New sign-in succeeds; stored password is a new bcrypt hash (pre-save hook runs on `user.save()`).

### TC-USER-13 — Admin deletes a user
- **Priority:** High · **Type:** Functional · **Endpoint:** `DELETE /api/user/:id`
- **Steps:** As admin, delete an existing user.
- **Expected result:** `200`, `"User deleted successfully"`; user removed.

### TC-USER-14 — Non-admin cannot delete a user
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As `user`/`seller`, DELETE another user.
- **Expected result:** `401`, `"User is not authorized!"` (blocked by `allowedTo("admin")`).

### TC-USER-15 — Self-delete as non-admin blocked by route
- **Priority:** High · **Type:** Authorization
- **Steps:** As a non-admin, attempt to delete own account.
- **Expected result:** `401` — although the controller would allow self-delete, the route gate `allowedTo("admin")` blocks first. **[DEFECT-WATCH]** Self-service account deletion is effectively impossible for non-admins; confirm whether intended.

### TC-USER-16 — Delete user not found
- **Priority:** Low · **Type:** Negative
- **Steps:** As admin, DELETE a non-existent valid ObjectId.
- **Expected result:** `404`, `"User not found"`.

### TC-USER-17 — Admin changes a user's role
- **Priority:** High · **Type:** Functional · **Endpoint:** `PATCH /api/user/:id/role`
- **Steps:** As admin, PATCH `{ "role": "seller" }`.
- **Expected result:** `200`; user role updated to `seller`.

### TC-USER-18 — Change role invalid value
- **Priority:** Medium · **Type:** Negative
- **Steps:** As admin, PATCH `{ "role": "superadmin" }`.
- **Expected result:** `400`, `"Invalid role type"` (allowed: user/seller/admin).

### TC-USER-19 — Non-admin cannot change roles
- **Priority:** Critical · **Type:** Authorization
- **Steps:** As `user`, PATCH `/api/user/:id/role`.
- **Expected result:** `401`, `"User is not authorized!"`.

### TC-USER-20 — Change role invalid ObjectId
- **Priority:** Low · **Type:** Negative
- **Steps:** As admin, PATCH `/api/user/abc/role`.
- **Expected result:** `400`, `"Invalid user ID"`.
