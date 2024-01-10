<template>
  <Header></Header>
  <Cover3D ref="cover3d" :showCover="showCover3d" :scrollZone="scrollZone"/>
  <Curtains 
    id="CurtainsCanvas" 
    ref="curtains" 
    @success="onCurtainsReady" 
    @onContextLost="onContextLost"
  >
    <!-- <ShaderPass 
      :params="firstPassProps"
      @render="onFirstPassRender"
      @ready="onFirstPassReady"
    /> -->
    <NuxtPage 
      :scrollVelocity="scrollVelocity"
      :class="[currentPage.value]"
      :onRender="onRender"
      class="page"
      @onLockScroll="onLockScroll"
      @onStartCover3d="onStartCover3d"
      @onScrollZone="onScrollZone"
    />
  </Curtains>
  <MouseCursor />
  <span v-if="config" id="config"></span>
</template>

<script setup>
import Cover3D from '~/components/webgl/Cover3D.vue';
import { useDatasStore, S_DATA_SEO } from '~/stores/datas';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
// import { Curtains } from "vue-curtains";
// import ShaderPass from '~/components/curtains/ShaderPass/index.vue';
import Curtains from "~/components/curtains/Curtains/index.vue";
import Lenis from '@studio-freight/lenis';
import MouseCursor from '~/components/ui/MouseCursor.vue';
import useCurtainsShader from '~/compositions/use-curtains-shader';

const route = useRoute()

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_SEO);

const showCover3d = ref(false)
const scrollZone = ref(null)
const cover3d = ref(null);

const storeDatasCurtains = useDatasCurtainsStore();

const onLockScroll = (isLocked, animate) => {
  // // console.log('---> onLockScroll', isLocked);
  // // storeDatas.lockScroll = isLocked;
  // if (!isLocked) {
  //   lenis.start()
  //   // lenis.scrollTo(0, {immediate: !animate })
  // } else {
  //   storeDatasCurtains.scrollY = window.scrollY
  //   lenis.stop()
  // } 
}

const onStartCover3d = (value) => {
  console.log('default - onStartCover3d', value);
  showCover3d.value = value
}

const onScrollZone = (value) => {
  console.log('default - onScrollZone', value);
  scrollZone.value = value
}

// const datasSEO = storeDatas.seo.data.attributes;
useHead({
  // titleTemplate: '%s - Accueil',
  titleTemplate: '%s',
  htmlAttrs: {
    // class: scrollLockClass.value,
  }
})

const { 
  // firstPassProps, 
  // onFirstPassReady, 
  // onFirstPassRender, 
  onRender, 
  // updateScrollVelocity
} = useCurtainsShader();

const scrollVelocity = ref(0);

let lenis;
let lastScroll = 0;
let config = false;

const currentPage = computed(() => {
  return `page-${route.name}`
})

const onContextLost = () => {
  console.log('onContextLost');
  // curtains.disableDrawing();
}

const onCurtainsReady = (_curtains) => {
  // console.log('onCurtainsReady', _curtains);
  // curtains.disableDrawing();
  _curtains.autoResize = false
  let timeout = false
  window.addEventListener('resize', () => {
    clearTimeout(timeout);
    // TODO: replace timeout with raf debounce
    timeout = setTimeout(() => {
      // Reload window if orientation changes
      // const isPortrait = window.innerHeight > window.innerWidth
      // if (this.isPortrait !== isPortrait) {
      //   window.location.reload()
      // }
      _curtains.resize()
    }, 110);
  })
}

storeDatas.setCurrentPage(route.fullPath)
watch(() => route.fullPath, (value) => {
  console.log('DEFAULT LAYOUT - WACH route', value)
  storeDatas.setCurrentPage(value)

  // if (window.gtag)
  //   window.gtag('page_view', to.name)

  // const gtag = useGtag()
  // gtag('set', 'page_title', to)
    
  // lenis.scrollTo(0)
  // lenis.start()
})

const update = (time) => {
  requestAnimationFrame((time) => {
    update(time)
  })
  
  lenis.raf(time)
  onScroll()
}

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b;
}

let firstTimeScrollUnlockedValue

// For shader effect on scroll
const onScroll = () => {
  // console.log('onScroll', lenis.scroll, lastScroll, window.scrollY);
  // scrollVelocity.value = lenis.scroll - lastScroll
  scrollVelocity.value = lerp(lenis.scroll - lastScroll, 0, 0.2);
  lastScroll = lenis.scroll

  // if (storeDatas.lockScroll === false) {
  //   // Get firstime scroll was unlocked and check that value on every scroll
  //   if (!firstTimeScrollUnlockedValue) {
  //     firstTimeScrollUnlockedValue = lenis.scroll;
  //     // console.log('lenis scroll value = ', firstTimeScrollUnlockedValue);
  //   }
  //   if (lenis.scroll < firstTimeScrollUnlockedValue) {
  //     // console.log('lock the scroll !');
  //     storeDatas.setIsScrollLocked(true)
  //   }
  // }
  
  // console.log('default - onScroll', cover3d.value, showCover3d.value);
  if (cover3d.value && showCover3d.value) {
    cover3d.value.onScroll()
  }
}

onMounted(() => {
  console.log('DEFAULT LAYOUT - MOUNTED');
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

  // window.addEventListener('scroll', onScroll)
  // lenis.on('scroll', onScroll)

  requestAnimationFrame(update)
})

onUnmounted(() => {
  console.log('DEFAULT LAYOUT - UNMOUNTED');
  lenis.destroy()
})

onErrorCaptured((err) => {
  // handle the error here
  console.error('default layer error captured : ' , err)
})
</script>

<style lang="scss">
#config{
  position: fixed;
  top: 0;
  right: 0;
  z-index: 99999999999;
}
</style>