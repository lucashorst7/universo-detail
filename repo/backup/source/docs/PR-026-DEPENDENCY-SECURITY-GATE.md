# PR-026 — Dependency Security Gate

## Objective

Eliminate the known dependency advisories reported after PR-025 and prevent high or critical vulnerabilities from returning unnoticed.

## Changes

- Upgraded Vite, Vitest, V8 coverage integration, and the React plugin to compatible patched major versions.
- Added explicit Node.js and npm engine requirements.
- Added `npm run audit:security` using `npm audit --audit-level=high`.
- Included the audit in the local aggregate quality gate and GitHub Actions.
- Pinned the CI runtime to Node.js 20.19.0, the minimum supported baseline for the upgraded toolchain.
- Added weekly Dependabot updates grouped by production and development dependencies.
- Added a project security policy with reporting and credential-handling guidance.

## Validation

```bash
npm ci
npm run audit:security
npm run check
```

The resulting lockfile reports zero known npm vulnerabilities at the time of this PR.
