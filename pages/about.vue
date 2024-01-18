<template>
  <div ref="root" class="page">
    <section id="about">
      <div class="block">
        <div class="header-minimize" data-header-scroll-minimize></div>

        <div class="page__header">
          <ImagePlane 
            v-if="bMountPlanes"
            :src="config.public.backendUrl + xxlarge"
            :onRender="onRender"
            :isVisible="true"
            object-fit="cover" 
            class="cover__image" 
            ref="imagePlane"
          />
          <h1 
            class="page__title scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="durationEnterDefault + 0.2"
            data-scroll-reveal-duration="0.5"
          >
            {{ datasAbout.attributes.titre }}
          </h1>
        </div>
        <div
          class="description scroll-reveal"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterDefault + 0.5"
          data-scroll-reveal-duration="0.5"
          v-html="datasAbout.attributes.description"
        >
        </div>
      </div>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import { useDatasStore, S_DATA_ABOUT } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';
import { defaultTransition, durationEnterDefault } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
import ImagePlane from '~/components/webgl/ImagePlane.vue';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ABOUT);

const props = defineProps({
  onRender: {
    type: Function,
    required: true,
  },
})

const datasAbout = storeDatas.about.data;
const config = useRuntimeConfig()

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback } = useTransitionComposable();

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: defaultTransition,
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
    storeDatasCurtains.removePlanes();
    storeDatasCurtains.removeCurrentPlaneCover();
    emit('onLockScroll', false)
    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
    }, 1000)
  }
})

const currentProjectCover = datasAbout.attributes.cover.data.attributes

// const coverSrc = computed(() => {
//   return currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;
// })
const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;


onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onBeforeUnmount(() => {  
  console.log('ABOUT onBeforeUnmount');
  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.scroll-reveal');

  const closePanels = () => {
    console.log('ABOUT closePanels');
    storeDatasCurtains.removePlanes();
    storeDatasCurtains.removeCurrentPlaneCover();
  }

  functionTransitionCallback.function = closePanels;
})

onUnmounted(() => {
  clearScrollReveal()
  // storeDatasCurtains.removePlanes()
})
</script>

<style lang="scss" scoped>
.header-minimize {
  position: absolute;
  top: 30vh;
  width: 10px;
  height: 10px;
}

.page__header {
  width: 700px;
  height: 360px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cover__image {
  width: 700px;
  height: 360px;
  position: absolute;
}

.page__title {
  position: relative;
  margin: 0;
  padding: 0;
  z-index: 10;
  width: 100%;
}

#about {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 60px;

  @include media-breakpoint-up(lg) {
    margin-bottom: 150px;
  }

  .block {
    width: 80%;
    margin-right: auto;
    margin-left: auto;
    margin-bottom: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    @include media-breakpoint-up(lg) {
      width: 700px;
    }

    .description {
      font-size: $font-size-text-sm;
      line-height: $font-line-height-sm;
      color: #928282;

      @include media-breakpoint-up(md) {
        font-size: $font-size-text-md;
        width: 700px;
      }

      @include media-breakpoint-up(lg) {
        font-size: $font-size-text-lg;
      }

      @include media-breakpoint-up(xl) {
        font-size: $font-size-text-xl;
      }
    }
  }

  .row {
    margin-bottom: 50px;
  }

  @include media-breakpoint-up(lg) {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 0;
    }
  }

  @include media-breakpoint-up(xl) {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 0;
    }
  }

}
</style>