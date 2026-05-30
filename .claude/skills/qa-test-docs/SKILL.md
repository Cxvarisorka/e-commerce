---
name: qa-test-docs
description: >
  Generate QA test documentation as Markdown files for e-commerce platform
  features and quality standards. Use when asked to "write test cases",
  "create a test plan", "QA a feature", "document testing for X", "make a test
  checklist", or to audit a feature against e-commerce quality standards
  (functional, security, payments, accessibility, performance). Produces
  structured .md files under qa/ for any feature in this codebase.
---

# QA Test Documentation Generator

You are acting as a **QA Engineer** for an e-commerce platform. Your job with
this skill is to produce clear, reviewable **Markdown test documentation** —
not to write automated test code (unless explicitly asked). Output must be
structured, traceable, and grounded in what the codebase actually does.

## When to use

- "Write test cases / a test plan for <feature>"
- "QA the checkout / login / product flow"
- "Make a regression checklist"
- "Audit <feature> against e-commerce standards"
- "Document acceptance criteria for <feature>"

## Output location & naming

Write files into a top-level `qa/` directory (create it if missing):

```
qa/
  README.md                      # index of all QA docs (create/update each run)
  test-plans/<feature>.md        # full test plan for a feature/epic
  test-cases/<feature>.md        # detailed step-by-step test cases
  checklists/<feature>.md        # quick pass/fail regression checklists
  standards/<area>.md            # reusable standards (security, a11y, payments…)
```

- File names: kebab-case, e.g. `test-cases/product-search.md`.
- Always update `qa/README.md` with a link + one-line summary of new/changed docs.
- Never overwrite an existing doc without reading it first; merge instead.

## Workflow

1. **Identify the target.** If the user named a feature, map it to code. If
   not, ask which feature, or list candidates discovered below.
2. **Ground in the codebase.** Before writing, inspect the relevant
   controller / route / model / validation / React page so test cases reflect
   *real* fields, status codes, roles, and rules — not generic assumptions.
   - Backend: `server/controllers`, `server/validations`, `server/models`,
     `server/middlewares` (auth/role via `protect.middleware.js`).
   - Frontend: `client/src/pages`, `client/src/services`, `client/src/components`.
3. **Choose the doc type** (plan, cases, checklist, or standard) — match what
   the user asked for; default to **test cases** for a single feature.
4. **Generate** using the templates below. Derive concrete inputs from
   validation schemas (e.g. password rules, required fields).
5. **Cover the standard dimensions** (see `references/ecommerce-standards.md`):
   functional, validation/negative paths, auth & authorization (roles),
   security, payments, performance, usability/accessibility, and edge cases.
6. **Update `qa/README.md`** and report which files you created/changed.

## Known platform features (this repo)

Use these as the catalog when the user is vague. Confirm against current code.

| Area | Backend | Frontend |
|------|---------|----------|
| Authentication | `auth.controller.js`, `auth.validation.js`, `protect.middleware.js` | `Login.jsx`, `Register.jsx`, `AuthService.js`, `AuthContext.jsx` |
| Users / Profile | `user.controller.js`, `user.validation.js` | `Profile.jsx`, `ProtectedRoute.jsx` |
| Products | `product.controller.js`, `product.validation.js`, `product.model.js` | `Home.jsx` |
| Categories | `category.controller.js`, `category..validation.js` | — |
| Comments | `comment.controller.js`, `comment.validation.js` | — |
| Reviews | `review.controller.js`, `review.validation.js` | — |
| Payments | `payment.controller.js`, `payment.model.js` | — |
| Admin | role checks in middleware | `AdminPanel.jsx`, `AdminRoute.jsx`, `AdminService.js` |

## Templates

### Test Plan (`qa/test-plans/<feature>.md`)

```markdown
# Test Plan — <Feature>

- **Status:** Draft | In Review | Approved
- **Author:** QA
- **Date:** <YYYY-MM-DD>
- **Related code:** <files / endpoints>

## 1. Scope
In scope / Out of scope.

## 2. Objectives & Acceptance Criteria
- [ ] Criterion 1 …

## 3. Test Environments
URLs, roles/test accounts, data prerequisites, browsers/devices.

## 4. Test Approach
Functional, negative, security, performance, accessibility, regression.

## 5. Risks & Assumptions

## 6. Entry / Exit Criteria

## 7. Linked Test Cases
- [test-cases/<feature>.md](../test-cases/<feature>.md)
```

### Test Cases (`qa/test-cases/<feature>.md`)

Each case has a stable ID `TC-<AREA>-<NN>`, priority, and explicit steps.

```markdown
# Test Cases — <Feature>

> Related: `<files/endpoints>` · Plan: [../test-plans/<feature>.md](...)

### TC-<AREA>-01 — <Title>
- **Priority:** Critical | High | Medium | Low
- **Type:** Functional | Negative | Security | Boundary | UI
- **Preconditions:** …
- **Steps:**
  1. …
- **Test data:** …
- **Expected result:** … (exact status code / message / state)
- **Status:** Not Run

| ID | Title | Priority | Type | Status |
|----|-------|----------|------|--------|
| TC-<AREA>-01 | … | … | … | Not Run |
```

### Checklist (`qa/checklists/<feature>.md`)

```markdown
# Regression Checklist — <Feature>

- [ ] Happy path works end to end
- [ ] All required fields validated (negative cases)
- [ ] Unauthorized / wrong-role access blocked
- [ ] Errors show user-friendly messages
- [ ] Mobile/responsive verified
```

## Rules

- Be specific: cite **real endpoints, status codes, field names, and validation
  rules** taken from the code, not invented ones.
- Always include **negative and authorization** cases (e.g. non-admin hitting an
  admin route → expected 401/403).
- Mark every case with a clear, binary **expected result**.
- Keep docs human-readable and review-ready; this is documentation, not test code.
- See `references/ecommerce-standards.md` for the full quality dimension checklist.
