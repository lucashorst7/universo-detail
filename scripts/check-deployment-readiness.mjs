import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

async function loadEnv(filename) {
  try {
    const content = await readFile(resolve(root, filename), 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const index = line.indexOf('=');
      if (index === -1) continue;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Optional local files.
  }
}

await loadEnv('.env');
await loadEnv('.env.local');
await loadEnv('.env.production');

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_SITE_URL'];
for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value) errors.push(`${key} is missing.`);
  else if (/your-project|your-anon-key|example\.com/i.test(value)) errors.push(`${key} still contains a placeholder.`);
}

for (const key of ['VITE_SUPABASE_URL', 'VITE_SITE_URL']) {
  const value = process.env[key]?.trim();
  if (!value) continue;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') errors.push(`${key} must use HTTPS in production.`);
  } catch {
    errors.push(`${key} is not a valid URL.`);
  }
}

// Migrations live in the project root (no supabase/ sub-directory).
const MIGRATION_DIRS = ['supabase/migrations', '.'];
let migrationCount = 0;
let latestMigration = '';
for (const dir of MIGRATION_DIRS) {
  try {
    const files = (await readdir(resolve(root, dir)))
      .filter((name) => /^\d{14}_.*\.sql$/.test(name))
      .sort();
    if (files.length > 0) {
      migrationCount = files.length;
      latestMigration = files.at(-1) ?? '';
      break;
    }
  } catch {
    // Try next candidate
  }
}
if (migrationCount === 0) {
  errors.push('No migration files found. Check supabase/migrations or project root.');
} else {
  const EXPECTED = 19;
  if (migrationCount !== EXPECTED) {
    warnings.push(`Expected ${EXPECTED} migrations, found ${migrationCount}. Confirm the production database is fully migrated.`);
  }
  console.log(`Migrations found: ${migrationCount}`);
  if (latestMigration) console.log(`Latest migration: ${latestMigration}`);
}

try {
  await readFile(resolve(root, 'vercel.json'), 'utf8');
} catch {
  errors.push('vercel.json is missing.');
}

if (warnings.length) {
  console.warn('\nWarnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nDeployment readiness failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nDeployment readiness passed.');
