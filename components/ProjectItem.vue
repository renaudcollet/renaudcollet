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
    <div class="project-item__title">
      <h1>
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
      <h2>
        <div 
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="1.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ props.datas.attributes.brand }}
        </div>
      </h2>
    </div>
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
      class="project-item__button scroll-reveal "
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
// import gsap from 'gsap'
import { toRef } from '@vueuse/core';
// import { durationLeaveDefault } from '../transitions/work-transition';
// import { Vec3 } from 'curtainsjs';

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

const emit = defineEmits(['onClick'/* , 'onClickAnimationComplete' */])

const keywords = computed(() => {
  return props.datas.attributes.keywords.data;
})

const currentProjectCover = props.datas.attributes.cover.data.attributes

// const coverSrc = computed(() => {
//   return currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;
// })
const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;

// console.log('IMAGE PROJECT ITEM URL', xxlarge);

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
// let planeHtml = null;

const onClick = () => {

  isClicked = true;

  // stop scroll
  emit('onClick', props.id, imagePlane.value)

  // console.log('Selected Plane render order', imagePlane.value.planeMesh.renderOrder);
  // imagePlane.value.planeMesh.setRenderOrder(50)
  // console.log('Selected Plane render order', imagePlane.value.planeMesh.renderOrder);

  /* // animate imagePlane to full screen, and position it to the center
  planeHtml = imagePlane.value.planeMesh.htmlElement;
  // Get the bounding rectangle of the relative element
  // const coverElement = imagePlane.value.renderer
  const rect = planeHtml.parentNode.parentNode.getBoundingClientRect()
  // const rect = planeHtml.getBoundingClientRect();
  
  // This would be eq to the final size of the imagePlane (aka the cover image in page id)
  const rectFinal = imagePlane.value.planeMesh.renderer.canvas.getBoundingClientRect()
  // console.log('final size', elFinalSize.width, elFinalSize.height);

  // Change z position to cover other planes
  // Done in datasCurtains.js
  imagePlane.value.planeMesh.uniforms.uZPos.value = -0.001; // OK
  // imagePlane.value.planeMesh.relativeTranslation(new Vec3(0, 0, -1.0))

  gsap.killTweensOf(planeHtml)

  // console.log('planeHtml', planeHtml);

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
    // width: rectFinal.width - 100, // debug
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
      // imagePlane.value.planeMesh.resetPlane()
      
      // Cant emit because of vuejs transition already unmounted this component  
      // emit('onClickAnimationComplete', props.id, imagePlane.value.planeMesh) 
    }
  }) */
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

// onBeforeUnmount(() => {
//   // console.log('onBeforeUnmount ProjectItem', props.id, props.datas);
//   // gsap.killTweensOf(planeHtml)
// })
</script>