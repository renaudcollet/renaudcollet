// https://nuxt.com/docs/api/configuration/nuxt-config
// https://nuxt.com/docs/migration

/**
 * If esbuild issues are encountered on Ionos, please use the following workaround:
 * https://github.com/evanw/esbuild/issues/1711
 */

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
      title: 'Renaud COLLET - Frontend development',
      htmlAttrs: {
        lang: 'fr',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // { hid: 'description', name: 'description', content: "Groupie Paris est un studio de création et de production de contenus" }, // Set with code
        { name: 'theme-color', content: '#000000' },
        { name: 'robots', content: process.env.NUXT_PREPROD_APP ? 'none' : 'all' },
        // { name: 'msapplication-TileColor', content: '#da532c' },
        // { name: 'msapplication-TileImage', content: 'images/tileimage.jpg' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { property: 'og:url', content: 'https://renaudcollet.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Renaud COLLET - Développeur Frontend' },
        // { property: 'og:description', content: "Groupie Paris est un studio de création et de production de contenus." }, // Set with code
        // { property: 'og:image', content: "https://groupieparis.com/opengraph.jpg" }, // Set with code
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // { rel: 'apple-touch-icon', sizes: '180x180', type: 'image/x-icon', href: '/apple-touch-icon.png' },
        // { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        // { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        // { rel: 'manifest', href: '/site.webmanifest' },
        // { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' }
      ],
    },
  },

  // gtag: {
  //   id: 'G-8P490KJ1F9' // can alos be set in .env https://github.com/johannschopplich/nuxt-gtag#runtime-config
  // },

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
    }
  }
});
