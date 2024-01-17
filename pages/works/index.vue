<template>
  <div ref="root">
    <div class="container">
      <!-- <div class="container__header-minimize" data-header-scroll-minimize></div> -->
      <h1 
        class="page__title scroll-reveal"
        data-scroll-reveal-opacity-y
        :data-scroll-reveal-delay="durationEnterDefault + 0.2"
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
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
// import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';
import { workTransition, durationEnterDefault } from '../transitions/work-transition';
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
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;

    storeDatasCurtains.removePlanes();

    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
      storeDatasCurtains.removeCurrentPlaneCover()
    }, 100)

    setTimeout(() => {
      if (root.value) {
        // Add if condition in case user change page quickly, because we are in a setTimeout
        initScrollReveal(root.value)
      }
    }, 500)
  }
})

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
// const { 
//   // firstPassProps, 
//   // onFirstPassReady, 
//   // onFirstPassRender, 
//   // onRender, 
//   updateScrollVelocity
// } = useCurtainsShader();

// const scrollVelocity = toRef(props, 'scrollVelocity');
// watch(scrollVelocity, (newVal, oldVal) => {
//   if (storeDatasCurtains.scrollToTopCompleteAfterTransition)
//     updateScrollVelocity(newVal)
// })

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
    }, 150)
    
    setTimeout(() => {
      nextTick(() => {
        initScrollReveal(root.value)
      })
    }, 500)
  })
})

const onClickProjectItem = (id, plane) => {
  storeDatasCurtains.setCurrentPlaneCover(plane)
  console.log('onClickProjectItem', id, plane)
  console.log('emit onLockScroll', false)
  emit('onLockScroll', true)
}

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })
})

onUnmounted(() => {
  clearScrollReveal()
  storeDatasCurtains.removePlanes()
})
</script>
  
<style lang="scss" scoped>
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