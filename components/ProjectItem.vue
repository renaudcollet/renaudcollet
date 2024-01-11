<template>
  <NuxtLink 
    class="project-item project-item-this" 
    ref="el"
    @click="onClick()"
    @mouseover="onMouseover"
  >
    <!-- <ClientOnly> -->
      <div 
        class="image-container scroll-reveal"
        data-scroll-reveal-delay="0.3"
        data-scroll-reveal-duration="1.6"
      >
        <ImagePlane 
          v-if="mountPlane"
          :src="config.public.backendUrl + xxlarge"
          :onRender="onRender"
          :isVisible="isVisible"
          object-fit="cover" 
          class="project-item__image" 
          ref="imagePlane"
        />
      </div>
    <!-- </ClientOnly> -->
    <h1 class="project-item__title">
      <div v-for="(line, index) in paraphToLines" class="line">
        <div 
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          :data-scroll-reveal-delay="1"
          data-scroll-reveal-duration="0.5"
        >
          {{ line.trim() }}
        </div>
      </div>
    </h1>
    <div 
      class="project-item__text scroll-reveal z-index-text"
      data-scroll-reveal-height
      data-scroll-reveal-delay="1"
      data-scroll-reveal-duration="0.4"
      :data-scroll-index="2"
    >
      <div class="project-item__alt">
        <template v-for="(item, index) in keywords">
          <h3 
            class="project-item__subtitle scroll-reveal" 
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="0.2 + index * 0.2"
            data-scroll-reveal-duration="0.5"
          >
            {{ item.attributes.key }}
          </h3>
        </template>
      </div>
    </div>
    <div 
      class="project-item__button scroll-reveal"
      :data-scroll-index="paraphToLines.length + keywords.length + 4"
      data-scroll-reveal-opacity-y
      data-scroll-reveal-delay="2"
      data-scroll-reveal-duration="1"
    >
      <svg x="0px" y="0px" viewBox="0 0 124 124">
        <polygon points="0,120 60,10 120,120" fill="transparent" stroke="#fff" stroke-width="1" />
        <g class="cross">
          <rect class="horiz" fill="rgb(255, 255, 255)" x="42" y="62" width="41" height="1" />
          <g class="vert">
            <rect class="vert1" fill="rgb(255, 255, 255)" x="62" y="42" width="1" height="20" />
            <rect class="vert2" fill="rgb(255, 255, 255)" x="62" y="62" width="1" height="20" />
          </g>
        </g>
      </svg>
    </div>
  </NuxtLink>
</template>

<script setup>
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import useElementVisibility from '~/compositions/use-element-visibility';
import gsap from 'gsap'
import { toRef } from '@vueuse/core';
import { durationLeaveDefault } from '../transitions/work-transition';

const config = useRuntimeConfig()
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  datas: {
    type: Object,
    required: true,
  },
  onRender: {
    type: Function,
    required: true,
  },
  mountPlanes: {
    type: Boolean,
    required: false,
    default: false,
  }
})

const mountPlane = toRef(props, 'mountPlanes')

const emit = defineEmits(['onClick', 'onClickAnimationComplete'])

const keywords = computed(() => {
  return props.datas.attributes.keywords.data;
})

const currentProjectCover = props.datas.attributes.cover.data.attributes

const coverSrc = computed(() => {
  return currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;
})
const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;

const paraphToLines = computed(() => {
  return props.datas.attributes.titre.split('<br />');
})

const el = ref(null);
const imagePlane = ref(null);

const visibilityObserver = useElementVisibility(el);
const isVisible = visibilityObserver.isVisible;
watch(isVisible, (newVal, oldVal) => {
  // console.log(`projectitem ${ props.id} isVisible`, newVal);
  if (newVal) {
    visibilityObserver.observer.stop();
  }
})

let isClicked = false;
let planeHtml = null;

const onClick = () => {

  isClicked = true;

  imagePlane.value.planeMesh.htmlElement.style.zIndex = 1000;
  imagePlane.value.resize();

  // stop scroll
  emit('onClick', props.id, imagePlane.value.planeMesh)

  console.log('Selected Plane render order', imagePlane.value.planeMesh.renderOrder);
  // imagePlane.value.planeMesh.setRenderOrder(50)
  // console.log('Selected Plane render order', imagePlane.value.planeMesh.renderOrder);

  // animate imagePlane to full screen, and position it to the center
  planeHtml = imagePlane.value.planeMesh.htmlElement;
  // Get the bounding rectangle of the relative element
  // const coverElement = imagePlane.value.renderer
  const rect = planeHtml.parentNode.parentNode.getBoundingClientRect()
  // const rect = planeHtml.getBoundingClientRect();
  
  // This would be eq to the final size of the imagePlane (aka the cover image in page id)
  const rectFinal = imagePlane.value.planeMesh.renderer.canvas.getBoundingClientRect()
  // console.log('final size', elFinalSize.width, elFinalSize.height);

  gsap.killTweensOf(planeHtml)

  // console.log('rect', rect);
  planeHtml.style.position = 'fixed';
  planeHtml.style.top = `${rect.top}px`;
  planeHtml.style.left = `${rect.left}px`;

  gsap.to(planeHtml, {
    // delay: 0.01,
    duration: durationLeaveDefault,
    ease: 'power4.out',
    scale: 1,
    // top: `${-rect.top}px`,
    // left: `${-rect.left}px`,
    top: `0px`,
    left: `0px`,
    width: rectFinal.width,
    height: rectFinal.height,
    onStart: () => {
      imagePlane.value.resize();
    },
    onUpdate: () => {
      imagePlane.value.resize();
    },
    onComplete: () => {
      imagePlane.value.resize();
      imagePlane.value.planeMesh.watchScroll = false;
      // emit('onClickAnimationComplete', props.id, imagePlane.value.planeMesh) // Never triggered because of vuejs transition already unmounted this component  
    }
  })
}

const onMouseover = () => {
  if (isClicked) {
    return;
  }

  // gsap.to(imagePlane.value.planeMesh.scale, {
  //   x: 1.5,
  //   y: 1.5,
  // })
}

onMounted(() => {
  // console.log('mounted ProjectItem', props.id, props.datas);

  // Debug resize
  window['resizeItem'+props.id] = () => {
    onClick();
    return imagePlane.value.planeMesh.htmlElement;
  }
})

// onUnmounted(() => {
//   // console.log('Unmounted ProjectItem', props.id, props.datas);
// })

onBeforeUnmount(() => {
  // console.log('onBeforeUnmount ProjectItem', props.id, props.datas);
  // gsap.killTweensOf(planeHtml)
})
</script>

<style lang="scss">
.project-item {
  position: relative;
  display: flex;
  margin: 0 auto 140px;
  color: $font-color;
  text-decoration: none;
  width: calc(100vw - 60px);
  height: 56.25vw;

  @include media-breakpoint-up(lg) {
    margin-bottom: 140px;
    height: 500px;
    width: 870px;
  }

  @include media-breakpoint-up(xl) {
    margin-bottom: 200px;
    width: 1040px;
    height: 580px;
  }

  & > * {
    pointer-events: none;
  }

  svg {
    transition: transform 0.3s ease;

    polygon {
      transform-origin: center center;
      transition: transform 0.3s ease, stroke-width 0.3s ease;
    }

    .horiz {
      transition: opacity 0.3s 0.2s ease, transform 0.3s 0.2s ease, width 0.3s 0.2s ease;
    }

    .vert1 {
      transition: transform 0.3s 0.0s ease;
      transform-origin: center;
      // transform: rotate(-45deg);
    }

    .vert2 {
      transition: transform 0.3s 0.0s ease;
      transform-origin: center;
      // transform: rotate(45deg);
    }

    .vert {
      transition: transform 0.3s ease;
      // transform: translateX(20px);
    }

    .cross {
      transform: translate(0, 13px);
    }
  }

  &:hover {
    svg {
      transition: transform 0.3s ease;
      transform: scale(2) translateY(-5px);
      
      @include media-breakpoint-up(lg) {
        transform: scale(2) translateY(-10px);
      }

      polygon {
        transition: transform 0.3s 0.1s ease, stroke-width 0.6s 0.1s ease;
        transform: scale(0.9);
        stroke-width: 4;
      }
      
      .horiz {
        transition: opacity 0.3s 0.2s ease, transform 0.3s 0.2s ease, width 0.3s 0.2s ease;
        opacity: 0;
        transform: translateX(-10px);
        width: 0;
      }

      .vert1 {
        transition: transform 0.3s 0.1s ease;
        transform-origin: center;
        transform: rotate(-45deg);
        stroke-width: 4;
      }

      .vert2 {
        transition: transform 0.3s 0.1s ease;
        transform-origin: center;
        transform: rotate(45deg);
        stroke-width: 4;
      }

      .vert {
        transition: transform 0.3s 0.1s ease;
        transform: translateX(10px);
      }
    }
  }

  // .image-container {
  //   clip-path: polygon(75% 0, 75% 0, 25% 100%, 25% 100%);
  // }
  
  &__alt {
    display: flex;
    flex-direction: column;
    padding: 13px 12px 20px;
    // border: 0;
    // border-bottom: 0;
    min-width: 10vw;
    background-color: rgba(5, 5, 5, 0.5);
    background: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 54%, rgba(0,0,0,0.2) 83%, rgba(36,36,36,0) 100%);

    @include media-breakpoint-up(xl) {
      padding: 25px 15px 70px 20px;
    }
  }

  &__image {

    // because, I don't know why, scoped css is not working server side rendered for this component, the styles are not applied
    .project-item-this & {
      width: calc(100vw - 60px);
      height: 56.25vw;
      object-fit: cover;
      object-position: center;
      // position: absolute;
      z-index: -1;
      right: 0;
      top: 0;
      user-select: none;
      // clip-path: polygon(25% 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0 25%);

      @include media-breakpoint-up(lg) {
        height: 500px;
        width: 870px;
      }

      @include media-breakpoint-up(xl) {
        width: 1040px;
        height: 580px;
      }
    }
  }

  &__text {
    position: absolute;
    left: 0;
    bottom: 0;
    margin-left: 0;
    transform: translate3d(0, 0, 0);

    // @include media-breakpoint-up(md) {
    //   margin-left: 8.333333vw;
    // }

    @include media-breakpoint-up(lg) {
      // order: 1;
      // bottom: 0;
      // margin-left: 65.384615px;
      left: 0;
    }

    // @include media-breakpoint-up(xl) {
    //   margin-left: 85px;
    //   left: 0;
    // }
  }

  &__button {
    position: absolute;
    bottom: 10px;
    right: 10px;

    svg {
      width: 31px;
      height: 31px;
    }

    @include media-breakpoint-up(md) {
      margin-top: 5vw;

      svg {
        width: 8.611111vw;
        height: 8.611111vw;
      }
    }

    @include media-breakpoint-up(lg) {
      margin-top: 30px;
      margin-left: 20px;
      bottom: 20px;
      right: 60px;

      svg {
        width: 64px;
        height: 64px;
      }
    }

    @include media-breakpoint-up(xl) {
      margin-top: 30px;
      margin-left: 20px;

      svg {
        width: 64px;
        height: 64px;
      }
    }
  }

  h1,
  h3 {
    width: fit-content;
    margin: 0;
    font-family: $font-main;
    color: $font-title-color;
  }

  h1 {
    position: absolute;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 7px;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;
    filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.80));
    margin-top: 10px;
    margin-left: 16px;
    padding-right: 10px;

    @include media-breakpoint-up(md) {
      font-size: 7.777778vw;
      margin-bottom: 1.944444vw;
    }

    @include media-breakpoint-up(lg) {
      font-size: 62px;
      margin-bottom: 15px;
      margin-top: 20px;
      margin-left: 20px;
    }

    @include media-breakpoint-up(xl) {
      font-size: 70px;
      margin-bottom: 15px;
      margin-top: 28px;
      margin-left: 45px;
      padding-right: 60px;
    }
  }

  h3 {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 5px;

    @include media-breakpoint-up(md) {
      font-size: 13px;
      margin-bottom: 9px;
    }

    @include media-breakpoint-up(lg) {
      margin-bottom: 9px;
      line-height: 0.6;
    }

    @include media-breakpoint-up(xl) {
      font-size: 18px;
      margin-bottom: 9px;
      line-height: 1;
    }
  }
}
</style>