/**
 * Served at /robots.txt
 *
 * Generated instead of being a static file in public/ so the preprod deployment
 * (NUXT_PREPROD_APP set in .env) blocks crawlers, the same way the global robots
 * meta tag in nuxt.config.js does.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const appUrl = String(config.public.appUrl || '').replace(/\/+$/, '');

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');

  if (process.env.NUXT_PREPROD_APP) {
    return ['User-agent: *', 'Disallow: /', ''].join('\n');
  }

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${appUrl}/sitemap.xml`,
    '',
  ].join('\n');
});
