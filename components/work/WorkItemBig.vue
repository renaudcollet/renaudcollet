<template>
  <div class="work-item-big">
    <div class="work-item-big__image" :class="{'scroll-opacity': !supportsCurtains}" data-scroll-index="0">
      <ClientOnly>
        <ImagePlane 
          v-if="!playVideo"
          :src="src"
          :video-src="videoSrc" 
          object-fit="cover" 
          alt=""
          ref="imagePlane"
        />
      </ClientOnly>
      <VideoComponent
          v-if="playVideo"
          class="work-item-big__image__video"
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
    <div class="work-item-big__content z-index-text" :class="{'hide': playVideo}">
      <div class="work-item-big__content__abs">
        <div 
          v-if="isVideo()" 
          class="work-item-big__content__button scroll-opacity" 
          data-scroll-index="0" 
          ref="btn-play"
          @click="onClickPlayVideo"
        >
          <svg x="0px" y="0px" viewBox="-27 -15 162 150">
            <polygon class="triangle-button" points="0,120 60,10 120,120" fill="transparent" stroke="#fff" stroke-width="1" />
            <g>
              <polygon class="triangle" fill="#ffffff" points="84.2,66.4 55.8,79.9 55.8,52.9" />
            </g>
          </svg>
        </div>
        <h3 class="work-item-big__content__title scroll-opacity" data-scroll-index="1" v-html="title"></h3>
      </div>
      <div class="work-item-big__content__text scroll-opacity" data-scroll-index="2" v-html="content"></div>
    </div>
  </div>
</template>

<script>
/* 
  Component : Titre / Resume / Image / Video 
*/
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import VideoComponent from '~/components/video/VideoComponent.vue';
import utilsDevice from '~~/mixins/utils-device.js';
import gsap from 'gsap';

export default {
  components: {
    ImagePlane,
    VideoComponent
  },
  mixins: [utilsDevice],
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
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
    }
  }, 
  data() {
    return {
      playVideo: false,
      activateVideo: false,
    }
  },
  computed: {
    titleAlphaNumeric() {
      return this.toAlphaNumeric(this.$props.title);
    }
  },
  mounted() {
    setTimeout(() => {
      this.imagePlane = this.$refs.imagePlane;
      // console.log('IMAGE PLANE', this.imagePlane)
      // console.log(this)
    }, 2000);
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
          gsap.to('.work-item-big__content', {
            duration: 0.3,
            autoAlpha: 0,
            transform: 'translateY(50px)',
            ease: 'power2.inOut',
          })

          if (!this.isPortrait)
            window.lenis.scrollTo(`#${this.titleAlphaNumeric}`);
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
      gsap.to('.work-item-big__content', {
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