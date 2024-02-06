<template>
  <div ref="root">
    <div class="cover">
      <div id="index-logo" ref="indexLogo" class="logo" data-header-scroll-minimize>
        <Logo />
      </div>
      <div id="job" ref="job" class="job">
        Freelance Web Developer
      </div>
      <div ref="scrollDown" class="scroll-down">
        <div>SCROLL</div>
        <div ref="scrollSvg" class="scroll-svg"></div>
      </div>
    </div>
    <div ref="scrollZone" class="scroll-zone"></div>
    <section class="projects-home">
      <h1 
        class="projects-home__title scroll-reveal unmount-animation"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.5"
        data-scroll-reveal-duration="0.5"
      >
        <span class="front">{{storeDatas.accueil.data.attributes.Titre}}</span>
        <span class="back">{{storeDatas.accueil.data.attributes.Titre}}</span>
      </h1>
      <template v-for="(item, index) in storeDatas.projectsHomepage" :key="index">
        <ProjectItem 
          class="projects-home__item unmount-animation" 
          :id="index"
          :datas="item"
          :to="`/works/${item.attributes.slug}`"
          :onRender="onRender"
          :mountPlanes="bMountPlanes"
          @onClick="onClickProjectItem"
        />
      </template>

      <NuxtLink  
        to="/works" 
        class="projects-home__button unmount-animation" 
        data-mouse-cursor="hover"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.5"
        data-scroll-reveal-duration="0.5"
      >
        <span class="front">Voir tous les projets</span>
        <span class="back">Voir tous les projets</span>
      </NuxtLink>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import { useDatasStore, S_DATA_ACCUEIL } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';
import { workTransition, durationLeaveWork } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
import * as debug from '~/js/debug';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);

console.log('INDEX PAGE - setup', storeDatas.accueil);

const props = defineProps({
  onRender: {
    type: Function,
    required: true,
  }
})

// const { initLogoObserver, clearLogoObserver } = useLogoObserver();
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback, curtainsForTransition, backgroundForTransition } = useTransitionComposable();

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: workTransition,
});

const emit = defineEmits(['onLockScroll', 'onStartCover3d', 'onScrollZone'])

// Curtains
const storeDatasCurtains = useDatasCurtainsStore();
const bMountPlanes = computed(() => {
  return storeDatasCurtains.planesToRemove.length === 0;
});

watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;
    // console.log('emit onLockScroll', false);

    // storeDatasCurtains.removePlanes();
    // storeDatasCurtains.removeCurrentPlaneCover();
    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;

      if (storeDatas.scrollY > 0) {
        emit('onLockScroll', false, true, storeDatas.scrollY)
        storeDatas.scrollY = 0
      } else
        emit('onLockScroll', false)
    }, 100)

    // setTimeout(() => {
    //   if (root.value) {
    //     // Add if condition in case user change page quickly, because we are in a setTimeout
    //     initScrollReveal(root.value)
    //   }
    // }, 500)
  }
})

const root = ref(null);
const startCover3d = ref(false);
const scrollZone = ref(null);
const indexLogo = ref(null);
const job = ref(null);
const scrollDown = ref(null);
const scrollSvg = ref(null);

let selectedImagePlane = null

const onClickProjectItem = (id, imagePlane) => {
  selectedImagePlane = imagePlane
  storeDatasCurtains.setCurrentPlaneCover(imagePlane.planeMesh)
  storeDatas.scrollY = window.scrollY
  emit('onLockScroll', true)
}

onMounted(() => {
  // ERROR: After page is unmounted, 
  // and then mounted again, 
  // root.value is not null, but I can't access its offsetHeight nor getBoundingClientRect()
  // in console.log, it's not null, but I can't right click on it to inspect it
  // console.log('INDEX PAGE - MOUNTED', root.value);

  gsap.set(indexLogo.value, { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })
  gsap.set(job.value, { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })

  const tl = gsap.timeline()
  if (debug.SKIP_INTRO) tl.timeScale(5)
  tl
    .to(job.value, { delay: 0.5, opacity: 1 })
    .to(job.value, { opacity: 0 }, '+=1')
    .to(indexLogo.value, { opacity: 1, 
      onComplete: () => {
        startCover3d.value = true
        // console.log('emit onStartCover3d', true);
        emit('onStartCover3d', true)
      }}, '+=0.5')
    .to(indexLogo.value, { opacity: 0, 
      onComplete: () => {
        // initLogoObserver()
      }}, '+=3')
    .to(scrollDown.value, { opacity: 1, onComplete: () => {
      gsap.to(scrollSvg.value, { y: 10, repeat: -1, yoyo: true, duration: 0.7, ease: 'power1.inOut', onRepeat: () => {
          if (window.scrollY > window.innerHeight) {
            gsap.killTweensOf(scrollSvg.value)
            gsap.to(scrollDown.value, { autoAlpha: 0, duration: 0.5, ease: 'power1.inOut' })
          }
        } })
    } }, '-=1')
    .to('#header-logo', {
      duration: 1,
      translateX: 0,
      autoAlpha: 1,
      ease: 'power4.out',
    })

  nextTick(() => {
    scrollZone.value.style.height = `${window.innerHeight * 2}px`  
    emit('onScrollZone', scrollZone.value)

    initScrollReveal(root.value)
  })
})

const expandCover = (imagePlane) => {
  // console.log('expandCover', imagePlane, imagePlane.planeMesh.htmlElement);

  let planeHtml = imagePlane.planeMesh.htmlElement;

  // Get the bounding rectangle of the relative element
  const rect = planeHtml.parentNode.parentNode.getBoundingClientRect()
  
  // This would be eq to the final size of the imagePlane (aka the cover image in page id)
  const rectFinal = imagePlane.planeMesh.renderer.canvas.getBoundingClientRect()

  // Change z position to cover other planes in datasCurtains.js 
  // Not working for home page... So we do it here for this plane
  imagePlane.planeMesh.uniforms.uZPos.value = -0.0001;
  imagePlane.planeMesh.setRenderOrder(1); // This should work too

  const lerp = (v0, v1, t) => {
    return v0 + t * (v1 - v0);
  }

  imagePlane.planeMesh.watchScroll = false;

  let scale = imagePlane.planeMesh.uniforms.uScale.value;

  // gsap.killTweensOf(planeHtml)
  gsap.set(planeHtml, {
    position: 'fixed', 
    top: `${rect.top}px`,
    left: `${rect.left}px`,
  })

  const tl = gsap.to(planeHtml, {
    duration: durationLeaveWork,
    ease: 'power4.out',
    top: `0px`,
    left: `0px`,
    // width: rectFinal.width - 100, // debug
    width: rectFinal.width,
    height: rectFinal.height,
    onUpdate: () => {
      imagePlane.resize();
      imagePlane.planeMesh.uniforms.uCoverProgress.value = tl.progress();
      imagePlane.planeMesh.uniforms.uScale.value = lerp(scale, 1, tl.progress())
    },
    onComplete: () => {
      imagePlane.resize();
      
      backgroundForTransition.imgData = curtainsForTransition.curtains.canvas.toDataURL();
      backgroundForTransition.element.style.backgroundImage = `url(${backgroundForTransition.imgData})`
      
      // imagePlane.planeMesh.watchScroll = false;
      // imagePlane.planeMesh.resetPlane()
      // console.log('expandCover onComplete');
    }
  })
}

onBeforeUnmount(() => {  
  // console.log('HOME onBeforeUnmount');
  gsap.killTweensOf(scrollDown.value)
  clearScrollReveal()

  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');

  const closePanels = () => {
    // console.log('HOME closePanels');
    storeDatasCurtains.removePlanes();

    // if has cover, expand it
    if (selectedImagePlane) {
      // console.log('HOME closePanels expandCover');
      expandCover(selectedImagePlane)
    }
  }

  functionTransitionCallback.function = closePanels;
})
</script>

<style lang="scss" scoped>
.scroll-zone {
  height: 200vh;
}
.scroll-down {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  opacity: 0;
}

.scroll-svg {
  width: 20px;
  height: 20px;
  margin: 0 auto;
  background-image: url('/assets/svg/scroll-svg.svg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}

.props {
  position: fixed;
  background-color: #000;
  color: #fff;
  top: 0;
  width: 100px;
  height: 50px;
}
.cover {
  height: 100vh;
  width: 100%;
  display: flex;
  user-select: none;
  pointer-events: none;
  position: relative;
}
  
.logo {
  position: absolute;
  width: 170px;
  height: 170px;

  @media only screen and (min-width: 768px) {
    width: 250px;
    height: 250px;
  }
}

.job {
  position: absolute;
  opacity: 0;
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>