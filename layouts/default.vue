<template>
  <div :class="[currentPage.value]">
    <Header></Header>
    <!-- <Cover3D v-if="showCover" :position="coverPosition" :showScrollArrow="showScrollArrow"/> -->
    
    <NuxtPage :scrollVelocity="scrollVelocity" />
  
    <span v-if="config" id="config"></span>
  </div>
</template>

<script setup>
import { useDatasStore, S_DATA_SEO } from '~/stores/datas';
import Lenis from '@studio-freight/lenis';
// import gsap from 'gsap';

// import Cover3D from '~/components/webgl/Cover3D.vue'

// I don't know why, I can't use useHead() after receiving the data from the store
// -> Can't useHead in async function
// useHead({
//   // titleTemplate: '%s - Accueil',
//   titleTemplate: '%s',
//   })

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_SEO);

const datasSEO = storeDatas.seo.data.attributes;
console.log('datasSEO', datasSEO);

let lenis;
let scrollVelocity = 0;
let lastScroll = 0;
let config = false;
// let showScrollArrow = true;

const route = useRoute()

const currentPage = computed(() => {
  return `page-${route.name}`
})

const update = time => {
  lenis.raf(time)
  scrollVelocity = lerp(scrollVelocity, 0, 0.2)
  requestAnimationFrame(update)
}

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b;
}

watch(route, (to, from) => {
  // console.log('default layout - route changed', to, from)
  // if (window.gtag)
  //   window.gtag('page_view', to.name)

  const gtag = useGtag()
  gtag(
    'set', 'page_title', to
  )
    
  // showScrollArrow = route.name === 'index'
  lenis.scrollTo(0, 0)
})

onMounted(() => {
  config = window.location.hash === '#config'

  const c1 = 1.70158;
  const c3 = c1 + 1;
  lenis = new Lenis({
    duration: 1,
    easing: (x) => {
      // https://easings.net/
      // return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      // return 1 + c3 * (x - 1) * (x - 1) * (x - 1) + c1 * (x - 1) * (x - 1);
      // return 1 - Math.pow(1 - x, 3);
      return 1 - (1 - x) * (1 - x) * (1 - x);
    },
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.5, // This is not in the doc, but it sets the wheelMultiplier
    wheelMultiplier: 0.5, // if mouseMultiplier is not set, then wheelMultiplier is used
    // normalizeWheel: true,
    smoothTouch: false,
    touchMultiplier: 0.5,
  })
  // Make Lenis available in every component
  window.lenis = lenis
  lastScroll = lenis.scroll

  window.addEventListener('scroll', () => {
    scrollVelocity = lenis.scroll - lastScroll
    lastScroll = lenis.scroll
  })

  requestAnimationFrame(update)
})

onUnmounted(() => {
  // clearScrollOpacity()
  console.log('onUnmounted default layout');
})
</script>

<script>
// // import Cover3D from '~/components/webgl/Cover3D.vue'
// import utilsDevice from '~~/mixins/utils-device.js';
// import { useDatasStore } from '~/stores/datas';

// export default {
//   components: {
//     // Cover3D
//   },

//   mixins: [utilsDevice],

//   data() {
//     return {
//       scrollVelocity: 0,
//       config: false,
//       showScrollArrow: true
//     };
//   },

//   computed: {
//     currentPage() {
//       return `page-${this.$route.name}`
//     },
//     showCover() {
//       let route = this.$route.name
//       if (route === 'legals')
//         return false

//       return true//route === 'home' || route === 'index'|| route === 'work'|| route === 'contact' || route === 'agence'
//     },
//     coverPosition() {
//       let route = this.$route.name
      
//       switch(route) {
//         case 'contact':
//         case 'agence':
//         case 'work':
//         case 'legal':
//         case 'error-id':
//           return 'left'
//         default:
//           return 'center'
//       }
//     }
//   },

  // watch: {
  //   '$route' (to, from) {
  //     // console.log('default layout - route changed', to, from)
  //     // if (window.gtag)
  //     //   window.gtag('page_view', to.name)

  //     const gtag = useGtag()
  //     gtag(
  //       'set', 'page_title', to.name
  //     )
        
  //     this.showScrollArrow = this.$route.name === 'index'
  //     this.lenis.scrollTo(0, 0)
  //   }
  // },

  // mounted() {
  //   this.showScrollArrow = this.$route.name === 'index'

  //   const c1 = 1.70158;
  //   const c3 = c1 + 1;
  //   this.lenis = new Lenis({
  //     duration: 1,
  //     easing: (x) => {
  //       // return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  //       return 1 + c3 * (x - 1) * (x - 1) * (x - 1) + c1 * (x - 1) * (x - 1);
  //     },
  //     direction: 'vertical',
  //     gestureDirection: 'vertical',
  //     smooth: true,
  //     mouseMultiplier: 0.5, // This is not in the doc, but it sets the wheelMultiplier
  //     wheelMultiplier: 0.5, // if mouseMultiplier is not set, then wheelMultiplier is used
  //     // normalizeWheel: true,
  //     smoothTouch: false,
  //     touchMultiplier: 0.5,
  //   })
  //   this.scrollVelocity = 0
  //   this.lastScroll = this.lenis.scroll

  //   // Make Lenis available in every component
  //   window.lenis = this.lenis

  //   window.addEventListener('scroll', () => {
  //     this.scrollVelocity = this.lenis.scroll - this.lastScroll
  //     this.lastScroll = this.lenis.scroll
  //   })

  //   this.config = window.location.hash === '#config'
  //   requestAnimationFrame(this.update)
  // },

  // methods:{
  //   update(time){
  //     this.lenis.raf(time)
  //     this.scrollVelocity = this.lerp(this.scrollVelocity, 0, 0.2)
  //     requestAnimationFrame(this.update)
  //   },

  //   lerp(a, b, n) {
  //     return (1 - n) * a + n * b;
  //   },
  // }
// };
</script>

<style lang="scss">
#config{
  position: fixed;
  top: 0;
  right: 0;
  z-index: 99999999999;
}
</style>