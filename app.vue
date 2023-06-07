<script setup>
// const app = useAppConfig()
// useHead({
//   title: app.name,
//   titleTemplate: '%s - Nuxt 3 Awesome Starter',
//   meta: [
//     { name: 'viewport', content: 'width=device-width, initial-scale=1' },
//     {
//       hid: 'description',
//       name: 'description',
//       content: 'Nuxt 3 Awesome Starter',
//     },
//   ],
//   link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
// })
</script>

<template>
  <Html>
    <Body>
      <NuxtLayout>
        <!-- <NuxtLoadingIndicator :height="5" :duration="3000" :throttle="400" /> -->
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>