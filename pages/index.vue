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
      <template v-for="(item, index) in storeDatas.projectsHomepage" :key="index">
        <ProjectItem 
          class="projects-home__item" 
          :id="index"
          :datas="item"
          :to="`/works/${item.attributes.slug}`"
          :onRender="onRender"
          :mountPlanes="bMountPlanes"
          @onClick="onClickProjectItem"
        />
      </template>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import { useDatasStore, S_DATA_ACCUEIL } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';
import { defaultTransition } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);

const props = defineProps({
  scrollVelocity: {
    type: Number
  },
  onRender: {
    type: Function,
    required: true,
  }
})

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: defaultTransition,
});

const emit = defineEmits(['onLockScroll', 'onStartCover3d', 'onScrollZone'])

// Curtains
const storeDatasCurtains = useDatasCurtainsStore();
const bMountPlanes = computed(() => {
  return storeDatasCurtains.planesToRemove.length === 0;
});
const { transitionState } = useTransitionComposable();
watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;
    console.log('emit onLockScroll', false);
    emit('onLockScroll', false)
    storeDatasCurtains.removePlanes();
    storeDatasCurtains.removeCurrentPlaneCover();
    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
    }, 1000)
  }
})

const root = ref(null);
const startCover3d = ref(false);
const scrollZone = ref(null);
const indexLogo = ref(null);
const job = ref(null);
const scrollDown = ref(null);
const scrollSvg = ref(null);

// const { initLogoObserver, clearLogoObserver } = useLogoObserver();
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { 
  // firstPassProps, 
  // onFirstPassReady, 
  // onFirstPassRender, 
  // onRender, 
  updateScrollVelocity
} = useCurtainsShader();

const scrollVelocity = toRef(props, 'scrollVelocity');
watch(scrollVelocity, (newVal, oldVal) => {
  if (storeDatasCurtains.scrollToTopCompleteAfterTransition)
    updateScrollVelocity(newVal)
})

const onClickProjectItem = (id, plane) => {
  storeDatasCurtains.currentPlaneCover = plane
  storeDatasCurtains.scrollToTopCompleteAfterTransition = false
  console.log('onClickProjectItem', id, plane);
}

onMounted(() => {
  // ERROR: After page is unmounted, 
  // and then mounted again, 
  // root.value is not null, but I can't access its offsetHeight nor getBoundingClientRect()
  // in console.log, it's not null, but I can't right click on it to inspect it
  console.log('INDEX PAGE - MOUNTED', root.value);

  gsap.set(indexLogo.value, { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })
  gsap.set(job.value, { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })

  const tl = gsap.timeline()
  tl
    .to(job.value, { delay: 0.5, opacity: 1 })
    .to(job.value, { opacity: 0 }, '+=1')
    .to(indexLogo.value, { opacity: 1, 
      onComplete: () => {
        startCover3d.value = true
        console.log('emit onStartCover3d', true);
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

onUnmounted(() => {
  // clearLogoObserver()
  clearScrollReveal()
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
  
.logo{
  position: absolute;
  width: 170px;
  opacity: 0;
}

.job {
  position: absolute;
  opacity: 0;
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media only screen and (min-width: 768px) {
  .logo{
    width: 250px;
  }
}

.projects-home {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  z-index: $z-projects;
  margin-top: 50px;
}
</style>