<template>
  <Plane 
    class="plane"
    :params="planeProps"
    @render="onRender"
    @ready="onReady"
  >
    <img 
      :src="src  + '?' + new Date().getTime()" 
      :style="{'object-fit': objectFit}"
      :alt="alt"
      data-sampler="uTexture"
      crossorigin="anonymous"
    >
  </Plane>   
  <!-- <div v-else class="not-plane">
      <img 
          :src="src" 
          :style="{'object-fit': objectFit}" 
          :alt="alt" 
          crossorigin="anonymous"
      /> 
  </div> -->
</template>

<script setup>
// import { Plane } from "vue-curtains";
import Plane from "~/components/curtains/Plane/index.vue";
import fragmentShader from "~/shaders/planes.frag";
import vertexShader from "~/shaders/planes.vert";
// import supportsCurtains from '~~/mixins/utils-device.js';
import gsap from 'gsap';

const planeMesh = ref(null);

const props = defineProps({
  objectFit: {
    type: String,
    required: false,
    default: "contain"
  },
  src: {
    type: String,
    required: false,
    default: null
  },
  onRender: {
    type: Function,
    required: true,
  },
  id: {
    type: String,
    required: false,
    default: ""
  },
  alt: {
    type: String,
    required: false,
    default: ""
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  skipAnimation: {
    type: Boolean,
    default: false
  }
});

const planeProps = {
  vertexShader,
  fragmentShader,
  widthSegments: 10,
  heightSegments: 10,
  drawCheckMargins: {
    top: 100,
    right: 0,
    bottom: 100,
    left: 0,
  },
  uniforms: {
    planeDeformation: {
        name: "uPlaneDeformation",
        type: "1f",
        value: 0,
    },
    resolution: {
        name: "uResolution",
        type: "2f",
        value: [0, 0],
    },
    size: {
        name: "uSize",
        type: "2f",
        value: [0, 0],
    },
    scale: {
        name: "uScale",
        type: "1f",
        value: 0,
    },
    uZPos: {
        name: "uZPos",
        type: "1f",
        // value: isVideo() ? 0. : 0.2,
        value: 0.,
    },
    // hovered: {
    //     name: "uHovered",
    //     type: "1f",
    //     value: 0,
    // },
    // isText: {
    //     name: "isText",
    //     type: "1f",
    //     value: 0,
    // },
    uOpenProgress: {
        name: "uOpenProgress",
        type: "1f",
        value: 0,
      },
    }
}

const isReady = ref(false);
const isVisible = toRef(props, 'isVisible');

watch(isVisible, (newVal, oldVal) => {
  if (newVal) {
    appear();
  }
})

// Disappear is handled in datasCurtains.js
const appear = () => {
  if(!planeMesh.value) return

  if (props.skipAnimation) {
    // Case where user arrives from home page or work page, with a cover transition
    planeMesh.value.uniforms.uOpenProgress.value = 0.7
    console.log('-> PLANE COVER IS STRAIGHT VISIBLE');
    return
  } else {
    // Case where item is shown by scroll or user arrives directly on a project page (cover will appear with a transition)
    const t = {u: 0, v: 0}
    gsap.to(t, {
      v: 0.7,
      duration: 1,
      delay: 0.2,
      onUpdate: () => {
          planeMesh.value.uniforms.uOpenProgress.value = t.v
      },
      onComplete: () => {
          planeMesh.value.uniforms.uOpenProgress.value = t.v
      },
    })
  }
}

const disappear = () => {
  // is handled in datasCurtains.js
  // Because of vuejs transitions starting and ending after unmounted
}

// const onLeaveView = () => {
//   console.log('onLeaveView', planeMesh.value);
// }

// const onBeforeRemove = () => {
//   console.log('onBeforeRemove', planeMesh.value);
// }

const onReady = (plane) => {
  planeMesh.value = plane; // extends DOMMesh
  nextTick(() => {
      // plane.images[0].style.opacity = 0
      updateRatioUniforms(plane)

      const t = {u: 0, v: 0}
      gsap.to(t, {
        u: 1,
        duration: 0.1,
        onComplete: () => {
            onResize()
        },
      })

      isReady.value = true;
      if (props.isVisible) {
        appear();
      }
  })
    
}

const updateRatioUniforms = (plane) => {
    const image = plane.images[0]
    // For uCover
    plane.uniforms.resolution.value = [image.width, image.height]
    plane.uniforms.size.value = [image.naturalWidth, image.naturalHeight]
}

const onResize = () => {
  if(!planeMesh.value) return
  // console.log('onResize', planeMesh.value);
  if(planeMesh.value.textures.length > 0) {
    updateRatioUniforms(planeMesh.value)
    // planeMesh.value.textures[0].resize();
    // planeMesh.value.textures[0].needUpdate();
  }
  planeMesh.value.resize()
}

defineExpose({
  planeMesh,
  resize: onResize,
})

onMounted(() => {
  // console.log(`mounted ${props.src}`, `isVisible ${props.isVisible}`);
  window.addEventListener('resize', onResize)

  // const t = {v: 0}
  // gsap.to(t, {
  //     v: 1,
  //     duration: 0.5,
  //     onComplete: () => {
  //         onResize()
  //     },
  // })
  
  // plane.uniforms.zPos.value = isVideo ? 0. : 0.25;

  // console.log(`mounted ${props.src}`, `isVisible ${props.isVisible}`, `isReady ${isReady.value}` );
  if (props.isVisible && isReady.value) {
    appear();
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped lang="scss">
/* .plane, 
.not-plane {
  position: relative;
  width: 100%;
  height: 100%;
}
.plane img {
  opacity: 0;
}

@include media-breakpoint-up(xl) {
  .plane img.cover {
    opacity: 1;
  }
}

.plane video {
opacity: 0;
}

.not-plane img {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; 
}

img{
  width: 100%;
  height: 100%;
}

video{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
} */
</style>