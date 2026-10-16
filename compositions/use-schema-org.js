import { useHead, useRuntimeConfig } from '#imports';
import { useDatasStore } from '~/stores/datas';

/**
 * JSON-LD structured data (https://schema.org), read by search engines for rich results
 * and the knowledge panel.
 *
 * - useSiteSchema(), in the layout: the site, the person behind it and the freelance service,
 *   on every page so each one is linked to them.
 * - usePageSchema(nodes), in a page: its own nodes (project, breadcrumb...), which point to
 *   the site nodes through their @id.
 */

export const SITE_NAME = 'Renaud Collet';
const JOB_TITLE = 'Développeur fullstack freelance';

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

export const schemaIds = (appUrl) => ({
  website: `${appUrl}/#website`,
  person: `${appUrl}/#person`,
  service: `${appUrl}/#service`,
});

// '+33 (0) 614990589' -> '+33614990589'
const toE164 = (value) => String(value || '').replace(/\(0\)/g, '').replace(/[^\d+]/g, '');

// Keeps a "</script>" in a strapi text from closing the script tag
const toJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const jsonLdScript = (key, nodes) => ({
  key,
  type: 'application/ld+json',
  innerHTML: toJson({ '@context': 'https://schema.org', '@graph': nodes }),
});

export const useSiteSchema = () => {
  const config = useRuntimeConfig();
  const storeDatas = useDatasStore();
  const appUrl = withoutTrailingSlash(config.public.appUrl);
  const ids = schemaIds(appUrl);

  const contact = storeDatas.contact && storeDatas.contact.data ? storeDatas.contact.data.attributes : {};
  const sameAs = [contact.linkedin].filter(Boolean);
  const address = { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' };

  const nodes = [
    {
      '@type': 'WebSite',
      '@id': ids.website,
      url: `${appUrl}/`,
      name: SITE_NAME,
      inLanguage: 'fr-FR',
      publisher: { '@id': ids.person },
    },
    {
      '@type': 'Person',
      '@id': ids.person,
      name: SITE_NAME,
      jobTitle: JOB_TITLE,
      url: `${appUrl}/`,
      image: `${appUrl}/logo_bw.png`,
      email: contact.email ? `mailto:${contact.email}` : undefined,
      address,
      sameAs,
      knowsAbout: ['Développement fullstack', 'Vue.js', 'Nuxt', 'TypeScript', 'Three.js', 'WebGL', 'GSAP', 'WebAR', 'Intelligence artificielle', 'Creative coding', 'DOOH'],
    },
    {
      '@type': 'ProfessionalService',
      '@id': ids.service,
      name: `${SITE_NAME} - ${JOB_TITLE}`,
      url: `${appUrl}/`,
      image: `${appUrl}/opengraph.png`,
      email: contact.email || undefined,
      telephone: toE164(contact.tel) || undefined,
      address,
      areaServed: [
        { '@type': 'City', name: 'Paris' },
        { '@type': 'Country', name: 'France' },
      ],
      founder: { '@id': ids.person },
      sameAs,
    },
  ];

  useHead({ script: [jsonLdScript('ld-site', nodes)] });
};

export const usePageSchema = (nodes) => {
  useHead({ script: [jsonLdScript('ld-page', nodes.filter(Boolean))] });
};

/**
 * Breadcrumb from a list of { name, path }, the home page is added first.
 */
export const breadcrumbNode = (appUrl, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Accueil', path: '/' }, ...items].map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${withoutTrailingSlash(appUrl)}${item.path}`,
  })),
});
