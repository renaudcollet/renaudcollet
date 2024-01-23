<template>
  <Header></Header>
  <div ref="background" class="background"></div>
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
      ref="shaderPass"
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
  <MouseCursor ref="mouseCursor" />
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
import { useTransitionComposable } from '../compositions/use-transition';

const route = useRoute()

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_SEO);

const showCover3d = ref(false)
const scrollZone = ref(null)
const cover3d = ref(null);
// const shaderPass = ref(null);
const curtains = ref(null);
const mouseCursor = ref(null);
const background = ref(null);

let __curtains = null;

const storeDatasCurtains = useDatasCurtainsStore();
const { curtainsForTransition, backgroundForTransition } = useTransitionComposable();

const onLockScroll = (isLocked, animate, scrollY = 0) => {
  // storeDatas.lockScroll = isLocked;
  if (!isLocked) {
    console.log(`SCROLL ACTIVATED, scrollY: ${scrollY}, immediate: ${!animate}`);
    lenis.start()
    lenis.scrollTo(scrollY, {immediate: !animate })
  } else {
    // storeDatasCurtains.scrollY = window.scrollY
    console.log(`SCROLL STOPPED, scrollY: ${storeDatas.scrollY}`);
    lenis.stop()
  } 
}

const onStartCover3d = (value) => {
  // console.log('default - onStartCover3d', value);
  showCover3d.value = value
}

const onScrollZone = (value) => {
  // console.log('default - onScrollZone', value);
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

// const scrollVelocity = ref(0);
let scrollVelocity = 0;

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
  console.log('onCurtainsReady', _curtains);
  // curtains.disableDrawing();

  __curtains = _curtains;
  curtainsForTransition.curtains = __curtains;
  backgroundForTransition.element = background.value;
  storeDatasCurtains.setCurtains(_curtains)

  // NOTE: Curtains params changed directly in the custom Curtains component (params.js)
  // _curtains.autoResize = false

  let timeout = false
  window.addEventListener('resize', () => {

    const _html = document.querySelector('html')
    background.value.style.width = `${_html.clientWidth}px`
    background.value.style.height = `${_html.clientHeight}px`  

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
watch(() => route.path, (value) => {
  console.log('➮ DEFAULT LAYOUT - WATCH route fullpath ', value)
  storeDatas.setCurrentPage(value)

  if (storeDatas.previousPage === '/works' && backgroundForTransition.imgData !== null) {
    // Remove image background
    backgroundForTransition.imgData = null
    backgroundForTransition.element.style.backgroundImage = `none`    
  }

  setTimeout(() => {
    mouseCursor.value.reset()
  }, 1500)

  // if (window.gtag)
  //   window.gtag('page_view', to.name)

  // const gtag = useGtag()
  // gtag('set', 'page_title', to)
    
  // lenis.scrollTo(0)
  // lenis.start()

  // hide cover 3d, show is emitted by index page
  if (value !== '/') {
    setTimeout(() => {
      showCover3d.value = false
    }, 500)
  }

})

let bPause = false

// let fps = 60
const update = (time) => {
  
  // setTimeout(function() {
    requestAnimationFrame((time) => {
      update(time)
    })
  // }, 1000 / fps);

  // if (__curtains && !bPause) {
  //   __curtains.render();
  // }
  
  lenis.raf(time)
  onScroll()
}

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b;
}

// For shader effect on scroll
const onScroll = () => {
  // scrollVelocity.value = lerp(lenis.scroll - lastScroll, 0, 0.2);
  scrollVelocity = lerp(lenis.scroll - lastScroll, 0, 0.2);
  lastScroll = lenis.scroll

  // updateScrollVelocity(scrollVelocity)

  if (cover3d.value && showCover3d.value) {
    cover3d.value.onScroll()
  }
}

onMounted(() => {
  // console.log('DEFAULT LAYOUT - MOUNTED');
  config = window.location.hash === '#config'

  const _html = document.querySelector('html')
  background.value.style.width = `${_html.clientWidth}px`
  background.value.style.height = `${_html.clientHeight}px`  

  window.addEventListener('keydown', (e) => {
    console.log('keydown', e.key);
    if (e.key === 'p') {
      bPause = !bPause

      if (bPause) {
        __curtains.disableDrawing()
      } else {
        __curtains.enableDrawing()
      }
    } else if (e.key === 'd') {
      // Get renderer image and set it as background
      var imgData = __curtains.canvas.toDataURL();
      background.value.style.backgroundImage = `url(${imgData})`
    }
  })

  const c1 = 1.70158;
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

// onUnmounted(() => {
//   console.log('DEFAULT LAYOUT - UNMOUNTED');
//   lenis.destroy()
// })

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
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: yellow;
  pointer-events: none;
}
</style>