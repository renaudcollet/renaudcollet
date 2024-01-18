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
        All my <br v-if="projectsFilteredLabelDelay !== ''" /><span class="filtered-label">{{ projectsFilteredLabelDelay }}</span> <br v-if="projectsFilteredLabelDelay !== ''" /> works
      </h1>
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
    <FooterSimple />
  </div>
</template>
  
<script setup>
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
// import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';
import { workTransition, durationEnterWork, durationLeaveWork } from '../transitions/work-transition';
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

const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback } = useTransitionComposable();

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

watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;
    console.log('WORKS Transition complete');

    emit('onLockScroll', false)
    // storeDatasCurtains.removePlanes();

    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
      // storeDatasCurtains.removeCurrentPlaneCover()
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
      // nextTick(() => {
        initScrollReveal(root.value)
      // })
    }, 500)
  })
})

let selectedImagePlane = null

const onClickProjectItem = (id, imagePlane) => {
  selectedImagePlane = imagePlane
  storeDatasCurtains.setCurrentPlaneCover(imagePlane.planeMesh)
  console.log('onClickProjectItem', id, imagePlane.planeMesh)
  console.log('emit onLockScroll', false)
  emit('onLockScroll', true)
}

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })
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

  // gsap.killTweensOf(planeHtml)
  gsap.set(planeHtml, {
    position: 'fixed', 
    top: `${rect.top}px`,
    left: `${rect.left}px`,
  })

  gsap.to(planeHtml, {
    duration: durationLeaveWork,
    ease: 'power4.out',
    top: `0px`,
    left: `0px`,
    // width: rectFinal.width - 100, // debug
    width: rectFinal.width,
    height: rectFinal.height,
    onUpdate: () => {
      imagePlane.resize();
    },
    onComplete: () => {
      imagePlane.resize();
      imagePlane.planeMesh.watchScroll = false;
      // imagePlane.planeMesh.resetPlane()
      console.log('expandCover onComplete');
    }
  })
}

onBeforeUnmount(() => {  
  console.log('WORKS onBeforeUnmount');
  clearScrollReveal()

  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');

  const closePanels = () => {
    console.log('WORKS closePanels');
    storeDatasCurtains.removePlanes();
    // storeDatasCurtains.removeCurrentPlaneCover();

    // if has cover, expand it
    if (selectedImagePlane) {
      console.log('WORKS closePanels expandCover');
      expandCover(selectedImagePlane)
    }
  }

  functionTransitionCallback.function = closePanels;
})

// onUnmounted(() => {
//   // storeDatasCurtains.removePlanes()
// })
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