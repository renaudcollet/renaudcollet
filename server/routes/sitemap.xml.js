/**
 * Served at /sitemap.xml
 *
 * Static pages plus one entry per project, slugs are read from strapi at request
 * time so a project published in the admin shows up without a rebuild.
 *
 * /legal is left out on purpose, it is tagged noindex in pages/legal.vue.
 */

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/works', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'yearly', priority: '0.5' },
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toUrlNode = ({ loc, lastmod, changefreq, priority }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appUrl = String(config.public.appUrl || '').replace(/\/+$/, '');

  let projects = [];

  try {
    const response = await $fetch(`${config.public.apiUrl}/projets`, {
      query: {
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'sort[0]': 'Date:desc',
        'pagination[pageSize]': 100,
        'pagination[withCount]': 'false',
      },
    });

    projects = (response && response.data) || [];
  } catch (error) {
    // A strapi outage should not return a 500 for the whole sitemap,
    // the static pages are still worth serving.
    console.error('[sitemap] could not fetch projects from strapi:', error && error.message);
  }

  const urls = [
    ...STATIC_ROUTES.map((route) => ({
      loc: `${appUrl}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...projects
      .filter((project) => project.attributes && project.attributes.slug)
      .map((project) => ({
        loc: `${appUrl}/works/${project.attributes.slug}`,
        lastmod: project.attributes.updatedAt
          ? String(project.attributes.updatedAt).slice(0, 10)
          : null,
        changefreq: 'monthly',
        priority: '0.8',
      })),
  ];

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(toUrlNode),
    '</urlset>',
    '',
  ].join('\n');
});
