<template>
    <div class="video-component">
        <!-- <img v-if="src" :src="src" class="cover" ref="coverImg" alt=""> -->
        <video 
            :style="{'object-fit': objectFit}" 
            :src="videoSrc"
            :id="id"
            ref="video" 
            preload="auto"
            playsinline 
            webkit-playsinline
            crossorigin 
        >
            <source :src="videoSrc">
        </video>
        <VideoPlayer 
            :video="video" 
            :activate="play"
            :supportsCurtains="supportsCurtains" 
            @ended="onVideoEnded"
            @play="onVideoPlay"
            @pause="onVideoPause"
        />
      </div>
</template>

<script>
    import VideoPlayer from '~/components/video/VideoPlayer.vue';
    import supportsCurtains from '~~/mixins/utils-device.js';
    import gsap from 'gsap';

    export default {
        components: {
            VideoPlayer,
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
            }
        },
        watch: {
            play(val) {
                // console.log('Video::play', this.video)
                if(val === true) {
                    this.video.play().then(() => {
                        this.video.volume = 1
                        this.video.loop = false
                        if (this.coverImg) {
                            // this.coverImg.style.opacity = 0;
                            gsap.to(this.coverImg, {autoAlpha: 0, duration: 0.2})
                        }
                        
                        // Pause/Play the video when click on it
                        if (this.video.getAttribute('click-listener') !== 'true') {
                            this.video.setAttribute('click-listener', 'true')
                            this.video.addEventListener('click', this.onClickVideo)
                        }
                    });
                } else {
                    this.video.pause()
                }
            }
        },

        mounted() {
            // Need to use nextTick to be sure the DOM is loaded, specially for client-only components
            this.$nextTick(() => {
                this.video = this.$refs.video;
                this.addVideoObserver()
                // this.coverImg = this.$refs.coverImg;
                gsap.to(this.video, {autoAlpha: 1, duration: 0.2})
            })
        },

        unmounted() {
            if (this.video.getAttribute('click-listener') === 'true') {
                this.video.removeEventListener('click', this.onClickVideo)
            }
            window.removeEventListener('resize', this.onResize)
            //unmount curtains
        },
        
        methods: {
            addVideoObserver() {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            this.video.pause();
                            this.onVideoOutOfView()
                        }
                    });

                });
                observer.observe(this.video);
            },

            onClickVideo() {
                if (this.video.paused) {
                    this.video.play();
                } else {
                    this.video.pause();
                    this.$emit('video-paused');
                }
            },

            onVideoOutOfView() {
                this.video.currentTime = 0;
                this.$emit('video-out-of-view');
            },

            onVideoEnded() {
                // if (this.coverImg) {
                //     gsap.to(this.coverImg, {autoAlpha: 1, duration: 0.2})
                // }
                // this.video.currentTime = 0;
                this.$emit('video-ended');
            },

            onVideoPlay() {
                this.$emit('video-played');
            },

            onVideoPause() {
                this.$emit('video-paused');
            },
        }
        
    }
</script>

<style scoped lang="scss">
.video-component {
    video {
        opacity: 0;
        background-color: rgb(0, 0, 0);
    }
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