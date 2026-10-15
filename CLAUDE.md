# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install    # settings in pnpm-workspace.yaml (shamefullyHoist, allowBuilds)
pnpm dev        # nuxt dev --host, http://localhost:3000
pnpm build      # nuxt build -> .output/
pnpm preview    # preview the production build
```

pnpm (v10+) checks the dependencies before `pnpm dev`/`pnpm build` and runs an install if they are out of date, which rewrites `node_modules`.

There is no test suite, no linter and no formatter configured. Do not invent commands for them.

Shaders live in a git submodule: `git submodule update --init` (lygia) must be run before the first build, otherwise GLSL `#include "/lygia/..."` fails.

`nuxt` is pinned to `3.21.11` (the last 3.x, Nuxt 4 would be a migration of its own) with Vue 3.5. After an upgrade, check the page transitions and the cover transition in the browser, the WebGL layer relies on the timing of Vue transitions and page mounts. Keep `vue` as a direct dependency in `package.json`: otherwise the packages that only have Vue as a peer dependency (pinia, vue-demi, vue-router) can get another Vue version installed alongside.

In `pages/works/`, import with the `~/` alias: Nuxt 3.21 fails to build the `definePageMeta` macro on a wrong relative path that older versions resolved anyway.

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

A curtains plane reads its size and position on its html element (`getBoundingClientRect()`), and a detached element reports 0x0: a plane still bound to the DOM of a page that has left collapses on its next resize. Compare planes by `uuid`, not `index` (`index` is the number of planes at creation time, so it is reused once planes have been removed).

`shaders/planes.frag` returns early when `uOpenProgress` is (nearly) 0: the lygia `rect()` mask divides by it, and the resulting inf/NaN shows up as a black flash on some GPUs.

`components/webgl/ImagePlane.vue` is the standard image-as-plane wrapper (`shaders/planes.vert|frag`); it appends a timestamp to the `src` on purpose to defeat cache-related resize/black-image bugs.

### Page transitions

`compositions/use-transition.js` exports **module-level mutable singletons** (`transitionState`, `elementsToTransition`, `functionTransitionCallback`, `coverProxyForTransition`, `scrollForTransition`), not per-component state. A page assigns to them right before navigating, and the GSAP transitions in `transitions/work-transition.js` read them during `onLeave`. They also carry what the layout exposes to pages: a leaving page is already unmounted, its `emit()` calls are ignored. Transitions are wired per page with `definePageMeta({ pageTransition: workTransition })`.

Two Nuxt behaviours to keep in mind:

- the transition used for a navigation is the one of the **target** page, for both the leave and the enter hooks (home to project runs `workIdTransition.onLeave`);
- the `setup` of the next page runs as soon as the navigation starts, during the leave. Anything that depends on the leave being over belongs in `onMounted`.

Pages typically react to `watch(() => transitionState.transitionComplete, ...)` to unlock scroll, start scroll-reveal, or drop planes.

**Cover transition** (`transitions/expand-cover.js`, home or works to a project page): a single plane goes from the project item to the project cover, there is no second plane to swap with. `expandCover()` binds the item plane to `.cover-proxy`, a fixed element owned by the layout that survives the page change, expands the proxy to fullscreen, then resets the scroll to the top (`scrollForTransition.resetToTop()`, which also syncs Lenis and curtains). The leave hook waits for the promise returned by the page callback, so the project page mounts with the cover fullscreen and the scroll at 0. On mount, `pages/works/[id].vue` binds the plane to its `.cover-top__anchor` element (`adoptCover()`); without an expanded cover (direct url, history) it mounts its own `ImagePlane`. Each rebind happens between two identical rects, which is what makes it seamless.

### Data layer

`stores/datas.js` (Pinia) is the single content store. `fetchDatas(apiId)` takes one of the exported `S_DATA_*` constants, returns early if that slice is already cached, and builds the Strapi query (`populate=deep`, sorting, pagination) per endpoint. Strapi shapes are used raw everywhere: `item.attributes.<Field>`, media at `config.public.backendUrl + data.attributes.url`. Field names are mixed French/English and inconsistently capitalised (`Titre`, `Resume`, `titre`, `brand`, `slug`) - always check the actual API payload rather than guessing.

The store also owns keyword filtering (`filterProjects`), client-side pagination (`projectsByPage`), scroll lock, and current/previous route tracking.

`stores/datasCurtains.js` owns WebGL state that must survive page changes: the curtains instance, `planesToRemove`, and `currentPlaneCover` (the plane that morphs from a project thumbnail into the project page cover, then is owned by the project page until it leaves).

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
