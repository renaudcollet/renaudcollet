<template>
  <div class="work-item-big" ref="el">
    <div 
      class="work-item-big__image"
      :class="{'scroll-reveal': !supportsCurtains}"
      data-scroll-reveal-opacity-y
      data-scroll-reveal-delay="0.2"
      data-scroll-reveal-duration="0.5"
    >
      <ClientOnly>
        <ImagePlane 
          v-if="mountPlane && !bPlayVideo"
          :src="src"
          :srcPortrait="srcPortrait"
          :video-src="videoSrc" 
          :onRender="onRender"
          :isVisible="isVisible"
          object-fit="cover" 
          alt=""
        />
      </ClientOnly>
      <VideoPlane
          v-if="bPlayVideo"
          class="work-item-big__image__video"
          :src="src" 
          :video-src="videoSrc" 
          :id="titleAlphaNumeric" 
          :play="bActivateVideo"
          :onRender="onRender"
          @videoEnded="onVideoEnded"
          @videoOutOfView="onVideoOutOfView"
          @videoPaused="onVideoPaused"
          object-fit="contain" 
          alt=""
      ></VideoPlane>
    </div>
    <div class="work-item-big__content z-index-text" :class="{'hide': bPlayVideo}" ref="elContent">
      <div class="work-item-big__content__abs">
        <div 
          v-if="isVideo" 
          class="work-item-big__content__button scroll-reveal" 
          data-mouse-cursor="hide"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
          ref="elBtnPlay"
          @click="onClickPlayVideo"
        >
          <svg x="0px" y="0px" viewBox="-27 -15 162 150">
            <polygon class="triangle-button" points="0,120 60,10 120,120" fill="transparent" stroke="#fff" stroke-width="1" />
            <g>
              <polygon class="triangle" fill="#ffffff" points="84.2,66.4 55.8,79.9 55.8,52.9" />
            </g>
          </svg>
        </div>
        <h3 
          class="work-item-big__content__title scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ title }}
        </h3>
      </div>
      <div 
        class="work-item-big__content__text scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.2"
        data-scroll-reveal-duration="0.5"
        v-html="content"
      ></div>
    </div>
  </div>
</template>

<script setup>
/* 
  Component : Titre / Resume / Image / Video 
*/
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import useElementVisibility from '~/compositions/use-element-visibility';
import VideoPlane from '~/components/video/VideoPlane.vue';
import gsap from 'gsap';

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: ''
  },
  content: {
    type: String,
    required: false,
    default: '',
  },
  src: {
    type: String,
    required: false,
    default: null
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
  supportsCurtains: {
    type: Boolean,
    required: false,
    default: true,
  },
  onRender: {
    type: Function,
    required: true,
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

const mountPlane = toRef(props, 'mountPlanes');
const elBtnPlay = ref(null);
const elContent = ref(null);
const bPlayVideo = ref(false);
const bActivateVideo = ref(false);
const titleAlphaNumeric = computed(() => {
  return toAlphaNumeric(props.title);
})

const isVideo = computed(() => {
  if (!props.videoSrc)
    return false;
  else 
    return true;
})

const el = ref(null);

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
  bPlayVideo.value = true;
  console.log('onClickPlayVideo', bPlayVideo.value);

  const t = {v: 0}
  // Hide the block, after the css animation is complete
  gsap.to(t, {
    delay: 0.0,
    v: 1,
    onComplete: () => {
      bActivateVideo.value = true;
      console.log('bActivateVideo', bActivateVideo.value);
      
      // const el = this.$el.querySelector('.work-item-big__content');
      gsap.to(elContent.value, {
        duration: 0.3,
        autoAlpha: 0,
        transform: 'translateY(50px)',
        ease: 'power2.inOut',
      })

      if (window.innerWidth > window.innerHeight) // if not portrait
        window.lenis.scrollTo(`#${titleAlphaNumeric.value}`);
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
  bPlayVideo.value = false;
  bActivateVideo.value = false;
  gsap.to(elContent.value, {
    duration: 0.3,
    autoAlpha: 1,
    transform: 'translateY(0px)',
    ease: 'power2.inOut',
  })
}

// onMounted(() => {
//   // console.log('mounted ProjectItem', props.id, props.datas);
// })
</script>

<style></style>