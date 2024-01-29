<template>
  <div ref="root" class="page page-work-id">
    <div class="btn-back" ref="btnBack" @click="onBtnBackClick" @mouseover="onBtnBackHover" @mouseout="onBtnBackOut"></div>
    <section class="cover-top">
      <div class="cover-top__image">
        <ImagePlane 
          v-if="storeDatasCurtains.planesToRemove.length === 0"
          :src="config.public.backendUrl + xxlarge"
          :srcPortrait="config.public.backendUrl + xlarge"
          :onRender="onRender"
          :isVisible="true"
          :skip-animation="skipCoverAnimation"
          object-fit="cover" 
          class="project-item__image" 
          ref="imagePlane"
          @ready="onCoverReady"
        />
        <!-- <div id="render-cover" ref="renderCover" class="render-cover"></div> -->
      </div>
      <div class="cover-top__title z-index-text">
        <div class="cover-top__title__header-minimize" data-header-scroll-minimize></div>
        <h1 
          class="cover-top__title__project scroll-reveal unmount-animation"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterWorkId"
          data-scroll-reveal-duration="0.7"
        >
          <span class="front" :style="{'color': titleColor}">{{ currentProject.attributes.titre }}</span>
          <span class="back" :style="{'color': titleColorBack}">{{ currentProject.attributes.titre }}</span>
        </h1>
        <div
          class="cover-top__title__brand scroll-reveal unmount-animation"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterWorkId + 0.2"
          data-scroll-reveal-duration="0.3"
        >
          <span class="front" :style="{'color': titleColor}">Client : {{ currentProject.attributes.brand }}</span>
          <span class="back" :style="{'color': titleColorBack}">Client : {{ currentProject.attributes.brand }}</span>
        </div>
        <div
          class="cover-top__title__brand scroll-reveal unmount-animation"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterWorkId + 0.5"
          data-scroll-reveal-duration="0.3"
        >
          <span class="front" :style="{'color': titleColor}">Agency : {{ currentProject.attributes.agency }}</span>
          <span class="back" :style="{'color': titleColorBack}">Agency : {{ currentProject.attributes.agency }}</span>
        </div>
        <div
          class="cover-top__title__filters scroll-reveal unmount-animation"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterWorkId + 0.8"
          data-scroll-reveal-duration="0.3"
          :style="{'color': titleColor}"
        >
          Filters : 
          <span v-for="(item, index) in keywords">
            {{ index < keywords.length - 1 ? `${item.attributes.key}, ` : item.attributes.key }}
          </span>
        </div>
      </div> 
    </section>
    <section class="projects unmount-animation">
      <template v-for="(item, index) in currentProjectBlocs">
        <WorkItemTitleResume
          v-if="item.Image.data === null && item.Video.data === null"
          :index="index" 
          :title="item.Titre || ''"
          :content="item.Resume || ''"
          :type="item.type"
        />
        <WorkItemBig
          v-else-if="item.type === 'Big'"
          :index="index" 
          :src="item.Image.data ? getImageUrl(item.Image.data.attributes.formats) : null" 
          :srcPortrait="item.Image.data ? getImageUrlPortrait(item.Image.data.attributes.formats) : null"
          :video-src="item.Video.data ? config.public.backendUrl + item.Video.data.attributes.url : null"
          :title="item.Titre || ''"
          :content="item.Resume || ''"
          :onRender="onRender"
          :mountPlanes="bMountPlanes"
        />
        <WorkItemSmall
          v-else-if="item.type === 'Small'"
          :index="index" 
          :src="item.Image.data ? getImageUrl(item.Image.data.attributes.formats) : null" 
          :srcPortrait="item.Image.data ? getImageUrlPortrait(item.Image.data.attributes.formats) : null"
          :video-src="item.Video.data ? config.public.backendUrl + item.Video.data.attributes.url : null"
          :content="{title: item.Titre, content: item.Resume}" 
          :class="{'right': index%4 === 0, 'left': index%4 === 2}"
          :onRender="onRender"
          :mountPlanes="bMountPlanes"
        />
      </template>
    </section>      
  </div>
</template>
  
<script setup>
import { useDatasStore, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import useZoomableImage from '~/compositions/use-zoomable-image';
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import gsap from 'gsap';
import { workIdTransition, durationEnterWorkId, durationLeaveWorkId } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
// import { RenderTarget, Plane } from 'curtainsjs';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
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
const { initZoomableImage, clearZoomableImage } = useZoomableImage();
const { transitionState, elementsToTransition, functionTransitionCallback, backgroundForTransition } = useTransitionComposable();

const getImageUrl = (formats) => {
  if (formats.xxlarge !== undefined) return config.public.backendUrl + formats.xxlarge.url;
  else if (formats.xlarge !== undefined) return config.public.backendUrl + formats.xlarge.url;
  else if (formats.large !== undefined) return config.public.backendUrl + formats.large.url;
  else return config.public.backendUrl + formats.url;
}

const getImageUrlPortrait = (formats) => {
  if (formats.xlarge !== undefined) return config.public.backendUrl + formats.xlarge.url;
  else if (formats.large !== undefined) return config.public.backendUrl + formats.large.url;
  else return config.public.backendUrl + formats.url;
}

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: workIdTransition,
});

const emit = defineEmits(['onLockScroll'])

const root = ref(null);
const imagePlane = ref(null);
// const renderCover = ref(null);
const btnBack = ref(null);

// Curtains
const storeDatasCurtains = useDatasCurtainsStore();
const bMountPlanes = ref(false);

watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    // console.log('PAGE ID - transitionState.transitionComplete', storeDatasCurtains.scrollY);
    
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;

    // To keep the same plane from project item
    // storeDatasCurtains.currentPlaneCover.resetPlane(renderCover.value)
    // storeDatasCurtains.currentPlaneCover.watchScroll = true
    // emit('onLockScroll', false)

    gsap.killTweensOf('#header-logo')
    gsap.to('#header-logo', { autoAlpha: 1 })

    setTimeout(() => {
      if (root.value) {
        // Add if condition in case user change page quickly, because we are in a setTimeout
        // initScrollReveal(root.value)
        initZoomableImage(root.value)
      }
    }, 500)
  }
})

const onCoverReady = (e) => {
  setTimeout(() => {
    console.log('---> onCoverReady', e);
    storeDatasCurtains.removeCurrentPlaneCover()
    storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
    bMountPlanes.value = true;

    // Remove image background
    backgroundForTransition.imgData = null
    backgroundForTransition.element.style.backgroundImage = `none`

    showBtnBack()
    emit('onLockScroll', false)
  }, 250)
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const datasProjets = storeDatas.projects;

const currentProject = datasProjets.find(project => {
  return project.attributes.slug === route.params.id
})

const currentProjectCover = currentProject.attributes.cover.data.attributes
const currentProjectBlocs = currentProject.attributes.bloc
const keywords = currentProject.attributes.keywords.data

// const coverSrc = computed(() => {
//   return currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;
// })
const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
// const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;

console.log('IMAGE COVER URL', xxlarge);

const skipCoverAnimation = computed(() => {
  return storeDatas.previousPage !== null
})

const titleColor = computed(() => {
  return currentProject.attributes.titleColor;
})

const titleColorBack = computed(() => {
  return currentProject.attributes.titleColorBack;
})

const showBtnBack = () => {
  gsap.set(btnBack.value, {y: 10, opacity: 0, force3D: true})
  gsap.to(btnBack.value, {y: 0, opacity: 1, force3D: true, duration: 0.5, delay: 0.1, ease: 'quad2.inOut'})
}

const onBtnBackHover = () => {
  gsap.to(btnBack.value, {scale: 1.1, force3D: true, duration: 0.3, ease: 'quad2.inOut'})
}
const onBtnBackOut = () => {
  gsap.to(btnBack.value, {scale: 1, force3D: true, duration: 0.3, ease: 'quad2.inOut'})
}

const onBtnBackClick = () => {
  emit('onLockScroll', true)
  if (storeDatas.previousPage === '/') 
    router.push({ name: 'index' })
  else
    router.push({ name: 'works' })
}

onMounted(() => {
  console.log('WORK ID PAGE - MOUNTED');
  emit('onLockScroll', true)

  bMountPlanes.value = storeDatasCurtains.planesToRemove.length === 0;

  // gtag
  // https://developers.google.com/tag-platform/gtagjs/reference/events?hl=fr#page_view -> should I use page_view ?
  // https://github.com/johannschopplich/nuxt-gtag
  // const route = useRoute()
  // useTrackEvent('work-id-page', route.params.id)

  // Create plane cover for curtains
  // https://www.curtainsjs.com/render-target-class.html#basic-usage
  // console.log('imagePlane', imagePlane.value);
  // create a new render target using our curtains object
  // const renderTarget = new RenderTarget(storeDatasCurtains.curtains)
  // // add our plane to our frame buffer object
  // storeDatasCurtains.currentPlaneCover.setRenderTarget(renderTarget)

  // const coverElement = renderCover.value //document.getElementById('render-cover')
  // console.log('coverElement', coverElement);
  // const renderPlane = new Plane(storeDatasCurtains.curtains, coverElement, {
  //   vertexShaderID: 'render-plane-vs',
  //   fragmentShaderID: 'render-plane-fs',
  //   widthSegments: 1,
  //   heightSegments: 1,
  //   uniforms: {
  //     uTexture: {
  //       value: renderTarget.textures[0],
  //     },
  //     uAlpha: {
  //       value: 1,
  //     },
  //   },
  // })

  // renderPlane.onReady(() => {
  //   const renderTexture = renderPlane.createTexture({
  //     sampler: 'uTexture',
  //     fromTextureSource: renderTarget.getTexture(),
  //   })
  // })

  nextTick(() => {
    if (skipCoverAnimation.value) {
      gsap.killTweensOf('#header-logo')
      gsap.to('#header-logo', { autoAlpha: 1 })
      initZoomableImage(root.value)
    }
    initScrollReveal(root.value)
  })
})

onBeforeUnmount(() => {  
  console.log('WORK ID onBeforeUnmount');
  gsap.to(btnBack.value, {y: 0, opacity: 0, force3D: true, duration: 0.3, ease: 'quad2.inOut'})

  clearScrollReveal()
  clearZoomableImage()
    
  elementsToTransition.elements = root.value.querySelectorAll('.unmount-animation');
  console.log('ELEMENTS TO UNMOUNT TRANSITION', elementsToTransition.elements.length);

  const closePanels = () => {
    console.log('WORK ID closePanels');
    storeDatasCurtains.removePlanes();
    storeDatasCurtains.removeCurrentPlaneCover();
  }

  functionTransitionCallback.function = closePanels;

  emit('onLockScroll', true)
})

// onUnmounted(() => {
//   clearScrollReveal()
//   clearZoomableImage()
//   // Note: imageplane disappear animation is in dataCurtains.js
//   // storeDatasCurtains.removePlanes()
//   emit('onLockScroll', true)
// })
</script>