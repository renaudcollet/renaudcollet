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
          v-if="!bPlayVideo"
          :src="src"
          :video-src="videoSrc" 
          :onRender="onRender"
          :isVisible="isVisible"
          object-fit="cover" 
          alt=""
        />
      </ClientOnly>
      <VideoComponent
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
      ></VideoComponent>
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
import VideoComponent from '~/components/video/VideoComponent.vue';
import gsap from 'gsap';

const props = defineProps({
  title: {
    type: String,
    required: true,
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
  }
})

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

  const t = {v: 0}
  // Hide the block, after the css animation is complete
  gsap.to(t, {
    delay: 0.0,
    v: 1,
    onComplete: () => {
      bActivateVideo.value = true;
      
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

onMounted(() => {
  // console.log('mounted ProjectItem', props.id, props.datas);
})
</script>

<style lang="scss">
.work-item-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;

  @include media-breakpoint-up(lg) {
    align-items: start;
    margin-bottom: 150px;
  }

  &__image {
    height: 54vw;
    width: 100%;
    position: relative;

    @include media-breakpoint-up(lg) {
      height: 100vh;
    }

    @include media-breakpoint-up(xl) {
      height: 100vh;
    }

    &__video {
      height: 54vw;
      width: 100%;
      position: absolute;
      top: 0;
      z-index: $z-video;

      @include media-breakpoint-up(lg) {
        height: 100vh;
      }

      @include media-breakpoint-up(xl) {
        height: 100vh;
      }
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: $z-video-button-play;

    @include media-breakpoint-up(lg) {
      width: 500px;
      align-items: flex-start;
      margin-left: 250px;
    }

    @include media-breakpoint-up(xl) {
      width: 750px;
    }

    &__button {
      width: 50px;
      height: 50px;
      margin-left: -6px;
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
          opacity: 1;
        }
      }

      @include media-breakpoint-up(lg) {
        width: 120px;
        height: 120px;  
        margin-left: -10px;
        cursor: pointer;
        align-self: flex-start;

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
      position: absolute;
      bottom: 65px;
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.8));
      
      @include media-breakpoint-up(lg) {
        bottom: 110px;
      }
    }

    &__title {
      font-size: 24px;
      font-weight: 700;
      margin-top: 11px;
      margin-bottom: 13px;
      padding: 0 30px;
      text-align: center;

      @include media-breakpoint-up(lg) {
        font-size: 60px;
        margin-top: 32px;
        margin-bottom: 24px;
        padding: 0;
        text-align: left;
      }
    }
  
    &__text {
      @include font-main();
      font-weight: normal;
      padding: 0 45px;
      text-align: center;
      margin-top: 0;

      @include media-breakpoint-up(lg) {
        text-align: left;
        margin-left: 0;
        padding: 0;
      }
    }
  }

}
</style>