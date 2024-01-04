<template>
  <div class="work-item-small" ref="el">
    <div class="work-item-small__image">
      <ClientOnly>
        <ImagePlane 
          v-if="mountPlane && !playVideo"
          :src="src" 
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
      <VideoComponent
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
      ></VideoComponent>
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
import useElementVisibility from '~/compositions/use-element-visibility';
// import utilsDevice from '~~/mixins/utils-device.js';
// import zoomable from '~~/mixins/zoomable-image.js';
import gsap from 'gsap';

const props = defineProps({
  src: {
    type: String,
    required: true,
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
  // console.log(`projectitem ${ props.src} isVisible`, newVal);
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
</script>

<style lang="scss">
[data-mouse-cursor='hover'] > * {
  pointer-events: none;
}
.work-item-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 38px;
  padding-top: 40px;

  @include media-breakpoint-up(lg) {
    margin-bottom: 210px;
    padding-top: 80px;
  }

  @include media-breakpoint-up(xl) {
    margin-bottom: 140px; // 210px
    align-items: center;
    &.left {
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
    }
    &.right {
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
    }
  }
  
  .big-underscore {
    font-weight: 300;
    bottom: -0.3em;
  }

  &__image {
    height: 41.94vw;
    width: 74vw;
    object-fit: cover;
    position: relative;

    @include media-breakpoint-up(lg) {
      width: 876px;
      height: 493px;
    }

    @include media-breakpoint-up(xl) {
      width: 876px;
      height: 493px;
      
      .right & {
        order: 2;
      }
    }

    &__video {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      // z-index: $z-video;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    width: 74vw;

    @include media-breakpoint-up(lg) {
      width: 460px;
      align-items: flex-start;
    }

    @include media-breakpoint-up(xl) {
      width: 876px;
      align-items: flex-start;

      .right & {
        order: 1;
        position: relative;
        margin-right: 40px;
        margin-top: auto;
        margin-bottom: auto;
        width: 460px;
        padding-left: 40px;
      }

      .left & {
        position: relative;
        margin-left: 40px;
        margin-top: auto;
        margin-bottom: auto;
        width: 460px;
        padding-right: 40px;
      }
    }

    &__button__center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__button {
      width: 50px;
      height: 50px;
      margin-left: -6px;
      pointer-events: all;
      filter: drop-shadow(2px 4px 6px black);

      svg {
        transform-origin: center;
        transform: scale(1);
        transition: transform 0.3s ease;
      }

      g {
        transform: translate(-6px, 15px);
      }
      
      .triangle-button {
        fill: rgba(0, 0, 0, 0.3);
        transform: scale(1);
        transform-origin: center;
        transition: transform 0.3s 0.10s ease, stroke-width 0.6s 0.1s ease;
      }

      .triangle {
        transform: scale(1);
        transform-origin: center;
        transition: transform 0.3s ease, fill 0.1s 0.3s ease;
        // filter: invert(1);
        fill: #fff;
        opacity: 0.9;
      }

      .hide & {

        svg {
          transform-origin: center;
          transform: scale(1.2);
          transition: transform 0.3s ease;
        }

        .triangle-button {
          transform-origin: center;
          transform: scale(0) !important;
          transition: transform 0.3s ease, stroke-width 0.6s 0.1s ease;
          stroke-width: 1;
        }

        .triangle {
          transform-origin: center;
          transform: scale(1.4);
          transition: transform 0.3s ease, fill 0.1s 0.3s ease;
          fill: #ffffff;
          // filter: invert(0);
          opacity: 1;
        }
      }

      @include media-breakpoint-up(lg) {
        width: 120px;
        height: 120px;  
        margin-left: -10px;
        cursor: pointer;

        .triangle-button {
          fill: rgba(0, 0, 0, 0.2);
        }

        &:hover {
          .triangle-button {
            transform: scale(1.3);
            transform-origin: center;
            transition: transform 0.3s 0.10s ease, stroke-width 0.6s 0.1s ease;
            stroke-width: 4;
          }
          .triangle {
            transform: scale(1.4);
            transform-origin: center;
            transition: transform 0.4s ease, fill 0.1s 0.3s ease;
          }
        } 
      }
    }

    &__abs {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    &__title {
      font-size: 24px;
      font-weight: 700;
      margin-top: 12px;
      margin-bottom: 0;

      @include media-breakpoint-up(lg) {
        font-size: 60px;
        margin-top: 30px;
        margin-bottom: 0;
      }
    }
  
    &__text {
      @include font-main();
      font-weight: normal;
      padding: 0;
      text-align: left;
      margin-top: 0;

      @include media-breakpoint-up(lg) {
        margin-left: 0;
        padding: 0;
      }

      p {
        margin-bottom: 0;
      }
    }
  }

}
</style>