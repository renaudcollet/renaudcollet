<template>
    <Plane v-if="supportsCurtains" class="plane" :params="planeProps" @render="onRender" @ready="onReady" ref="plane">
        <img :src="src  + '?' + new Date().getTime()" :style="{'object-fit': objectFit}" data-sampler="uTexture" crossorigin="anonymous" :alt="alt">
    </Plane>   
    <div v-else class="not-plane">
        <img 
            :src="src" 
            :style="{'object-fit': objectFit}" 
            :alt="alt" 
            data-sampler="uTexture" 
            crossorigin="anonymous"
        />
    </div>
</template>

<script>
    import { Plane } from "vue-curtains";
    import { fragmentShader, vertexShader } from "~/shaders/planes";
    // import VideoPlayer from '~/components/video/VideoPlayer.vue';
    import supportsCurtains from '~~/mixins/utils-device.js';
    import gsap from 'gsap';

    export default{
        components: {
            Plane,
            // VideoPlayer,
        },

        data() {
            return {
                plane: null,
                video: null,
                coverImg: null,
            }
        },

        mixins: [supportsCurtains],

        props: {
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
            onRender: {
                type: Function,
                required: true,
            },
            id: {
                type: String,
                required: false,
                default: ""
            },
            // play: {
            //     type: Boolean,
            //     required: false,
            //     default: false
            // },
            alt: {
                type: String,
                required: false,
                default: ""
            }
        },
        watch: {
            // play(val) {
            //     if(val === true) {
            //         this.video.play().then(() => {
            //             this.video.volume = 1
            //             this.video.loop = false
            //             if (this.coverImg) {
            //                 // this.coverImg.style.opacity = 0;
            //                 gsap.to(this.coverImg, {autoAlpha: 0, duration: 0.2})
            //             }
                        
            //             // Pause/Play the video when click on it
            //             if (this.video.getAttribute('click-listener') !== 'true') {
            //                 this.video.setAttribute('click-listener', 'true')
            //                 this.video.addEventListener('click', this.onClickVideo)
            //             }
            //         });
            //     } else {
            //         this.video.pause()
            //     }
            // }
        },
        
        setup(props){
            
            const isVideo = () => {
                if (!props.videoSrc)
                    return false;
                else 
                    return true;

                // let parts = {...props}.videoSrc.split('.');
                // let ext = parts[parts.length - 1];

                // switch (ext) {
                //     // case 'm4v':
                //     // case 'avi':
                //     // case 'mpg':
                //     case 'mp4':
                //     // case 'ogg':
                //     // case 'ogv':
                //     case 'webm':
                //     case 'mov':
                //     // case 'wmv':
                //     // case 'flv':
                //         return true;
                //     default:
                //         return false;
                // }
            }
            
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
                    // scale: {
                    //     name: "uScale",
                    //     type: "1f",
                    //     value: 1,
                    // },
                    
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
                    }
                },
            };
            
            return {
                planeProps,
                isVideo
            }
        },

        mounted() {
            // Need to use nextTick to be sure the DOM is loaded, specially for client-only components
            this.$nextTick(() => {
                // if (this.isVideo() === true) {
                //     this.video = this.$refs.video;
                //     this.addVideoObserver()
                // }
                this.coverImg = this.$refs.coverImg;
            })
            
            const t = {v: 0}
            gsap.to(t, {
                    v: 1,
                    duration: 0.5,
                    onComplete: () => {
                        this.onResize()
                    },
                })
            
            // this.plane.uniforms.zPos.value = this.isVideo ? 0. : 0.25;
        },

        unmounted() {
            // if (this.isVideo() === true && this.video.getAttribute('click-listener') === 'true') {
            //     this.video.removeEventListener('click', this.onClickVideo)
            // }
            window.removeEventListener('resize', this.onResize)
            //unmount curtains
        },
        
        methods: {

            // addVideoObserver() {
            //     const observer = new IntersectionObserver((entries) => {
            //         entries.forEach((entry) => {
            //             if (!entry.isIntersecting) {
            //                 this.video.pause();
            //                 this.onVideoEnded()
            //             }
            //         });

            //     });
            //     observer.observe(this.video);
            // },

            onReady(plane) {
                this.$nextTick(() => {
                    this.plane = plane
                    this.plane.images[0].style.opacity = 0

                    this.updateRatioUniforms()

                    window.addEventListener('resize', this.onResize)

                    const t = {v: 0}
                    gsap.to(t, {
                        v: 1,
                        duration: 0.1,
                        onComplete: () => {
                            this.onResize()
                        },
                    })
                })
                
            },

            updateRatioUniforms(){
                let width = this.plane.images[0].width
                let height = this.plane.images[0].height
                let nWidth = this.plane.images[0].naturalWidth
                let nHeight = this.plane.images[0].naturalHeight

                let ratio = Math.round(width/height*100)/100
                let naturalRatio = Math.round(nWidth/nHeight*100)/100
                
                this.plane.uniforms.naturalRatio.value = naturalRatio
                this.plane.uniforms.ratio.value = ratio
                this.plane.uniforms.needsRatio.value = (ratio != naturalRatio) ? 1 : 0
                // this.plane.uniforms.
                // console.log(this.plane.images[0])
                // console.log('w/h', width, height)
                // console.log('n w/h', nWidth, nHeight)
                // console.log('ratio', ratio, naturalRatio)
                // console.log(width, nWidth, this.plane.images[0].offsetWidth, this.plane.images[0].parentElement.offsetWidth)
                // console.log(height, nHeight, this.plane.images[0].offsetHeight, this.plane.images[0].parentElement.offsetHeight)
                let xRatio =  width / nWidth
                let yRatio = height / nHeight

                if(this.objectFit == 'contain')
                    this.plane.uniforms.scale.value = Math.min(xRatio, yRatio)

                // console.log('scale', this.plane.uniforms.scale.value)

            },

            onResize() {
                if(!this.plane) return
                this.plane.resize()
                if(this.plane.textures.length > 0) {
                    this.plane.textures[0].resize();
                    this.plane.textures[0].needUpdate();

                    this.updateRatioUniforms()
                }
            },

            // onClickVideo() {
            //     if (this.video.paused) {
            //         this.video.play();
            //     } else {
            //         this.video.pause();
            //     }
            // },

            // onVideoEnded() {
            //     // if (this.coverImg) {
            //     //     gsap.to(this.coverImg, {autoAlpha: 1, duration: 0.2})
            //     // }
            //     this.video.currentTime = 0;
            //     this.$emit('video-ended');
            // },
        }

    }
</script>

<style scoped lang="scss">
.plane, 
.not-plane {
    position: relative;
    width: 100%;
    height: 100%;
}

@include media-breakpoint-up(xl) {
    .plane img {
      opacity: 0;
    }
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