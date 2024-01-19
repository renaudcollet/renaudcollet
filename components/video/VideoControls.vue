<template>    
    <ClientOnly>
        <Controls 
            ref="controls" 
            @play="togglePlay" 
            @scrub="scrubTo" 
            @fullscreen="toggleFullscreen" 
            @sound="toggleSound" 
            :showFullscreenButton="showFullscreenButton" 
        />
    </ClientOnly>
</template>

<script>
import Controls from '~/components/video/Controls.vue';
import screenfull from 'screenfull';

export default {
    name: "VideoControls",
    components: {
        Controls,
    },
    props: {
        video: {
            type: Object, //HTMLMediaElement,
            required: false,
            default: null
        },
        activate: {
            type: Boolean,
            required: false,
            default: false
        },
        supportsCurtains: {
            type: Boolean,
            required: false,
            default: true
        },
        coverImg: {
            type: Object, //HTMLElement,
            required: false,
            default: null
        },
    },
    watch: {
        activate(val) {
            if (val === true) {
                this.activateVideo()
            } else {
                this.deactivateVideo()
            }
        }
    },
    computed: {
        showFullscreenButton() {
            return screenfull.isEnabled
        }
    },
    mounted() {
        this.controls = this.$refs.controls;
        if (this.$props.activate === true) {
            this.activateVideo();
        }
    },

    unmounted() {
        this.deactivateVideo();
    },

    methods: {
        activateVideo() {
            this.controls = this.$refs.controls;
            this.raf = requestAnimationFrame(this.animate);
            this.controls.updateIcon('play', this.$props.video.paused);
            this.$props.video.addEventListener('pointermove', this.onPointerMove);
            this.$props.video.addEventListener('click', this.onClickDocument);
            this.$props.video.addEventListener('play', this.onPlayVideo)
            this.$props.video.addEventListener('pause', this.onPlayVideo)
            this.$props.video.addEventListener('ended', this.onVideoEnded)
            document.addEventListener("fullscreenchange", this.onFullscreenEvent);
            this.$props.video.volume = 1
            this.$props.video.currentTime = 0
            this.$props.video.muted = false
        },
        deactivateVideo() {
            this.$props.video.pause();
            cancelAnimationFrame(this.raf);
            this.$props.video.removeEventListener('pointermove', this.onPointerMove);
            this.$props.video.removeEventListener('click', this.onClickDocument);
            this.$props.video.removeEventListener('play', this.onPlayVideo)
            this.$props.video.removeEventListener('pause', this.onPlayVideo)
            this.$props.video.removeEventListener('ended', this.onVideoEnded)
            document.removeEventListener("fullscreenchange", this.onFullscreenEvent);
        },
        animate() {
            this.raf = requestAnimationFrame(this.animate);
            this.controls.updatePlayhead(this.$props.video.currentTime / this.$props.video.duration);
        },

        onPointerMove(e) {
            this.controls.showControls()
        },

        onClickDocument(e) {
            this.controls.showControls()
        },

        onVideoEnded() {
            this.$props.video.currentTime = 0;
            this.controls.updateIcon('play', false);
            this.$emit('ended')
        },

        onPlayVideo() {
            this.controls.updateIcon('play', !this.$props.video.paused);
            this.$emit('play')
        },

        togglePlay() {
            this.controls.updateIcon('play', this.$props.video.paused);
            if (this.$props.video.paused) {
                this.$props.video.play()
                this.$emit('play')
            } else {
                this.$props.video.pause();
                this.$emit('pause')
            }
        },

        toggleSound() {
            if (this.$props.video.volume === 0) {
                this.$props.video.volume = 1;
            } else {
                this.$props.video.volume = 0;
            }
            this.controls.updateIcon('sound', this.$props.video.volume === 0);
        },

        scrubTo(e) {
            this.$props.video.currentTime = e * this.$props.video.duration;
        },

        onFullscreenEvent() {
            if (document.fullscreenElement) {
                this.controls.updateIcon('fullscreen', false);
            } else {
                if (this.$props.supportsCurtains) {
                    // this.$props.video.style.opacity = 0;
                }
                this.controls.updateIcon('fullscreen', true);
            }
        },

        toggleFullscreen() {
            let element
            if (this.$el)
                element = this.$el.parentNode

            // console.log('TOGGLE FULLSCREEN', screenfull.isEnabled, document.fullscreenElement)
            // if fullscreen is enabled (has capabilites)
            if (screenfull.isEnabled) {
                
                if (!screenfull.isFullscreen) {
                    this.controls.updateIcon('fullscreen', true);
                    // To have the fullscreen on the canvas is problematic for controls
                    // document.querySelector('#CurtainsCanvas canvas').requestFullscreen();
                    this.$props.video.style.opacity = 1;
                    screenfull.request(element);
                } else {
                    // console.log('EXIT FULLSCREEN')
                    this.controls.updateIcon('fullscreen', false);
                    // this.$props.video.style.opacity = 1;
                    screenfull.exit();
                    // this.$emit('ended')
                }

            }

        },

    }
}

</script>