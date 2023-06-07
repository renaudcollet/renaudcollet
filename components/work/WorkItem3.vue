<template>
  <div class="work-item-3">
    <div class="work-item-3__image">
      <ClientOnly>
        <ImagePlane 
          :src="src" 
          :class="{'scroll-opacity': !supportsCurtains, 'zoomable': !isVideo()}" 
          object-fit="cover" 
          :data-zoomable-url="src"
          data-scroll-index="0" 
          alt=""
        />
      </ClientOnly>
      <VideoComponent
          v-if="playVideo"
          class="work-item-3__image__video"
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
    </div>
    <div class="work-item-3__content z-index-text">
      <div 
        v-if="isVideo()" 
        @click="onClickPlayVideo"
        ref="btn-play" 
        class="work-item-3__content__button scroll-opacity" 
        data-scroll-index="1" 
      >
        <svg x="0px" y="0px" viewBox="0 0 130 130">
          <path class="circle" fill="#ffffff" d="M65,19.5c25.1,0,45.5,20.4,45.5,45.5S90.1,110.5,65,110.5S19.5,90.1,19.5,65 S39.9,19.5,65,19.5z"/>
          <polygon class="triangle" fill="#ffffff" points="84.2,66.4 55.8,79.9 55.8,52.9" />
        </svg>
      </div>
      <h3 class="work-item-3__content__title scroll-opacity" data-scroll-index="2" v-html="titleUnderscore"></h3>
      <p class="work-item-3__content__text scroll-opacity" data-scroll-index="3" v-html="content.content"></p>
    </div>
  </div>
</template>

<script>
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import utilsDevice from '~~/mixins/utils-device.js';
import zoomable from '~~/mixins/zoomable-image.js';
import gsap from 'gsap';

export default {
  components: {
    ImagePlane,
  },
  mixins: [
    utilsDevice,
    zoomable,
  ],
  props: {
    content: {
      type: Object,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    videoSrc: {
      type: String,
      required: false,
      default: null
    },
    onRender: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      playVideo: false,
      activateVideo: false,
    }
  },
  computed: {
    titleAlphaNumeric() {
      return this.toAlphaNumeric(this.content.title);
    },
    titleUnderscore() {
      return this.content.title + '&nbsp;<sub class="big-underscore">&nbsp;—</sub>';
    },
  },
  methods: {
    isVideo() {
      if (!this.$props.videoSrc)
        return false;
      else 
        return true;
    },
    toAlphaNumeric(str) {
      return str.replace(/[^0-9a-zA-Z_]/gi, '');
    },
    onClickPlayVideo() {
      this.playVideo = true;

      const t = {v: 0}
      // Hide the block, after the css animation is complete
      gsap.to(t, {
        delay: 0.0,
        v: 1,
        onComplete: () => {
          this.activateVideo = true;
          const el = this.$el.querySelector('.work-item-3__content');
          gsap.to(el, {
            duration: 0.3,
            autoAlpha: 0,
            transform: 'translateY(50px)',
            ease: 'power2.inOut',
          })

          // if (!this.isPortrait)
          //   window.lenis.scrollTo(`#${this.titleAlphaNumeric}`);
        }
      })
    },
    onVideoEnded() {
      this.onVideoOutOfView()
    },
    onVideoPaused() {
      this.onVideoOutOfView()
    },
    onVideoOutOfView() {
      this.playVideo = false;
      this.activateVideo = false;
      gsap.to('.work-item-3__content', {
        duration: 0.3,
        autoAlpha: 1,
        transform: 'translateY(0px)',
        ease: 'power2.inOut',
      })
    }
  }
}
</script>

<style lang="scss">
.work-item-3 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 38px;

  @include media-breakpoint-up(lg) {
    margin-bottom: 210px;
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

    @include media-breakpoint-up(lg) {
      width: 460px;
      align-items: flex-start;
    }

    @include media-breakpoint-up(xl) {
      width: 560px;
      align-items: flex-start;

      .right & {
        order: 1;
        position: relative;
        margin-right: -170px;
        margin-top: 187px;
        width: 460px;
      }

      .left & {
        position: relative;
        margin-left: -190px;
        margin-top: 198px;
        width: 460px;
      }
    }

    &__button {
      width: 40px;
      height: 40px;
      margin-left: -6px;
      pointer-events: all;

      svg {
        transform-origin: center;
        transform: scale(1);
        transition: transform 0.3s ease;
      }

      .circle {
        transform: scale(1);
        transform-origin: center;
        transition: transform 0.3s 0.10s ease;
      }
      .triangle {
        transform: scale(1);
        transform-origin: center;
        transition: transform 0.3s ease, fill 0.1s 0.3s ease;
        // filter: invert(1);
        fill: #000000;
        opacity: 0.9;
      }

      .hide & {

        svg {
          transform-origin: center;
          transform: scale(1.2);
          transition: transform 0.3s ease;
        }

        .circle {
          transform-origin: center;
          transform: scale(0) !important;
          transition: transform 0.3s ease;
        }
        .triangle {
          transform: scale(1.4);
          transition: transform 0.3s ease, fill 0.1s 0.3s ease;
          fill: #ffffff;
          // filter: invert(0);
          opacity: 1;
        }
      }

      @include media-breakpoint-up(lg) {
        width: 94px;
        height: 94px;  
        margin-left: -10px;
        cursor: pointer;

        &:hover {
          .circle {
            transform: scale(1.3);
            transform-origin: center;
            transition: transform 0.3s 0.10s ease;
          }
          .triangle {
            transform: scale(1.4);
            transform-origin: center;
            transition: transform 0.4s ease, fill 0.1s 0.3s ease;
          }
        } 
      }
    }
    
    &__title {
      font-size: 24px;
      font-weight: 800;
      margin-top: 28px;
      margin-bottom: 15px;

      @include media-breakpoint-up(lg) {
        font-size: 72px;
        margin-top: 32px;
        margin-bottom: 47px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 72px;
        margin-top: 32px;
        margin-bottom: 24px;
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