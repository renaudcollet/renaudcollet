<template>
  <div ref="root">
    <div class="container">
      <!-- <div class="container__header-minimize" data-header-scroll-minimize></div> -->
      <h1 
        class="page__title scroll-reveal unmount-animation"
        data-scroll-reveal-opacity-y
        :data-scroll-reveal-delay="durationEnterWork + 0.2"
        data-scroll-reveal-duration="0.5"
      >
        Some 
        <br v-if="projectsFilteredLabelDelay !== ''" />
        <span class="filtered-label">{{ projectsFilteredLabelDelay }}</span>
        <br v-if="projectsFilteredLabelDelay !== ''" /> 
        works
      </h1>
      <Pagination
        v-if="totalPages > 1"
        class="scroll-reveal unmount-animation"
        data-scroll-reveal-opacity-y
        :data-scroll-reveal-delay="durationEnterWork + 0.3"
        data-scroll-reveal-duration="0.5"
        :totalPages="totalPages"
        :currentPage="currentPage"
        @onPageUpdate="onPageUpdate"
      />
      <section class="projects-work">
        <!-- <template v-for="(item, index) in storeDatas.projectsFiltered"> -->
        <template v-for="(item, index) in projectsFilteredDelay">
          <ProjectItem 
            class="projects-home__item unmount-animation"
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
    <Pagination
      v-if="totalPages > 1"
      class="scroll-reveal unmount-animation"
      data-scroll-reveal-opacity-y
      :data-scroll-reveal-delay="durationEnterWork + 0.2"
      data-scroll-reveal-duration="0.5"
      :totalPages="totalPages"
      :currentPage="currentPage"
      @onPageUpdate="onPageUpdate"
    />
    <!-- <BackToTop /> -->
    <FooterSimple />
  </div>
</template>
  
<script setup>
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import useSeo from '~/compositions/use-seo';
import gsap from 'gsap';
import { workTransition, durationEnterWork, durationLeaveWork } from '~/transitions/work-transition';
import { expandCover } from '~/transitions/expand-cover';
import { useTransitionComposable } from '~/compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
import Pagination from '~/components/ui/Pagination.vue';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

useSeo({
  title: 'Projets',
  description: "Sélection de projets web, WebGL et DOOH réalisés en freelance : sites internet, expériences interactives et dispositifs événementiels.",
  image: storeDatas.accueil.data.attributes.cover,
});

const props = defineProps({
  onRender: {
    type: Function,
    required: true,
  }
})

const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback } = useTransitionComposable();

const projectsFilteredDelay = ref(null);
// projectsFilteredDelay.value = storeDatas.projectsFiltered;
projectsFilteredDelay.value = storeDatas.projectsFilteredPagination;

const totalPages = ref(storeDatas.paginationTotalPages);
const currentPage = ref(storeDatas.paginationCurrentPage);

watch(() => storeDatas.paginationTotalPages, (newVal, oldVal) => {
  console.log('watch paginationTotalPages', newVal);
  totalPages.value = newVal;
})

watch(() => storeDatas.paginationCurrentPage, (newVal, oldVal) => {
  console.log('watch paginationCurrentPage', newVal);
  currentPage.value = newVal;
})

// Select filter
// watch(() => storeDatas.projectsFiltered, (newVal, oldVal) => {
//   console.log('watch projectsFiltered', newVal, oldVal);
//   nextTick(() => {
//     updateProjectsView(newVal)
//   })
// })
watch(() => storeDatas.projectsFilteredPagination, (newVal, oldVal) => {
  console.log('watch projectsFilteredPagination', newVal.length);
  nextTick(() => {
    updateProjectsView(newVal)
  })
})

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

watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;
    // console.log('WORKS Transition complete');
      
    updateFilteredLabel()

    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;

      if (storeDatas.scrollY > 0) {
        emit('onLockScroll', false, true, storeDatas.scrollY)
        storeDatas.scrollY = 0
      } else
        emit('onLockScroll', false)
    }, 100)
  }
})

const root = ref(null);

const updateProjectsView = (newVal) => {
    if (process.server) return

    clearScrollReveal()
    projectsFilteredDelay.value = null
    // storeDatasCurtains.removePlanes()

    emit('onLockScroll', false, false)
    
    elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');
    gsap
      .to(elementsToTransition.elements ? elementsToTransition.elements : el, { 
        opacity: 0, delay: 0, /* duration: 0.3, */
        // y: '-15',
        stagger: {
          each: 0.1,
          ease: 'power2.outIn',
        },
        onComplete:() => {
          console.log('filter onLeave opacity 0 complete');
          // toggleTransitionLeaveComplete(true); // This is not watched because the component is already unmounted
          elementsToTransition.elements = null;

          storeDatasCurtains.removePlanes();
          
          const t = {v: 0}
          gsap.to(t, { v: 1, delay: 0.1, duration: durationLeaveWork,
            onComplete:() => {
              console.log('filter onLeave complete');
              updateFilteredLabel(newVal)

              nextTick(() => {
                // Add if condition in case user change page quickly, because we are in a setTimeout
                initScrollReveal(root.value)
              })
            }})
      }})
}

const updateFilteredLabel = (newVal) => {
  // projectsFilteredDelay.value = newVal ? newVal : storeDatas.projectsFiltered
  projectsFilteredDelay.value = newVal ? newVal : storeDatas.projectsFilteredPagination
  projectsFilteredLabelDelay.value = 
    storeDatas.keywordsSelected && storeDatas.keywordsSelected.length > 0 
    ? `${storeDatas.keywordsSelected[0].attributes.key}` 
    : '';
}

let selectedImagePlane = null

const onClickProjectItem = (id, imagePlane) => {
  selectedImagePlane = imagePlane
  storeDatasCurtains.setCurrentPlaneCover(imagePlane.planeMesh)
  storeDatas.scrollY = window.scrollY
  // imagePlane.planeMesh.watchScroll = false;
  // window.lenis.scrollTo(0, {immediate: true})
  emit('onLockScroll', true)
}

const onPageUpdate = (page) => {
  console.log('onPageUpdate', page);
  storeDatas.projectsByPage(page);
}

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onBeforeUnmount(() => {  
  // console.log('WORKS onBeforeUnmount');
  clearScrollReveal()

  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');

  const closePanels = () => {
    // console.log('WORKS closePanels');
    storeDatasCurtains.removePlanes();

    // if has cover, expand it, the leave transition waits for it
    if (selectedImagePlane && storeDatasCurtains.currentPlaneCover) {
      return expandCover(storeDatasCurtains.currentPlaneCover)
    }
  }

  functionTransitionCallback.function = closePanels;
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
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;

  &__header-minimize {
    position: absolute;
    top: 30vh;
    width: 10px;
    height: 10px;
  }
}
</style>