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
import { Plane } from "vue-curtains";
import fragmentShader from "~/shaders/planes.frag";
import vertexShader from "~/shaders/planes.vert";
// import supportsCurtains from '~~/mixins/utils-device.js';
import gsap from 'gsap';

let this_plane = null;

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
    needsRatio: {
        name: "uNeedsRatio",
        type: "1f",
        value: 0,
    },
    resolution: {
        name: "uResolution",
        type: "2f",
        value: [0, 0],
    },
    ratio: {
        name: "uRatio",
        type: "1f",
        value: 0,
    },
    naturalRatio: {
        name: "uNaturalRatio",
        type: "1f",
        value: 0,
    },
    scale: {
        name: "uScale",
        type: "1f",
        value: 0,
    },
    zPos: {
        name: "uZPos",
        type: "1f",
        // value: isVideo() ? 0. : 0.2,
        value: 0.,
    },
    hovered: {
        name: "uHovered",
        type: "1f",
        value: 0,
    },
    isText: {
        name: "isText",
        type: "1f",
        value: 0,
    },
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
  // console.log(`${ props.id} isVisible`, newVal);
  if (newVal) {
    reveal();
  }
})

const reveal = () => {
  // console.log('reveal', this_plane);
  if(!this_plane) return

  const t = {u: 0, v: 0}
  gsap.to(t, {
    v: 0.7,
    duration: 1,
    delay: 0.2,
    // repeat: -1,
    onUpdate: () => {
        this_plane.uniforms.uOpenProgress.value = t.v
    },
    onComplete: () => {
        this_plane.uniforms.uOpenProgress.value = t.v
    },
  })
}

const onReady = (plane) => {
  this_plane = plane;
  nextTick(() => {
      plane.images[0].style.opacity = 0

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
      // console.log(`onReady ${props.src}`, `isVisible ${props.isVisible}`, `isReady ${isReady.value}` );
      if (props.isVisible) {
        reveal();
      }
  })
    
}

const updateRatioUniforms = (plane) => {
    let width = plane.images[0].width
    let height = plane.images[0].height
    let nWidth = plane.images[0].naturalWidth
    let nHeight = plane.images[0].naturalHeight

    let ratio = Math.round(width/height*100)/100
    let naturalRatio = Math.round(nWidth/nHeight*100)/100
    
    plane.uniforms.naturalRatio.value = naturalRatio
    plane.uniforms.ratio.value = ratio
    plane.uniforms.needsRatio.value = (ratio != naturalRatio) ? 1 : 0
    // plane.uniforms.
    // console.log(plane.images[0])
    // console.log('w/h', width, height)
    // console.log('n w/h', nWidth, nHeight)
    // console.log('ratio', ratio, naturalRatio)
    // console.log(width, nWidth, plane.images[0].offsetWidth, plane.images[0].parentElement.offsetWidth)
    // console.log(height, nHeight, plane.images[0].offsetHeight, plane.images[0].parentElement.offsetHeight)
    let xRatio =  width / nWidth
    let yRatio = height / nHeight

    if(props.objectFit == 'contain')
        plane.uniforms.scale.value = Math.min(xRatio, yRatio)

    // console.log('scale', plane.uniforms.scale.value)

}

const onResize = () => {
  if(!this_plane) return
  // console.log('onResize', this_plane);
  this_plane.resize()
  if(this_plane.textures.length > 0) {
      this_plane.textures[0].resize();
      this_plane.textures[0].needUpdate();

      updateRatioUniforms(this_plane)
  }
}

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
    reveal();
  }
})

onUnmounted(() => {
  // console.log(`unmounted ${props.src}`);
  window.removeEventListener('resize', onResize)
  //unmount curtains
})
</script>

<style scoped lang="scss">
.plane, 
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
}
</style>