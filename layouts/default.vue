<template>
  <Header></Header>
  <div ref="background" class="background"></div>
  <Cover3D ref="cover3d" :showCover="showCover3d" :scrollZone="scrollZone"/>
  <Curtains 
    id="CurtainsCanvas" 
    ref="curtains" 
    @success="onCurtainsReady" 
    @onContextLost="onContextLost"
    @error="onCurtainsError"
  >
    <ShaderPass 
      :params="firstPassProps"
      @render="onFirstPassRender"
      @ready="onFirstPassReady"
    />
    <NuxtPage 
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
import GUI from 'lil-gui';
import firstPassFs from "../shaders/post-fx.frag";
import ShaderPass from '~/components/curtains/ShaderPass/index.vue';
import Curtains from "~/components/curtains/Curtains/index.vue";
import Lenis from '@studio-freight/lenis';
import MouseCursor from '~/components/ui/MouseCursor.vue';
// import useCurtainsShader from '~/compositions/use-curtains-shader';
import { useTransitionComposable } from '../compositions/use-transition';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_SEO);

const route = useRoute()
storeDatas.setCurrentPage(route.fullPath)

const showCover3d = ref(false)
const scrollZone = ref(null)
const cover3d = ref(null);
// const shaderPass = ref(null);
const curtains = ref(null);
const mouseCursor = ref(null);
const background = ref(null);

let scrollZoneHeight = 0;
let __curtains = null;

const storeDatasCurtains = useDatasCurtainsStore();
const { curtainsForTransition, backgroundForTransition } = useTransitionComposable();

const onLockScroll = (isLocked, animate, scrollY = 0) => {
  // storeDatas.lockScroll = isLocked;
  if (!isLocked) {
    // console.log(`SCROLL ACTIVATED, scrollY: ${scrollY}, immediate: ${!animate}`);
    lenis.start()
    lastScroll = 0 // To prevent having a bump when scroll sudenly change between pages
    lenis.scrollTo(scrollY, {immediate: !animate })
    lastScroll = 0 // To prevent having a bump when scroll sudenly change between pages
    // console.log(`UNLOCK SCROLL - scrollY: ${scrollY} lastScroll: ${lastScroll}`);
  } else {
    // console.log(`SCROLL STOPPED, scrollY: ${storeDatas.scrollY}`);
    lenis.stop()
  } 
}

const onStartCover3d = (value) => {
  // console.log('default - onStartCover3d', value);
  showCover3d.value = value
}

const onScrollZone = (value) => {
  scrollZone.value = value
  scrollZoneHeight = value.clientHeight
}

// const datasSEO = storeDatas.seo.data.attributes;
useHead({
  // titleTemplate: '%s - Accueil',
  titleTemplate: '%s',
  htmlAttrs: {
    // class: scrollLockClass.value,
  }
})

/**
 * Curtains 
 */


 const firstPassProps = {
  fragmentShader: firstPassFs,
  uniforms: {
    timer: {
      name: "uTimer",
      type: "1f",
      value: 0,
    },
    uDisplacement: {
      name: "uDisplacement",
      type: "1f",
      value: 0.,
    },
    rgbShift: {
      name: "rgbShift",
      type: "1f",
      value: 0.5,
    },
    stretch: {
      name: "stretch",
      type: "1f",
      value: 0.0, // 0.06
    },
    squish: {
      name: "squish",
      type: "1f",
      value: 0.0, // 0.06
    },
    noiseFreq: {
      name: "noiseFreq",
      type: "1f",
      value: 0.0, // 2
    },
  },
}

const setScrollVelocityMinimum = () => {
  // Enter page work id
  if (storeDatas.currentPage.indexOf('/works/') > -1) {
    scrollVelocityMinimum = 0;
  } else {
    scrollVelocityMinimum = SCROLL_VELOCITY_MINIMUM;
  }
}

const SCROLL_VELOCITY_MINIMUM = 25;
let scrollVelocityMinimum = SCROLL_VELOCITY_MINIMUM;
setScrollVelocityMinimum()
let scrollVelocity = scrollVelocityMinimum; // Set to scrollVelocityMinimum to deform the page right away

let gui = null;

// This is called for each plane on each frame
const onRender = (plane) => {
  // console.log('onRender', scrollVelocity);
  // let planeDeformation = plane.uniforms.planeDeformation.value;
  // plane.uniforms.planeDeformation.value = lerp(planeDeformation, scrollVelocity * 0.01, 0.2);
}

const regularLerp = (a, b, n) => {
  // return (1 - n) * a + n * b; // https://en.wikipedia.org/wiki/Linear_interpolation
  return a + ( b - a ) * n; // From threejs  https://github.com/mrdoob/three.js/blob/dev/src/math/Vector3.js
}

const lerp = (source, target, rate, frameDelta = 1 / 60, targetFps = 60) => {
  const relativeDelta = frameDelta / (1 / targetFps)
  const smoothing = 1 - rate
  return regularLerp(source, target, 1 - Math.pow(smoothing, relativeDelta));
}

const onFirstPassRender = (shaderPass) => {
  // console.log('onFirstPassRender', scrollVelocity);
  // let uDisplacement = shaderPass.uniforms.uDisplacement.value
  // shaderPass.uniforms.uDisplacement.value = lerp(uDisplacement, scrollVelocity * 0.01, 0.2);

  // increase/decrease effect
  shaderPass.uniforms.uDisplacement.value = scrollVelocity //lerp(scrollVelocity, 0, 0.5);
}

const onFirstPassReady = (shaderPass) => {
  // console.log('onFirstPassReady', shaderPass);

  if (window.location.hash == '#config') {
    setTimeout(() => {
      gui = new GUI({ container: document.querySelector('#config') }).title('Curtains').close()

      gui.add(shaderPass.uniforms.rgbShift, 'value').name('RGB Shift')
        .min(0.01)
        .max(1)
      gui.add(shaderPass.uniforms.stretch, 'value').name('Stretch')
        .min(0.01)
        .max(3)
      gui.add(shaderPass.uniforms.squish, 'value').name('Squish')
        .min(0.01)
        .max(3)
      gui.add(shaderPass.uniforms.noiseFreq, 'value').name('Noise Frequency')
        .min(0.01)
        .max(50)

    }, 1000);
  }
}

let lenis;
let lastScroll = 0;
let config = false;

//TODO: Handle curtains onError
// Line 49 : // https://github.com/martinlaxenaire/curtainsjs/blob/master/examples/post-processing-scroll-effect/js/post.processing.parallax.setup.js
// document.body.classList.add("no-curtains", "planes-loaded");

const onContextLost = () => {
  console.log('onContextLost');
  curtains.value.restoreContext()
}

const onCurtainsError = (error) => {
  console.log('onCurtainsError', error);
  // we will add a class to the document body to display original images
  document.body.classList.add("no-curtains");
}

const onCurtainsReady = (_curtains) => {
  // console.log('onCurtainsReady', _curtains);
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

    scrollZoneHeight = scrollZone.value.clientHeight

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

watch(() => route.path, (value) => {
  // console.log('➮ DEFAULT LAYOUT - WATCH route fullpath ', value)
  storeDatas.setCurrentPage(value)

  if (storeDatas.previousPage === '/works' && backgroundForTransition.imgData !== null) {
    // Remove image background
    backgroundForTransition.imgData = null
    backgroundForTransition.element.style.backgroundImage = `none`    
  }

  setScrollVelocityMinimum()

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

// let bPause = false

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
  // onScroll()

  let delta = lenis.scroll - lastScroll;
  // // invert value for the effect
  // delta = -delta;
  delta = delta < 0 ? -delta : delta; // Make delta absolute
  // // threshold
  if(delta > 60) {
      delta = 60;
  }
  // else if(delta < -60) {
  //     delta = -60;
  // }

  // if(Math.abs(delta) > Math.abs(scrollVelocity)) {
  if(delta > scrollVelocity) {
    scrollVelocity = lerp(scrollVelocity, delta, 0.1);
    // scrollVelocity = regularLerp(scrollVelocity, 25, 0.5);
  } else {
    scrollVelocity = lerp(scrollVelocity, scrollVelocityMinimum, 0.01);
  }

  lastScroll = lenis.scroll

  // console.log('scrollVelocity', scrollVelocity);

  if (/* cover3d.value &&  */showCover3d.value) {
    cover3d.value.onScroll()
  }
}

onMounted(() => {
  // console.log('DEFAULT LAYOUT - MOUNTED');
  config = window.location.hash === '#config'

  const _html = document.querySelector('html')
  background.value.style.width = `${_html.clientWidth}px`
  background.value.style.height = `${_html.clientHeight}px`  

  // window.addEventListener('keydown', (e) => {
  //   console.log('keydown', e.key);
  //   if (e.key === 'p') {
  //     bPause = !bPause

  //     if (bPause) {
  //       __curtains.disableDrawing()
  //     } else {
  //       __curtains.enableDrawing()
  //     }
  //   } else if (e.key === 'd') {
  //     // Get renderer image and set it as background
  //     var imgData = __curtains.canvas.toDataURL();
  //     background.value.style.backgroundImage = `url(${imgData})`
  //   }
  // })

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

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('touchstart', onTouchStart)

  requestAnimationFrame(update)
})

const onTouchStart = (e) => {
  mouseCursor.value.deactivate()
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('touchstart', onTouchStart)
  document.addEventListener('touchmove', onTouchMove)
}

const onTouchMove = (e) => {
  if (lenis.scroll < scrollZoneHeight)
    cover3d.value.onTouchMove(e)
}

const onMouseMove = (e) => {
  mouseCursor.value.onMouseMove(e)
  
  if (lenis.scroll < scrollZoneHeight)
    cover3d.value.onMouseMove(e)
}

onErrorCaptured((err) => {
  console.error('default layer error captured : ' , err)
})
</script>

<style lang="scss" scoped>
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
  opacity: 1;
}
</style>