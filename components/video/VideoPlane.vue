<template>
    <div class="video-plane">
        <!-- <img v-if="src" :src="src" class="cover" ref="coverImg" alt=""> -->
        <Plane
            class="plane"
            ref="plane"
            :params="planeProps"
            @render="onRender"
            @ready="onReady"
        >
            <video 
                :style="{'object-fit': objectFit}" 
                :src="videoSrc"
                :id="id"
                ref="video" 
                preload="auto"
                playsinline 
                webkit-playsinline
                crossorigin="anonymous"
                data-sampler="uTexture"
            >
                <source :src="videoSrc">
            </video>
        </Plane>
        <VideoPlayer 
            :video="video" 
            :activate="play"
            :supportsCurtains="true" 
            @ended="onVideoEnded"
            @play="onVideoPlay"
            @pause="onVideoPause"
        />
      </div>
</template>

<script setup> 
import Plane from "~/components/curtains/Plane/index.vue";
import fragmentShader from "~/shaders/planes.frag";
import vertexShader from "~/shaders/planes.vert";
import VideoPlayer from '~/components/video/VideoPlayer.vue';
// import supportsCurtains from '~/mixins/utils-device.js';
import gsap from 'gsap';

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
  videoSrc: {
      type: String,
      required: false,
      default: null
  },
  id: {
      type: String,
      required: false,
      default: ""
  },
  play: {
      type: Boolean,
      required: false,
      default: false
  },
  alt: {
      type: String,
      required: false,
      default: ""
  },
  onRender: {
      type: Function,
      required: true,
  },
})

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


const planeMesh = ref(null);
const plane = ref(null)
const video = ref(null)
const coverImg = ref(null)
const play = toRef(props, 'play')
const isReady = ref(false)

const emit = defineEmits(['video-paused', 'video-out-of-view', 'video-ended', 'video-played', 'video-paused'])

watch(play, (newVal, oldVas) => {
  console.log('WATCH play', video)
  if(newVal) {
      video.value.play().then(() => {
          video.value.volume = 1
          video.value.loop = false
          if (coverImg.value) {
              // coverImg.style.opacity = 0;
              gsap.to(coverImg.value, {autoAlpha: 0, duration: 0.2})
          }
          
          // Pause/Play the video when click on it
          if (video.value.getAttribute('click-listener') !== 'true') {
              video.value.setAttribute('click-listener', 'true')
              video.value.addEventListener('click', onClickVideo)
          }
      });
  } else {
      video.value.pause()
  }
})

const updateRatioUniforms = (plane) => {
    const image = plane.videos[0]
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

const onReady = (plane) => {
  planeMesh.value = plane; // extends DOMMesh
  console.log('VIDEO onReady', planeMesh.value);
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

const addVideoObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                video.value.pause();
                onVideoOutOfView()
            }
        });

    });
    observer.observe(video.value);
}

const onClickVideo = () => {
    if (video.value.paused) {
        video.value.play();
    } else {
        video.value.pause();
        emit('video-paused');
    }
}

const onVideoOutOfView = () => {
    video.value.currentTime = 0;
    emit('video-out-of-view');
}

const onVideoEnded = () => {
    // if (this.coverImg) {
    //     gsap.to(this.coverImg, {autoAlpha: 1, duration: 0.2})
    // }
    // video.value.currentTime = 0;
    emit('video-ended');
}

const onVideoPlay = () => {
    emit('video-played');
}

const onVideoPause = () => {
    emit('video-paused');
}

onMounted(() => {
  nextTick(() => {
    addVideoObserver()
    gsap.to(video.value, {autoAlpha: 1, duration: 0.2})
  })
})

onBeforeUnmount(() => {
  if (video.value && video.value.getAttribute('click-listener') === 'true') {
      video.value.removeEventListener('click', onClickVideo)
  }
  window.removeEventListener('resize', onResize)
})

// onUnmounted(() => {
// })
</script>