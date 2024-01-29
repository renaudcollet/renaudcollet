<template>
  <div class="work-item-small" ref="el">
    <div class="work-item-small__image">
      <ClientOnly>
        <ImagePlane 
          v-if="mountPlane && !playVideo"
          :src="src" 
          :srcPortrait="srcPortrait"
          :data-zoomable-url="src"
          :onRender="onRender"
          :isVisible="isVisible"
          :class="{'scroll-reveal': !supportsCurtains, 'zoomable': !isVideo}" 
          :data-mouse-cursor="isVideo ? null : 'zoom'"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
          object-fit="cover" 
          alt=""
        />
      </ClientOnly>
      <VideoPlane
          v-if="playVideo"
          class="work-item-small__image__video"
          :src="src" 
          :video-src="videoSrc" 
          :id="titleAlphaNumeric" 
          :play="activateVideo"
          @videoEnded="onVideoEnded"
          @videoOutOfView="onVideoOutOfView"
          @videoPaused="onVideoPaused"
          object-fit="contain" 
          alt=""
      ></VideoPlane>
      <div class="work-item-small__content__button__center">
        <div 
          v-if="isVideo" 
          @click="onClickPlayVideo"
          ref="btnPlay" 
          class="work-item-small__content__button scroll-reveal" 
          data-mouse-cursor="hide"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          <svg x="0px" y="0px" viewBox="-27 -15 162 150">
            <polygon class="triangle-button" points="0,120 60,10 120,120" fill="transparent" stroke="#fff" stroke-width="1" />
            <g>
              <polygon class="triangle" fill="#ffffff" points="84.2,66.4 55.8,79.9 55.8,52.9" />
            </g>
          </svg>
      </div>
      </div>
    </div>
    <div class="work-item-small__content z-index-text" ref="txtContent">
      <div class="work-item-small__content__abs">
        <h3 
          v-if="content.title !== null"
          class="work-item-small__content__title scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ content.title === null ? '' : content.title }}
        </h3>
      </div>
      <div 
        class="work-item-small__content__text scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.2"
        data-scroll-reveal-duration="0.5"
        v-html="content.content === null ? '' : content.content"
      ></div>
    </div>
  </div>
</template>

<script setup>
/* 
  Component : Titre / Resume / Image / Video 
*/

import ImagePlane from '~/components/webgl/ImagePlane.vue';
import VideoPlane from '~/components/video/VideoPlane.vue';
import useElementVisibility from '~/compositions/use-element-visibility';
// import utilsDevice from '~~/mixins/utils-device.js';
// import zoomable from '~~/mixins/zoomable-image.js';
import gsap from 'gsap';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  srcPortrait: {
    type: String,
    required: false,
    default: null
  },
  videoSrc: {
    type: String,
    required: false,
    default: null
  },
  content: {
    type: Object,
    required: true,
  },
  onRender: {
    type: Function,
    required: true,
  },
  supportsCurtains: {
    type: Boolean,
    required: false,
    default: true,
  },
  mountPlanes: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    required: false,
    default: 0,
  }
})


const el = ref(null);
const mountPlane = toRef(props, 'mountPlanes');
const btnPlay = ref(null);
const txtContent = ref(null);
const playVideo = ref(false);
const activateVideo = ref(false);
const titleAlphaNumeric = computed(() => {
  return toAlphaNumeric(props.content.title);
})

const isVideo = computed(() => {
  if (!props.videoSrc)
    return false;
  else 
    return true;
})

const visibilityObserver = useElementVisibility(el);
const isVisible = visibilityObserver.isVisible;
watch(isVisible, (newVal, oldVal) => {
  if (newVal) {
    visibilityObserver.observer.stop();
  }
})

const toAlphaNumeric = (str) => {
  return str.replace(/[^0-9a-zA-Z_]/gi, '');
}

const onClickPlayVideo = () => {
  playVideo.value = true;

  const t = {v: 0}
  // Hide the block, after the css animation is complete
  gsap.to(t, {
    delay: 0.0,
    v: 1,
    onComplete: () => {
      activateVideo.value = true;
      
      // const el = this.$el.querySelector('.work-item-small__content');
      gsap.to(btnPlay.value, {
        duration: 0.3,
        autoAlpha: 0,
        transform: 'translateY(50px)',
        ease: 'power2.inOut',
      })

      // if (!this.isPortrait)
      //   window.lenis.scrollTo(`#${this.titleAlphaNumeric}`);
    }
  })
}

const onVideoEnded = () => {
  onVideoOutOfView()
}

const onVideoPaused = () => {
  onVideoOutOfView()
}

const onVideoOutOfView = () => {
  playVideo.value = false;
  activateVideo.value = false;
  gsap.to(btnPlay.value, {
    duration: 0.3,
    autoAlpha: 1,
    transform: 'translateY(0px)',
    ease: 'power2.inOut',
  })
}

// onMounted(() => {
//   console.log(`-> workitemsmall (projectitem${ props.index}) mounted`, props.src);
// })

// onBeforeUnmount(() => {
//   visibilityObserver.observer.stop();
// })
</script>

<style></style>