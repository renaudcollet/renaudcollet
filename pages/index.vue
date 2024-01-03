<template>
  <div ref="root">
    <div class="cover">
      <Cover3D :start="startCover3d" />
      <div id="index-logo" class="logo" data-header-scroll-minimize>
        <Logo />
      </div>
      <div id="job" class="job">
        Freelance Web Developer
      </div>
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in storeDatas.projectsHomepage" :key="index">
        <ProjectItem 
          class="projects-home__item" 
          :id="index"
          :datas="item"
          :to="`/works/${item.attributes.slug}`"
          :onRender="onRender"
          @onClick="onClickProjectItem"
        />
      </template>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import Cover3D from '~/components/webgl/Cover3D.vue';
import { useDatasStore, S_DATA_ACCUEIL } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import useLogoObserver from '~/compositions/use-logo-observer';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';
import defaultTransition from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';

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

const emit = defineEmits(['onLockScroll'])

const { transitionState } = useTransitionComposable();
watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  console.log('!!!!! watch transitionComplete', newVal, oldVal);
  emit('onLockScroll', false)
})

const root = ref(null);
const startCover3d = ref(false);

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
  updateScrollVelocity(newVal)
})

const onClickProjectItem = (id) => {
  console.log('!!!!!!!!!!!!  ----   onClickProjectItem', id);
  emit('onLockScroll', true)
}

onMounted(() => {
  gsap.set('#index-logo', { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })
  gsap.set('#job', { top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', opacity: 0 })

  const tl = gsap.timeline()
  tl
    .to('#job', { delay: 0.5, opacity: 1 })
    .to('#job', { opacity: 0 }, '+=1')
    .to('#index-logo', { opacity: 1, 
      onComplete: () => {
        startCover3d.value = true
      }}, '+=0.5')
    .to('#index-logo', { opacity: 0, 
      onComplete: () => {
        // initLogoObserver()
      }}, '+=3')
    .to('#header-logo', {
      duration: 1,
      translateX: 0,
      autoAlpha: 1,
      ease: 'power4.out',
    })

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onUnmounted(() => {
  // clearLogoObserver()
  clearScrollReveal()
})
</script>

<style lang="scss" scoped>
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