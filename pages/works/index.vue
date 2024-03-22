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
import gsap from 'gsap';
import { workTransition, durationEnterWork, durationLeaveWork } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
import Pagination from '~/components/ui/Pagination.vue';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const props = defineProps({
  onRender: {
    type: Function,
    required: true,
  }
})

const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback, curtainsForTransition, backgroundForTransition } = useTransitionComposable();

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

  /***************
   * CURTAINS EXAMPLE !!!:
   *  */ 
  // https://www.curtainsjs.com/examples/gsap-click-to-fullscreen-gallery/index.html
  
  /* const lerp = (v0, v1, t) => {
   return v0 + t * (v1 - v0);
  }

  console.log(`rect.top: ${rect.top}px, rect.left: ${rect.left}px`);
  console.log(`lerp top: ${lerp(0, -rect.top, 1)}px, lerp left: ${lerp(0, -rect.left, 1)}px`);
  console.log('scroll current', window.scrollY, 'scroll before', storeDatas.scrollY);

  const scrollYBefore = storeDatas.scrollY; // if scroll is set to 0, we need to keep the previous scrollY
  // const scrollYBefore = 0;
  // imagePlane.planeMesh.relativeTranslation.x = -rect.left;
  // imagePlane.planeMesh.relativeTranslation.y = -rect.top;

  // create vectors only once and use them later on during tween onUpdate callback
  const newScale = new Vec2();
  const newTranslation = new Vec3();
  
  imagePlane.planeMesh.setTransformOrigin(newTranslation);
  const planeBoundingRect = imagePlane.planeMesh.getBoundingRect();
  const curtainBoundingRect = storeDatasCurtains.curtains.getBoundingRect();

  console.log('rect', rect);
  console.log('rectFinal', rectFinal);
  console.log(`scaleX: ${rectFinal.width / rect.width}, scaleY: ${rectFinal.height / rect.height}`);
  console.log('planeBoundingRect', planeBoundingRect);
  console.log('curtainBoundingRect', curtainBoundingRect);

  // starting values
  const animation = {
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      transition: 0,
      textureScale: 1, //1.5,
      mouseX: 0,
      mouseY: 0,
      zoom: imagePlane.planeMesh.uniforms.uScale.value,
  };

  const tl = gsap.to(animation, {
    scaleX: rectFinal.width / rect.width,
    scaleY: rectFinal.height / rect.height,
    // scaleX: rectFinal.height / rect.height,
    // scaleY: rectFinal.width / rect.width,
    translationX: -1 * rect.left / storeDatasCurtains.curtains.pixelRatio,
    // translationY: -1 * rect.top / storeDatasCurtains.curtains.pixelRatio,
    translationY: -1 * (rect.top - scrollYBefore) / storeDatasCurtains.curtains.pixelRatio,
    transition: 1,
    textureScale: 1,
    zoom: 1, // zoom from rollover
    mouseX: 0,
    mouseY: 0,
    duration: durationLeaveWork,
    ease: 'power4.out',
    onUpdate: () => {
      // imagePlane.planeMesh.relativeTranslation.x = lerp(0, -rect.left, t.v);
      // imagePlane.planeMesh.relativeTranslation.y = lerp(0, -rect.top + scrollYBefore, t.v);
      // console.log('expandCover onUpdate', tl.progress());
      
      // plane scale
      newScale.set(animation.scaleX, animation.scaleY);
      imagePlane.planeMesh.setScale(newScale);

      // plane translation
      newTranslation.set(animation.translationX, animation.translationY, 0);
      imagePlane.planeMesh.setRelativeTranslation(newTranslation);

      // texture scale
      newScale.set(animation.textureScale, animation.textureScale + 0.5);
      imagePlane.planeMesh.textures[0].setScale(newScale);

      // transition value
      imagePlane.planeMesh.uniforms.uCoverProgress.value = animation.transition;
      imagePlane.planeMesh.uniforms.uScale.value = animation.zoom;

      // apply parallax to change texture offset
      // applyPlanesParallax(plane);

      // // tween mouse position back to center
      // imagePlane.planeMesh.uniforms.mousePosition.value.set(animation.mouseX, animation.mouseY);

      // imagePlane.planeMesh.uniforms.uCoverProgress.value = tl.progress();
      // imagePlane.resize();
      // imagePlane.updateRatioUniforms(imagePlane.planeMesh);

      // apply parallax to change texture offset
      // applyPlanesParallax(imagePlane.planeMesh);

    },
    onComplete: () => {
      debugger
      // imagePlane.resize();
      backgroundForTransition.imgData = curtainsForTransition.curtains.canvas.toDataURL();
      backgroundForTransition.element.style.backgroundImage = `url(${backgroundForTransition.imgData})`
      console.log('expandCover onComplete');
    }
  })

  function applyPlanesParallax(plane) {
      // calculate the parallax effect
      // get our window size
      const sceneBoundingRect = storeDatasCurtains.curtains.getBoundingRect();
      // get our plane center coordinate
      const planeBoundingRect = plane.getBoundingRect();
      const planeOffsetTop = planeBoundingRect.top + planeBoundingRect.height / 2;
      // get a float value based on window height (0 means the plane is centered)
      const parallaxEffect = (planeOffsetTop - sceneBoundingRect.height / 2) / sceneBoundingRect.height;

      // set texture offset
      const texture = plane.textures[0];
      texture.offset.y = (1 - texture.scale.y) * 0.5 * parallaxEffect;
  } */
  /**
   * END - CURTAINS EXAMPLE
  *********/
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
    // width: rectFinal.width - 300, // debug
    width: rectFinal.width,
    height: rectFinal.height,
    onUpdate: () => {
      imagePlane.resize();
      imagePlane.planeMesh.uniforms.uCoverProgress.value = tl.progress();
      imagePlane.planeMesh.uniforms.uScale.value = lerp(scale, 1, tl.progress())
      // console.log('expandCover onUpdate', tl.progress());
      // console.log('scale', imagePlane.planeMesh.uniforms.uScale.value);
    },
    onComplete: () => {
      imagePlane.resize();

      backgroundForTransition.imgData = curtainsForTransition.curtains.canvas.toDataURL();
      backgroundForTransition.element.style.backgroundImage = `url(${backgroundForTransition.imgData})`

      // imagePlane.planeMesh.watchScroll = false;
      // console.log('expandCover onComplete');
      // storeDatasCurtains.curtains.disableDrawing();
    }
  })
}

onBeforeUnmount(() => {  
  // console.log('WORKS onBeforeUnmount');
  clearScrollReveal()

  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');

  const closePanels = () => {
    // console.log('WORKS closePanels');
    storeDatasCurtains.removePlanes();

    // if has cover, expand it
    if (selectedImagePlane) {
      // console.log('WORKS closePanels expandCover');
      expandCover(selectedImagePlane)
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