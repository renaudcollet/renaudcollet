<template>
  <div ref="root">
    <!-- <ClientOnly>
      <ShaderPass 
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
      />
    </ClientOnly> -->
    <div class="container">
      <!-- <div class="container__header-minimize" data-header-scroll-minimize></div> -->
      <h1 
        class="page__title scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.0"
        data-scroll-reveal-duration="0.5"
      >
        All my <br v-if="projectsFilteredLabelDelay !== ''" /><span class="filtered-label">{{ projectsFilteredLabelDelay }}</span> <br v-if="projectsFilteredLabelDelay !== ''" /> works
      </h1>
      <section class="projects-work">
        <!-- <template v-for="(item, index) in storeDatas.projectsFiltered"> -->
        <template v-for="(item, index) in projectsFilteredDelay">
          <ProjectItem 
            class="projects-home__item"
            :id="index" 
            :to="`/works/${item.attributes.slug}`"
            :datas="item"
            :onRender="onRender"
            :mountPlanes="bMountPlanes"
            @onClick="onClickProjectItem"
          />
        </template>
      </section>
      <div class="space"></div>
    </div>
    <FooterSimple />
  </div>
</template>
  
<script setup>
// import { ShaderPass } from 'vue-curtains';
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
// import useLogoObserver from '~/compositions/use-logo-observer';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';
import { workTransition } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const props = defineProps({
  scrollVelocity: {
    type: Number
  },
  onRender: {
    type: Function,
    required: true,
  }
})

const projectsFilteredDelay = ref(null);
projectsFilteredDelay.value = storeDatas.projectsFiltered;

const projectsFilteredLabelDelay = ref(null);
projectsFilteredLabelDelay.value = '';

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: workTransition,
});

const emit = defineEmits(['onLockScroll'])

// Curtains
const storeDatasCurtains = useDatasCurtainsStore();
const bMountPlanes = computed(() => {
  return storeDatasCurtains.planesToRemove.length === 0;
});
const { transitionState } = useTransitionComposable();
watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    // emit('onLockScroll', false)
    storeDatasCurtains.removePlanes();
  }
})

const root = ref(null);
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

// Select filter
watch(() => storeDatas.projectsFiltered, (newVal, oldVal) => {
  console.log('watch projectsFiltered', newVal, oldVal);
  nextTick(() => {
    clearScrollReveal()
    projectsFilteredDelay.value = null

    nextTick(() => {
      storeDatasCurtains.removePlanes()

      emit('onLockScroll', false, true)
    })
    
    setTimeout(() => {
      projectsFilteredDelay.value = newVal
      projectsFilteredLabelDelay.value = 
        storeDatas.keywordsSelected && storeDatas.keywordsSelected.length > 0 
        ? `${storeDatas.keywordsSelected[0].attributes.key}` 
        : '';

      nextTick(() => {
        initScrollReveal(root.value)
      })
    }, 150)
  })
})

const onClickProjectItem = (id, plane) => {
  storeDatasCurtains.currentPlaneCover = plane
  console.log('onClickProjectItem', id, plane)
  console.log('emit onLockScroll', false)
  emit('onLockScroll', false)
}

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onUnmounted(() => {
  clearScrollReveal()
})
</script>
  
<style lang="scss" scoped>
.projects-work {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  align-items: center;
  z-index: $z-projects;
  min-height: 100vh;
}

.filtered-label {
  font-style: italic;
}

.space {
  height: 10vh;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &__header-minimize {
    position: absolute;
    top: 30vh;
    width: 10px;
    height: 10px;
  }
}
</style>