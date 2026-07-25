# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install --shamefully-hoist   # --shamefully-hoist is required (see README)
pnpm dev                          # nuxt dev --host, http://localhost:3000
pnpm build                        # nuxt build -> .output/
pnpm preview                      # preview the production build
```

There is no test suite, no linter and no formatter configured. Do not invent commands for them.

Shaders live in a git submodule: `git submodule update --init` (lygia) must be run before the first build, otherwise GLSL `#include "/lygia/..."` fails.

Versions are deliberately pinned: `nuxt` is `3.7.1` (exact) and `vue` is forced to `3.4` through the `overrides` field. Do not bump them casually, animation/transition behaviour depends on those versions.

## Environment

`.env` (gitignored) drives everything data related:

- `NUXT_API_URL` - Strapi REST API (`https://admin.renaudcollet.com/api`)
- `NUXT_APP_BACKEND_URL` - Strapi origin, prefixed to every media URL returned by the API
- `NUXT_APP_URL` - public site URL
- `NUXT_GTAG_ID` - nuxt-gtag
- `NUXT_PREPROD_APP` - when set, `robots` meta becomes `none`

Read at runtime through `useRuntimeConfig().public.{apiUrl,backendUrl,appUrl}`.

## Deployment

Build locally with the production `.env`, upload `.output/` to Ionos, then restart the Node app from the Plesk panel. `server.js` is the Passenger entry point (`import('./.output/server/index.mjs')`). Server logs: `/var/log/passenger/passenger.log` (root).

## Architecture

Nuxt 3 SSR portfolio site. Content comes from a Strapi CMS; the whole visual layer is a single WebGL canvas that persists across route changes.

### The layout is the engine

`layouts/default.vue` is where almost all global state lives. It:

- creates the one and only `<Curtains>` canvas and renders `<NuxtPage>` *inside* it, so DOM elements and their WebGL planes stay in sync;
- applies a fullscreen post-processing `<ShaderPass>` (`shaders/post-fx.frag`) whose `uDisplacement` uniform is fed by scroll velocity;
- owns the Lenis smooth-scroll instance (exposed as `window.lenis`) and the single `requestAnimationFrame` loop that drives Lenis, the scroll velocity lerp, and the Three.js cover;
- mounts `Cover3D` (Three.js homepage scene) and `MouseCursor`.

Because of this, **pages are not standalone**. Every page component receives an `onRender` prop from the layout and emits back to it: `onLockScroll(isLocked, animate, scrollY)`, `onStartCover3d(bool)`, `onScrollZone(el)`.

### Curtains layer (`components/curtains/`)

A vendored and modified port of `vue-curtains` (`Curtains`, `Plane`, `ShaderPass`, `RenderTarget`, `FXAAPass`, `PingPongPlane`). The root component `provide()`s `curtains` and `curtainsEvents`; children consume them via `useCurtains()` / `useCurtainsEvent()` in `hooks.js`. Each folder has an `index.vue` plus a `params.js` holding the default params object.

Critical quirk: **planes are never removed on unmount**. Vue transitions unmount a component before the leave animation finishes, so `Plane`'s `onBeforeUnmount` pushes the plane into `datasCurtains.planesToRemove`, and `removePlanes()` animates `uOpenProgress` down before calling `plane.remove()`. Pages therefore gate plane creation on a `bMountPlanes` computed (`planesToRemove.length === 0`) passed down as the `mountPlanes` prop. Breaking this pattern produces duplicated or black planes.

`components/webgl/ImagePlane.vue` is the standard image-as-plane wrapper (`shaders/planes.vert|frag`); it appends a timestamp to the `src` on purpose to defeat cache-related resize/black-image bugs.

### Page transitions

`compositions/use-transition.js` exports **module-level mutable singletons** (`transitionState`, `elementsToTransition`, `functionTransitionCallback`, `curtainsForTransition`, `backgroundForTransition`), not per-component state. A page assigns to them right before navigating, and the GSAP transitions in `transitions/work-transition.js` read them during `onLeave`. Transitions are wired per page with `definePageMeta({ pageTransition: workTransition })`.

Pages typically react to `watch(() => transitionState.transitionComplete, ...)` to unlock scroll, start scroll-reveal, or drop planes.

### Data layer

`stores/datas.js` (Pinia) is the single content store. `fetchDatas(apiId)` takes one of the exported `S_DATA_*` constants, returns early if that slice is already cached, and builds the Strapi query (`populate=deep`, sorting, pagination) per endpoint. Strapi shapes are used raw everywhere: `item.attributes.<Field>`, media at `config.public.backendUrl + data.attributes.url`. Field names are mixed French/English and inconsistently capitalised (`Titre`, `Resume`, `titre`, `brand`, `slug`) - always check the actual API payload rather than guessing.

The store also owns keyword filtering (`filterProjects`), client-side pagination (`projectsByPage`), scroll lock, and current/previous route tracking.

`stores/datasCurtains.js` owns WebGL state that must survive page changes: the curtains instance, `planesToRemove`, and `currentPlaneCover` (the plane that morphs from a project thumbnail into the project page cover).

### SEO

`compositions/use-seo.js` is the single entry point for page metadata. Every page calls `useSeo({ title, description, image })` in its `<script setup>` after the `fetchDatas()` calls; the composable cleans Strapi html out of the description, truncates it, resolves Strapi media to an absolute opengraph url, appends the site name to the title, and emits the canonical link plus the opengraph and twitter tags. The global fallbacks are the Strapi `seo` single type and, failing that, the description in `nuxt.config.js`.

Do not call `useSeoMeta`/`useHead` after an `await` in an Options API `setup()` (as opposed to `<script setup>`): there is no `withAsyncContext()` wrapper there, so the component instance is lost and the tags are silently dropped. `pages/legal.vue` calls `useSeo()` before anything async for this reason.

`server/routes/robots.txt.js` and `server/routes/sitemap.xml.js` are generated at request time rather than sitting in `public/`, so `robots.txt` can honour `NUXT_PREPROD_APP` and the sitemap can list project slugs pulled live from Strapi without a rebuild.

### Styling

SCSS with `variables.scss`, `bootstrap` (grid subset) and `mixins.scss` **auto-injected into every component** via `vite.css.preprocessorOptions.additionalData`. Never re-import those three in a component `<style>` block. Global partials are aggregated in `assets/styles/main.scss`; per-component styles that are shared across pages live there as `_partial.scss` files rather than in the SFC.

### Shaders

`.frag`, `.vert` and `.glsl` files under `shaders/` are imported directly as strings (`vite-plugin-glsl`). Includes resolve from the repo root, so lygia is referenced as `#include "/lygia/math/const.glsl"`.

### Debugging

`esbuild.drop: ["console"]` strips all `console.*` in the production build, which is why the codebase logs freely. Adding `#config` to the URL hash mounts `lil-gui` panels (post-fx uniforms in the layout, Three.js scene params in `Cover3D`). `js/config3d.js` and `js/debug.ts` hold the Three.js tuning constants and debug flags.

### Misc conventions

- Scroll reveals are declarative: add class `scroll-reveal` plus `data-scroll-reveal-opacity-y|-height|-clip-path`, `data-scroll-reveal-delay`, `data-scroll-reveal-duration`, optional `data-scroll-reveal-callback`. Pages call `initScrollReveal(root)` / `clearScrollReveal()`.
- `data-mouse-cursor="hover"` marks elements that the custom `MouseCursor` reacts to.
- `data-header-scroll-minimize` marks the zone that shrinks the header on scroll.
- `mixins/` are legacy Options API mixins (`utils-device.js` for device/touch detection) coexisting with `<script setup>` pages.
- `~` and `@` both alias the project root (`jsconfig.json`).
- `todo.todo` is the project backlog in TaskPaper-ish format; it is kept up to date by hand.
