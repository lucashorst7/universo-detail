# Security Policy

## Supported version

Security fixes are applied to the current `main` branch. Older ZIP exports and historical PR packages are immutable snapshots and are not maintained.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, tokens, personal data, or production URLs. Report the issue privately to the project owner and include:

- affected route, component, migration, or dependency;
- reproduction steps;
- expected and observed behavior;
- impact assessment;
- suggested mitigation, when available.

Revoke any exposed credential immediately. Supabase service-role keys must never be stored in the frontend, committed to the repository, or included in screenshots and logs.

## Dependency policy

The repository uses the lockfile as the reproducible dependency baseline. Every pull request must pass:

```bash
npm ci
npm run audit:security
npm run check
```

The security gate blocks high and critical advisories. Dependabot checks npm dependencies weekly and groups compatible updates to reduce maintenance noise.
