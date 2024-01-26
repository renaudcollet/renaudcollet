<template>
  <NuxtLink 
    class="project-item project-item-this" 
    ref="el"
    @click="onClick()"
    @mouseover="onMouseover"
    @mouseout="onMouseout"
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
        <template v-for="(line, index) in paraphToLines">
          <div 
            class="line scroll-reveal"
            data-scroll-reveal-opacity-y
            :data-scroll-reveal-delay="1"
            data-scroll-reveal-duration="0.5"
          >
            <span class="front" :style="{'color': titleColor}">{{ line.trim() }}</span>
            <span class="back" :style="{'color': titleColorBack}">{{ line.trim() }}</span>
          </div>
        </template>
      </h1>
      <h2 :style="{'color': titleColorBack}">
        <div 
          class="line scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="1.2"
          data-scroll-reveal-duration="0.5"
        >
          <span class="front" :style="{'color': titleColorBack}">{{ props.datas.attributes.brand }}</span>
          <span class="back" :style="{'color': titleColor}">{{ props.datas.attributes.brand }}</span>
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
            :data-scroll-reveal-delay="index * 0.2"
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
      data-scroll-reveal-delay="1.5"
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
// const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
// const xxlarge = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;

// console.log('IMAGE PROJECT ITEM URL', xxlarge);

const paraphToLines = computed(() => {
  return props.datas.attributes.titre.split('<br />');
})

const titleColor = computed(() => {
  return props.datas.attributes.titleColor;
})

const titleColorBack = computed(() => {
  return props.datas.attributes.titleColorBack;
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
let zoomValue = {u: 1.0};

const onClick = () => {
  isClicked = true;  
  emit('onClick', props.id, imagePlane.value)
}

const onMouseout = () => {
  if (isClicked) {
    return;
  }

  // Dezoom 
  gsap.killTweensOf(zoomValue)
  gsap.to(zoomValue, {
    u: 1.0,
    duration: 0.5,
    // delay: 0.2,
    ease: 'power2.out',
    onUpdate: () => {
      if (imagePlane.value.planeMesh === null) {
        return;
      }
      imagePlane.value.planeMesh.uniforms.uScale.value = zoomValue.u
    },
  })
}

const onMouseover = () => {
  if (isClicked) {
    return;
  }

  // Zoom 
  gsap.killTweensOf(zoomValue)
  gsap.to(zoomValue, {
    u: 0.9,
    duration: 0.5,
    // delay: 0.2,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (imagePlane.value.planeMesh === null) {
        return;
      }
      imagePlane.value.planeMesh.uniforms.uScale.value = zoomValue.u
    },
  })
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