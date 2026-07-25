import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from '#imports';
import { useDatasStore } from '~/stores/datas';

/**
 * Per page SEO tags (title, description, canonical, opengraph, twitter).
 *
 * Usage, in a page <script setup>, after the fetchDatas() calls:
 *
 *   useSeo({
 *     title: 'About',
 *     description: datasAbout.attributes.description, // html from strapi is cleaned up
 *     image: datasAbout.attributes.cover,             // strapi media object, or a url
 *   })
 *
 * Everything is optional, the site wide fallbacks (strapi `seo` single type, then
 * the description written in nuxt.config.js) are used for whatever is missing.
 *
 * The site name is appended to the title unless it is already part of it.
 */

const SITE_NAME = 'Renaud Collet';

// Same wording as the fallback in nuxt.config.js, used when strapi has nothing.
const DEFAULT_DESCRIPTION = "Freelance créatif développeur frontend qui programme et anime des sites internets ou des DOOH en utilisant nuxtjs, vuejs, threejs, gsap, phaserjs et laravel pour le backend et l'api";

const DESCRIPTION_MAX_LENGTH = 160;

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

/**
 * Strapi rich text fields hold html, meta tags need plain text.
 */
export const stripHtml = (value) => {
  if (!value) return '';

  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Cut on a word boundary, google truncates around 160 characters anyway.
 */
export const truncate = (value, max = DESCRIPTION_MAX_LENGTH) => {
  const text = String(value || '');
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}...`;
};

const toAbsoluteUrl = (value, base) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  return `${withoutTrailingSlash(base)}/${String(value).replace(/^\/+/, '')}`;
};

/**
 * Accepts a strapi media relation (`{ data: { attributes } }`), a media
 * `attributes` object, or a plain url, and returns an absolute url.
 * Prefers a format wide enough for opengraph (1200px), falls back to the original.
 */
export const seoImageUrl = (media, backendUrl) => {
  if (!media) return '';
  if (typeof media === 'string') return toAbsoluteUrl(media, backendUrl);

  const attributes = media.data ? media.data.attributes : media;
  if (!attributes) return '';

  const formats = attributes.formats || {};
  const best = formats.xlarge || formats.large || attributes;

  return toAbsoluteUrl(best.url, backendUrl);
};

export default function useSeo(options = {}) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const storeDatas = useDatasStore();

  const appUrl = withoutTrailingSlash(config.public.appUrl);
  const backendUrl = withoutTrailingSlash(config.public.backendUrl);

  // Site wide defaults, fetched once by the default layout.
  const globalSeo = storeDatas.seo && storeDatas.seo.data ? storeDatas.seo.data.attributes : null;

  const pageTitle = stripHtml(options.title);
  const title = !pageTitle
    ? `${SITE_NAME} - Développeur Frontend Freelance`
    : pageTitle.includes(SITE_NAME)
      ? pageTitle
      : `${pageTitle} - ${SITE_NAME}`;

  const description = truncate(
    stripHtml(options.description) || stripHtml(globalSeo && globalSeo.description) || DEFAULT_DESCRIPTION
  );

  const image =
    seoImageUrl(options.image, backendUrl) ||
    seoImageUrl(globalSeo && globalSeo.ogImage, backendUrl) ||
    `${appUrl}/opengraph.png`;

  // route.path has no trailing slash except on the home page, which is what we want.
  const url = `${appUrl}${route.path}`;

  useSeoMeta({
    title,
    description,

    ogTitle: title,
    ogDescription: description,
    ogType: options.type || 'website',
    ogUrl: url,
    ogSiteName: SITE_NAME,
    ogImage: image,
    ogImageAlt: options.imageAlt || title,
    ogLocale: 'fr_FR',

    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: options.imageAlt || title,

    // Left undefined on purpose otherwise, so the global robots tag set in
    // nuxt.config.js (NUXT_PREPROD_APP) keeps applying.
    robots: options.noindex ? 'noindex, follow' : undefined,
  });

  useHead({
    link: [{ rel: 'canonical', href: url }],
  });

  return { title, description, image, url };
}
