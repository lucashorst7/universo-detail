import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const distDir = join(root, 'dist');
const assetsDir = join(distDir, 'assets');
const budgetPath = join(root, 'performance-budget.json');

if (!existsSync(assetsDir)) {
  console.error('[performance] dist/assets was not found. Run npm run build first.');
  process.exit(1);
}

if (!existsSync(budgetPath)) {
  console.error('[performance] performance-budget.json was not found.');
  process.exit(1);
}

const budgets = JSON.parse(readFileSync(budgetPath, 'utf8'));
const toKb = (bytes) => bytes / 1024;
const formatKb = (bytes) => `${toKb(bytes).toFixed(2)} kB`;
const files = readdirSync(assetsDir)
  .map((name) => {
    const path = join(assetsDir, name);
    const contents = readFileSync(path);
    return {
      name,
      path,
      extension: extname(name),
      rawBytes: statSync(path).size,
      gzipBytes: gzipSync(contents, { level: 9 }).length,
    };
  })
  .filter(({ extension }) => extension === '.js' || extension === '.css');

const javascript = files.filter(({ extension }) => extension === '.js');
const stylesheets = files.filter(({ extension }) => extension === '.css');
const findChunk = (prefix) => javascript.find(({ name }) => name.startsWith(`${prefix}-`));
const entry = javascript.find(({ name }) => /^index-[\w-]+\.js$/.test(name));
const reactVendor = findChunk('react');
const supabaseVendor = findChunk('supabase');
const excludedLazyNames = new Set(
  [entry, reactVendor, supabaseVendor]
    .filter(Boolean)
    .map(({ name }) => name),
);
const lazyChunks = javascript.filter(({ name }) => !excludedLazyNames.has(name));
const largestLazyChunk = lazyChunks.reduce(
  (largest, chunk) => (!largest || chunk.gzipBytes > largest.gzipBytes ? chunk : largest),
  null,
);
const totalJavaScriptGzipBytes = javascript.reduce((total, file) => total + file.gzipBytes, 0);
const totalAssetsGzipBytes = files.reduce((total, file) => total + file.gzipBytes, 0);
const totalStylesheetGzipBytes = stylesheets.reduce((total, file) => total + file.gzipBytes, 0);

const checks = [];
const addCheck = (label, actualBytes, budgetKb, detail = '') => {
  checks.push({
    label,
    actualBytes,
    budgetBytes: budgetKb * 1024,
    detail,
    passed: actualBytes <= budgetKb * 1024,
  });
};

if (!entry || !reactVendor || !supabaseVendor || !largestLazyChunk) {
  const missing = [
    !entry && 'entry chunk',
    !reactVendor && 'react vendor chunk',
    !supabaseVendor && 'supabase vendor chunk',
    !largestLazyChunk && 'lazy chunks',
  ].filter(Boolean);
  console.error(`[performance] Expected build chunks were not found: ${missing.join(', ')}.`);
  process.exit(1);
}

addCheck('Entry JavaScript', entry.gzipBytes, budgets.entryJavaScriptGzipKb, basename(entry.path));
addCheck('Stylesheets', totalStylesheetGzipBytes, budgets.stylesheetGzipKb);
addCheck('React vendor', reactVendor.gzipBytes, budgets.reactVendorGzipKb, reactVendor.name);
addCheck('Supabase vendor', supabaseVendor.gzipBytes, budgets.supabaseVendorGzipKb, supabaseVendor.name);
addCheck('Largest lazy chunk', largestLazyChunk.gzipBytes, budgets.lazyChunkGzipKb, largestLazyChunk.name);
addCheck('Total JavaScript', totalJavaScriptGzipBytes, budgets.totalJavaScriptGzipKb);
addCheck('Total assets', totalAssetsGzipBytes, budgets.totalAssetsGzipKb);

console.log('\nPerformance budget (gzip)');
console.log('-------------------------');
for (const check of checks) {
  const status = check.passed ? 'PASS' : 'FAIL';
  const detail = check.detail ? ` (${check.detail})` : '';
  console.log(`${status.padEnd(4)} ${check.label.padEnd(22)} ${formatKb(check.actualBytes).padStart(10)} / ${formatKb(check.budgetBytes).padStart(10)}${detail}`);
}

const failures = checks.filter(({ passed }) => !passed);
if (failures.length > 0) {
  console.error(`\n[performance] ${failures.length} budget check(s) failed.`);
  process.exit(1);
}

console.log('\n[performance] All bundle budgets passed.');
