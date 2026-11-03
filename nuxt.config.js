// https://nuxt.com/docs/api/configuration/nuxt-config
// https://nuxt.com/docs/migration

/**
 * If esbuild issues are encountered on Ionos, please use the following workaround:
 * https://github.com/evanw/esbuild/issues/1711
 */

import glsl from 'vite-plugin-glsl';
import { cpSync, existsSync, lstatSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Nitro stores the packages bundled in several versions (hookable, @vue/devtools-api) in
// .output/server/node_modules/.nitro and links them into place. On Windows the links are junctions
// to absolute D:/ paths, which do not survive the upload to Ionos ("Cannot find package
// 'hookable'"): replace every link with a real copy so that .output is self-contained.
function dereferenceLinks(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      const target = realpathSync(path);
      rmSync(path, { recursive: true, force: true });
      cpSync(target, path, { recursive: true, dereference: true });
    } else if (stat.isDirectory()) {
      dereferenceLinks(path);
    }
  }
}

export default defineNuxtConfig({
  telemetry: false, // For nuxt team (anonyous statistics)

  ssr: true,

  vite: {
    assetsInclude: ["**/*.glb"],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *; @import "@/assets/styles/bootstrap"; @import "@/assets/styles/mixins";',
        },
      },
    },
    esbuild: {
      drop: ["console"],
    },

    plugins: [
      glsl({
        warnDuplicatedImports: false,
        compress: true,
      }),
    ],
  },

  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_APP_URL,
      backendUrl: process.env.NUXT_APP_BACKEND_URL,
      apiUrl: process.env.NUXT_API_URL,
    }
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  app: {
    head: {
      title: 'Renaud Collet - Développeur fullstack freelance à Paris',
      htmlAttrs: {
        lang: 'fr',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Renaud Collet, développeur créatif fullstack freelance à Paris : Vue.js, Nuxt, TypeScript, Node.js, Three.js et WebAR. Sites et expériences interactives.' }, // Set with code
        { name: 'theme-color', content: '#000000' },
        { name: 'robots', content: process.env.NUXT_PREPROD_APP ? 'none' : 'all' },
        // { name: 'msapplication-TileColor', content: '#da532c' },
        // { name: 'msapplication-TileImage', content: 'images/tileimage.jpg' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { property: 'og:url', content: 'https://renaudcollet.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Renaud Collet - Développeur fullstack freelance à Paris' },
        { property: 'og:description', content: 'Renaud Collet, développeur créatif fullstack freelance à Paris : Vue.js, Nuxt, TypeScript, Node.js, Three.js et WebAR. Sites et expériences interactives.' }, // Set with code
        { property: 'og:image', content: "https://renaudcollet.com/opengraph.png" }, // Set with code
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  // Every page is rendered from strapi content, which changes rarely: the html is cached on the
  // server for an hour and refreshed in the background (stale-while-revalidate), so visitors and
  // crawlers don't wait for the strapi requests. A change in the admin shows up within the hour.
  // Production only: in dev, nitro would serve stale pages from .nuxt/cache after a code change.
  $production: {
    routeRules: {
      '/**': { swr: 3600 },
    },
  },

  nitro: {
    hooks: {
      compiled(nitro) {
        const modules = join(nitro.options.output.serverDir, 'node_modules');
        if (!existsSync(modules)) return;
        dereferenceLinks(modules);
        rmSync(join(modules, '.nitro'), { recursive: true, force: true });
      },
    },
  },

  gtag: {
    id: process.env.NUXT_GTAG_ID // can alos be set in .env https://github.com/johannschopplich/nuxt-gtag#runtime-config
  },

  // css
  css: [/* '~/assets/styles/vendor.scss',  */'~/assets/styles/main.scss'],

  // plugins
  plugins: [],

  modules: [
    '@pinia/nuxt',
    'nuxt-gtag',
  ],

  build: {
    postcss: {
      // Add plugin names as key and arguments as value
      // Install them before as dependencies with npm or yarn
      plugins: {
        // Disable a plugin by passing false as value
        'postcss-nested': {},
        // 'postcss-responsive-type': {},
        // 'postcss-hexrgba': {},
        'cssnano': {},
      },
      preset: {
        // Change the postcss-preset-env settings
        autoprefixer: {
          grid: true
        }
      }
    },
  }
});
