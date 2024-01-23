<template>
  <div ref="root" class="page">
    <section id="contact">
      <ImagePlane 
        v-if="bMountPlanes"
        :src="config.public.backendUrl + xxlarge"
        :onRender="onRender"
        :isVisible="true"
        object-fit="cover" 
        class="cover__image" 
        ref="imagePlane"
      />
      <div class="header-minimize" data-header-scroll-minimize></div>
      <div class="block">
        <h1 
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="durationEnterDefault + 0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasContact.attributes.titre }}
        </h1>
        <div class="content">
          <span 
            class="description scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="durationEnterDefault + 0.4"
            data-scroll-reveal-duration="0.5"
          >
            {{ datasContact.attributes.description }}
          </span>
          <br />
          <div
            class="link-item scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="durationEnterDefault + 0.5"
            data-scroll-reveal-duration="0.5"
          >
            <a 
              :href="`${datasContact.attributes.linkedin}`" 
              target="_blank"
            >
              LinkedIn
            </a>
          </div>
          <div
            @click="clickShowEmail"
            class="link-item pointer-cursor scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="durationEnterDefault + 0.6"
            data-scroll-reveal-duration="0.5"
          >
            <span
              data-mouse-cursor="hover"
            >Email &nbsp;</span>
            <a
              v-if="showEmail"
              :href="`mailto:${datasContact.attributes.email}`"
            >
              {{ datasContact.attributes.email }}
            </a>
          </div>
          <div
            @click="clickShowTel"
            class="link-item pointer-cursor scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="durationEnterDefault + 0.7"
            data-scroll-reveal-duration="0.5"
          >
            <span
              data-mouse-cursor="hover"
            >Phone &nbsp;</span>
            <a 
              v-if="showTel"
              :href="`tel:${datasContact.attributes.tel}`"
            >
              {{ datasContact.attributes.tel }}
            </a>
          </div>
        </div>
      </div>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, onBeforeUnmount } from "vue";
import { useDatasStore, S_DATA_CONTACT } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';
import { defaultTransition, durationEnterDefault} from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";
import ImagePlane from '~/components/webgl/ImagePlane.vue';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_CONTACT);

const props = defineProps({
  onRender: {
    type: Function,
    required: true,
  },
})

const datasContact = storeDatas.contact.data;
const config = useRuntimeConfig()

const root = ref(null);
const showTel = ref(false)
const showEmail = ref(false)
// const content = ref(null)

const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { transitionState, elementsToTransition, functionTransitionCallback } = useTransitionComposable();

// this is inited before router updates, so we need to get the current page from the store
// const bFromWorkIdPage = storeDatas.currentPage.indexOf('/works/') > -1;
// console.log('PREVIOUS PAGE IS WORK ID ?', bFromWorkIdPage);
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
    console.log('CONTACT Transition complete');
    storeDatasCurtains.scrollToTopCompleteAfterTransition = false;
    emit('onLockScroll', false)
    // storeDatasCurtains.removePlanes();
    // storeDatasCurtains.removeCurrentPlaneCover();
    setTimeout(() => {
      storeDatasCurtains.scrollToTopCompleteAfterTransition = true;
    }, 100)
  }
})

const currentProjectCover = datasContact.attributes.cover.data.attributes

// const coverSrc = computed(() => {
//   return currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;
// })
const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;


const clickShowEmail = () => {
  showEmail.value = true
}

const clickShowTel = () => {
  showTel.value = true
}

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
    // initScrollHeaderMinimize(root.value)
  })
})

onBeforeUnmount(() => {  
  console.log('CONTACT onBeforeUnmount');
  // elementsToTransition.elements = [content.value];
  elementsToTransition.elements = root.value.querySelectorAll('.scroll-reveal');

  const closePanels = () => {
    console.log('CONTACT closePanels');
    storeDatasCurtains.removePlanes();
    storeDatasCurtains.removeCurrentPlaneCover();
  }

  functionTransitionCallback.function = closePanels;
})

onUnmounted(() => {
  clearScrollReveal()
  // clearLogoObserver()
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

.pointer-cursor {
  cursor: pointer;
}

.cover__image {
  position: absolute;
}

.description {
  margin-bottom: 20px;

  @include media-breakpoint-up(lg) {
    margin-left: 10px;
  }
}

.link-item {
  margin-bottom: 13px;
  color: $font-color;

  @include media-breakpoint-up(lg) {
    margin-left: 10px;
  }
}

#contact {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // margin-bottom: 60px;
  height: 100vh;
  user-select: none;

  @include media-breakpoint-up(lg) {
    align-items: flex-start;
  }

  h1 {
    font-size: $font-size-big-title-sm;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;

    @include media-breakpoint-up(md) {
      font-size: $font-size-big-title-md;
      margin-top: 10vh;
      width: 80%;
    }

    @include media-breakpoint-up(lg) {
      font-size: $font-size-big-title-lg;
      // margin-top: 10vh;
      width: 80%;
      text-align: left;
    }

    @include media-breakpoint-up(xl) {
      font-size: $font-size-big-title-xl;
      margin-top: 10vh;
    }
  }

  .content {
    text-align: center;
    font-size: $font-size-text-sm;
    font-weight: 300;
    margin-bottom: 26px;
    user-select: all;
    user-select: none;

    @include media-breakpoint-up(md) {
      text-align: left;
      font-size: $font-size-text-md;
      line-height: 1.15;
      text-align: center;
    }

    @include media-breakpoint-up(lg) {
      text-align: left;
      width: 80%;
      font-size: $font-size-text-lg;
    }

    @include media-breakpoint-up(xl) {
      line-height: 1.15;
      font-size: $font-size-text-xl;
    }
  }

  span {
    display: inline-flex;
  }

  a {
    display: inline-flex;
    text-decoration: none;
    color: $font-color;
  }
}

.block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 296px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  filter: drop-shadow(2px 2px 10px rgba(0, 0, 0, 0.6));

  @include media-breakpoint-up(md) {
    width: 530px;
  }
}
</style>