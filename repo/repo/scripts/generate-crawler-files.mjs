import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const publicDir = resolve(projectRoot, 'public');

async function loadEnvFile(filename) {
  try {
    const content = await readFile(resolve(projectRoot, filename), 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator === -1) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Environment files are optional in CI; process.env remains the source of truth.
  }
}

await loadEnvFile('.env');
await loadEnvFile('.env.local');
await loadEnvFile('.env.production');

const siteUrl = (process.env.VITE_SITE_URL || 'https://papodetailer.com.br').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/marcas', priority: '0.8', changefreq: 'weekly' },
  { path: '/novidades', priority: '0.8', changefreq: 'daily' },
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchPublicSlugs(table) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=slug,created_at&order=created_at.desc`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${table}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function toSitemapEntry({ path, priority, changefreq, lastmod }) {
  const fields = [
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
  ].filter(Boolean);

  return `  <url>\n${fields.join('\n')}\n  </url>`;
}

let dynamicRoutes = [];

try {
  const [categories, brands, products] = await Promise.all([
    fetchPublicSlugs('categories'),
    fetchPublicSlugs('brands'),
    fetchPublicSlugs('products'),
  ]);

  dynamicRoutes = [
    ...categories.map((item) => ({ path: `/categoria/${item.slug}`, priority: '0.8', changefreq: 'weekly', lastmod: item.created_at })),
    ...brands.map((item) => ({ path: `/marca/${item.slug}`, priority: '0.7', changefreq: 'weekly', lastmod: item.created_at })),
    ...products.map((item) => ({ path: `/produto/${item.slug}`, priority: '0.9', changefreq: 'weekly', lastmod: item.created_at })),
  ];
} catch (error) {
  console.warn(`[crawler] Dynamic URLs were skipped: ${error instanceof Error ? error.message : String(error)}`);
}

const routes = [...staticRoutes, ...dynamicRoutes];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(toSitemapEntry),
  '</urlset>',
  '',
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /busca',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n');

await mkdir(publicDir, { recursive: true });
await Promise.all([
  writeFile(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(resolve(publicDir, 'robots.txt'), robots, 'utf8'),
]);

console.log(`[crawler] Generated robots.txt and sitemap.xml with ${routes.length} URLs.`);
