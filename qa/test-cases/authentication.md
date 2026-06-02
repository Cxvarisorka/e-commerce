# Test Cases — Authentication

> Related code: `server/routers/auth.router.js`, `server/controllers/auth.controller.js`,
> `server/validations/auth.validation.js`, `server/middlewares/protect.middleware.js`,
> `server/models/user.model.js`
> Rate limit: `authLimiter` = 10 **failed** attempts / 15 min per IP.

**Validation rules (registerSchema, `.strict()`):** `fullname` 3–30 chars,
`email` valid email, `password` 8–50 chars. Extra keys are rejected.
**loginSchema (`.strict()`):** `email`, `password` (8–50).

## Summary

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-AUTH-01 | Sign up with valid data | Critical | Functional | Passed |
| TC-AUTH-02 | Sign up sends verification email | High | Functional | Passed |
| TC-AUTH-03 | Sign up with duplicate email | High | Negative | Passed |
| TC-AUTH-04 | Sign up short fullname (<3) | Medium | Boundary | Passed |
| TC-AUTH-05 | Sign up long fullname (>30) | Medium | Boundary | Passed |
| TC-AUTH-06 | Sign up invalid email | Medium | Negative | Passed |
| TC-AUTH-07 | Sign up short password (<8) | High | Boundary | Passed |
| TC-AUTH-08 | Sign up with extra `role` field | High | Security | Passed |
| TC-AUTH-09 | Sign up missing required fields | Medium | Negative | Passed |
| TC-AUTH-10 | Sign in with valid verified account | Critical | Functional | Passed |
| TC-AUTH-11 | Sign in sets httpOnly jwt cookie | Critical | Security | Passed |
| TC-AUTH-12 | Sign in wrong password | High | Negative | Passed |
| TC-AUTH-13 | Sign in unknown email | High | Negative | Passed |
| TC-AUTH-14 | Sign in unverified account | High | Functional | Passed |
| TC-AUTH-15 | Password never returned in response | Critical | Security | Passed |
| TC-AUTH-16 | GET /me with valid cookie | High | Functional | Passed |
| TC-AUTH-17 | GET /me without token | High | Authorization | Passed |
| TC-AUTH-18 | GET /me with tampered/invalid token | High | Security | Passed |
| TC-AUTH-19 | Sign out clears cookie | Medium | Functional | Passed |
| TC-AUTH-20 | Verify email with valid token | Critical | Functional | Passed |
| TC-AUTH-21 | Verify email already verified | Medium | Negative | Passed |
| TC-AUTH-22 | Verify email invalid token | High | Security | Passed |
| TC-AUTH-23 | authLimiter blocks brute force | High | Security | Passed |

---

### TC-AUTH-01 — Sign up with valid data
- **Priority:** Critical · **Type:** Functional
- **Endpoint:** `POST /api/auth/signup`
- **Preconditions:** Email not already registered.
- **Steps:**
  1. POST with `{ "fullname": "John Doe", "email": "john@test.com", "password": "Passw0rd!" }`.
- **Expected result:** `201 Created`, body `{ status: "success", message: "Account created succesfully!" }`. User row created with `isVerified=false`, `role="user"`, password stored hashed (bcrypt).

### TC-AUTH-02 — Sign up sends verification email
- **Priority:** High · **Type:** Functional
- **Steps:** Complete TC-AUTH-01; inspect mail sink/inbox.
- **Expected result:** Verification email received containing link `…/api/auth/verify-email?token=<jwt>`.

### TC-AUTH-03 — Sign up with duplicate email
- **Priority:** High · **Type:** Negative
- **Preconditions:** `john@test.com` already exists.
- **Steps:** POST signup with the same email.
- **Expected result:** Request rejected (Mongo unique index on `email`). Expect `400` with a clear message; **must not** create a second user. **[DEFECT-WATCH]** Duplicate-key error is not explicitly caught in `signup`; verify it returns a clean 400, not a 500 / raw Mongo error.

### TC-AUTH-04 — Sign up short fullname (<3)
- **Priority:** Medium · **Type:** Boundary
- **Steps:** POST with `fullname: "Jo"`.
- **Expected result:** `400`, validation error on `fullname` (min 3).

### TC-AUTH-05 — Sign up long fullname (>30)
- **Priority:** Medium · **Type:** Boundary
- **Steps:** POST with a 31-char `fullname`.
- **Expected result:** `400`, validation error (max 30).

### TC-AUTH-06 — Sign up invalid email
- **Priority:** Medium · **Type:** Negative
- **Steps:** POST with `email: "not-an-email"`.
- **Expected result:** `400`, email validation error.

### TC-AUTH-07 — Sign up short password (<8)
- **Priority:** High · **Type:** Boundary
- **Steps:** POST with `password: "1234567"` (7 chars).
- **Expected result:** `400`, password min-length error. Also verify exactly 8 chars passes.

### TC-AUTH-08 — Sign up with extra `role` field
- **Priority:** High · **Type:** Security
- **Rationale:** Prevent privilege escalation via self-assigned role.
- **Steps:** POST signup with `{ fullname, email, password, "role": "admin" }`.
- **Expected result:** `400` — `registerSchema` is `.strict()`, so the extra `role` key is rejected. Confirms a user cannot register directly as admin. (Even if schema changed, account must default to `role:"user"`.)

### TC-AUTH-09 — Sign up missing required fields
- **Priority:** Medium · **Type:** Negative
- **Steps:** POST with body missing `password`.
- **Expected result:** `400`, validation error listing missing field.

### TC-AUTH-10 — Sign in with valid verified account
- **Priority:** Critical · **Type:** Functional
- **Endpoint:** `POST /api/auth/signin`
- **Preconditions:** Account exists and `isVerified=true`.
- **Steps:** POST `{ email, password }` with correct credentials.
- **Expected result:** `200`, body `{ status:"success", message:"Succesfully logged in!", data.user }`; `Set-Cookie: jwt=…`.

### TC-AUTH-11 — Sign in sets httpOnly jwt cookie
- **Priority:** Critical · **Type:** Security
- **Steps:** Inspect `Set-Cookie` after TC-AUTH-10.
- **Expected result:** Cookie `jwt` is `HttpOnly`; `SameSite=Strict` and `Secure` when `NODE_ENV != dev` (`Lax`/non-secure in dev); `maxAge` per `COOKIE_EXPIRES` days.

### TC-AUTH-12 — Sign in wrong password
- **Priority:** High · **Type:** Negative
- **Steps:** POST correct email + wrong password.
- **Expected result:** `400`, message `"Credentials is incorrect!"`. No cookie set. (Message must not reveal whether email exists.)

### TC-AUTH-13 — Sign in unknown email
- **Priority:** High · **Type:** Negative
- **Steps:** POST with an unregistered email.
- **Expected result:** `400`, `"Credentials is incorrect!"` (same as wrong password — no user enumeration).

### TC-AUTH-14 — Sign in unverified account
- **Priority:** High · **Type:** Functional
- **Preconditions:** Account exists, `isVerified=false`.
- **Steps:** POST correct credentials.
- **Expected result:** `400`, `"Verify your email first!"`. No cookie set.

### TC-AUTH-15 — Password never returned in response
- **Priority:** Critical · **Type:** Security
- **Steps:** Inspect `data.user` in TC-AUTH-10 response.
- **Expected result:** `password` field absent (`user.password = undefined` before send).

### TC-AUTH-16 — GET /me with valid cookie
- **Priority:** High · **Type:** Functional
- **Endpoint:** `GET /api/auth/me` (protected)
- **Steps:** Authenticated request with `jwt` cookie.
- **Expected result:** `200`, returns current `data.user` without password.

### TC-AUTH-17 — GET /me without token
- **Priority:** High · **Type:** Authorization
- **Steps:** GET `/api/auth/me` with no cookie.
- **Expected result:** `401`, `"Token is required!"`.

### TC-AUTH-18 — GET /me with tampered/invalid token
- **Priority:** High · **Type:** Security
- **Steps:** Send a `jwt` cookie with a malformed/expired/wrong-signature token.
- **Expected result:** Rejected — expired/invalid signature → JWT error surfaced as 4xx (not 200). If token verifies but user no longer exists → `400 "Token is invalid!"`. Verify no stack trace leaks.

### TC-AUTH-19 — Sign out clears cookie
- **Priority:** Medium · **Type:** Functional
- **Endpoint:** `POST /api/auth/signout`
- **Steps:** Call signout while logged in.
- **Expected result:** `200`, `"Succesfully signout!"`; response clears `jwt` cookie; subsequent `/me` returns 401.

### TC-AUTH-20 — Verify email with valid token
- **Priority:** Critical · **Type:** Functional
- **Endpoint:** `GET /api/auth/verify-email?token=<jwt>`
- **Preconditions:** Fresh signup token for an unverified user.
- **Steps:** Open the verification link.
- **Expected result:** `200`, HTML "Email successfully verified…"; user `isVerified` flips to `true`; user can now sign in.

### TC-AUTH-21 — Verify email already verified
- **Priority:** Medium · **Type:** Negative
- **Steps:** Reuse a valid token for an already-verified user.
- **Expected result:** `400`, `"User email is already verified!"`.

### TC-AUTH-22 — Verify email invalid token
- **Priority:** High · **Type:** Security
- **Steps:** Call with `token=garbage` / expired token.
- **Expected result:** Rejected with 4xx; no user state change; no internal error leak.

### TC-AUTH-23 — authLimiter blocks brute force
- **Priority:** High · **Type:** Security
- **Steps:** Submit 11 failed `/signin` attempts from one IP within 15 min.
- **Expected result:** After 10 failures, further attempts return `429 Too Many Requests`. Successful logins are **not** counted toward the limit (limiter counts failures only).
