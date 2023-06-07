<template>
    <div class="not-plane">
        <img 
            :src="src" 
            :style="{'object-fit': objectFit}" 
            :alt="alt" 
            crossorigin="anonymous"
        />
    </div>
</template>

<script>
    export default{
        data() {
            return {
                plane: null,
                video: null,
                coverImg: null,
            }
        },

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
            id: {
                type: String,
                required: false,
                default: ""
            },
            alt: {
                type: String,
                required: false,
                default: ""
            }
        },
        
        methods: {}

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