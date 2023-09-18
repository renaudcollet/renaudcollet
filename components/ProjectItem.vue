<template>
  <NuxtLink class="project-item project-item-this">
    <ClientOnly>
      <ImagePlane 
        data-scroll-index="0"
        :src="config.public.backendUrl + src.data.attributes.formats.large.url" 
        object-fit="cover" 
        class="project-item__image scroll-opacity scroll-opacity--no-translate" 
      />
    </ClientOnly>
    <div class="project-item__text z-index-text">
      <h1 class="project-item__title">
        <div v-for="(line, index) in paraphToLines" :key="index" class="line">
          <div class="scroll-opacity" :data-scroll-index="index + 2">{{ line.trim() }}</div>
        </div>
      </h1>
      <div class="project-item__alt">
        <div v-for="(item, index) in props.keywords" :key="index">
          <h3 
            class="project-item__subtitle scroll-opacity" 
            :data-scroll-index="paraphToLines.length + index + 3"
          >
            {{ item.attributes.key }}
          </h3>
        </div>
        <div class="project-item__button scroll-opacity" :data-scroll-index="paraphToLines.length + keywords.length + 4">
          <svg x="0px" y="0px" viewBox="0 0 124 124">
            <!-- <circle fill="rgb(255, 255, 255)" cx="62" cy="62" r="52" /> -->
            <polygon points="0,50 25,0 50,50" fill="#fff" stroke="#fff" stroke-width="1" />
            <rect class="horiz" fill="rgb(0, 0, 0)" x="42" y="62" width="41" height="1" />
            <g class="vert">
              <rect class="vert1" fill="rgb(0, 0, 0)" x="62" y="42" width="1" height="20" />
              <rect class="vert2" fill="rgb(0, 0, 0)" x="62" y="62" width="1" height="20" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import ImagePlane from '~/components/webgl/ImagePlane.vue';

const config = useRuntimeConfig()
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  src: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  keywords: {
    type: Array,
    required: true,
  },
})

// onMounted(() => {
//   console.log('mounted', props.id, props.title);
//   console.log('keywords', props.keywords);
// })

const paraphToLines = computed(() => {
  return props.title.split('<br />');
})
</script>

<style lang="scss">
.project-item {
  position: relative;
  display: flex;
  width: calc(100vw - 60px);
  height: 56.25vw;
  margin: 0 30px 123px;
  color: #fff;
  text-decoration: none;

  svg {
    circle {
      transition: r 0.3s ease;
      // r: 60;
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
  }

  &:hover {
    svg {
      circle {
        transition: r 0.3s ease;
        r: 60;
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
      }

      .vert2 {
        transition: transform 0.3s 0.1s ease;
        transform-origin: center;
        transform: rotate(45deg);
      }

      .vert {
        transition: transform 0.3s 0.1s ease;
        transform: translateX(10px);
      }
    }
  }

  @include media-breakpoint-up(md) {
    width: 83.333333vw;
    height: 46.851852vw;
    margin: 0 8.333333vw 34.166667vw;
  }

  @include media-breakpoint-up(lg) {
    width: 665.384615px;
    height: 269.230769px;
    margin: 0 auto 185px;
    justify-content: flex-end;

    .project-item__alt {
      display: flex;
      flex-direction: column;
      height: 115.384615px;
      position: relative;
    }
  }

  @include media-breakpoint-up(xl) {
    width: 865px;
    height: 350px;
    margin: 0 auto 185px;
    justify-content: flex-end;

    .project-item__alt {
      display: flex;
      flex-direction: column;
      height: 150px;
      position: relative;
    }
  }

  &:nth-child(even) {

    @include media-breakpoint-up(lg) {
      justify-content: flex-start;
      width: 665.384615px;

      .project-item__alt {
        width: 138.461538px;
      }

      .project-item__button {
        margin-left: 0;
        margin-right: auto;
      }
    }

    @include media-breakpoint-up(xl) {
      justify-content: flex-start;
      width: 865px;

      .project-item__alt {
        width: 180px;
      }

      .project-item__button {
        margin-left: 0;
        margin-right: auto;
      }
    }

    .project-item__text {
      margin-left: auto;
      margin-right: 30px;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      @include media-breakpoint-up(md) {
        margin-right: 8.333333vw;
      }

      @include media-breakpoint-up(lg) {
        right: 0;
        margin-right: 0;
        left: auto;
      }

      @include media-breakpoint-up(xl) {
        right: 0;
        margin-right: 0;
        left: auto;
      }
    }

    h1,
    h3 {
      text-align: right;
    }
  }

  &__image {

    // because, I don't know why, scoped css is not working server side rendered for this component, the styles are not applied
    .project-item-this & {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      position: absolute;
      z-index: -1;
      right: 0;
      top: 0;
      user-select: none;

      @include media-breakpoint-up(lg) {
        position: relative;
        order: 2;
        right: auto;
        top: auto;
        width: 100%;
        height: 269.230769px;
      }

      @include media-breakpoint-up(xl) {
        position: relative;
        order: 2;
        right: auto;
        top: auto;
        // width: 622px;
        height: 350px;
      }
    }
  }

  &__text {
    position: absolute;
    bottom: 40%;
    margin-left: 30px;
    transform: translate3d(0, 0, 0);

    @include media-breakpoint-up(md) {
      margin-left: 8.333333vw;
    }

    @include media-breakpoint-up(lg) {
      // position: relative;
      order: 1;
      bottom: 0;
      margin-left: 65.384615px;
      left: 0;
    }

    @include media-breakpoint-up(xl) {
      // position: relative;
      order: 1;
      bottom: 0;
      margin-left: 85px;
      left: 0;
    }
  }

  &__button {
    margin-top: 18px;

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
      position: absolute;
      bottom: 0;

      svg {
        width: 64px;
        height: 64px;
      }
    }

    @include media-breakpoint-up(xl) {
      margin-top: 30px;
      margin-left: 20px;
      position: absolute;
      bottom: 0;

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
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 7px;

    @include media-breakpoint-up(md) {
      font-size: 7.777778vw;
      margin-bottom: 1.944444vw;
    }

    @include media-breakpoint-up(lg) {
      font-size: 62px;
      margin-bottom: 15px;
    }

    @include media-breakpoint-up(xl) {
      // font-size: 72px;
      font-size: 62px;
      margin-bottom: 15px;
    }
  }

  h3 {
    font-size: 11px;
    font-weight: 300;
    margin-bottom: 5px;
    text-decoration: underline;

    @include media-breakpoint-up(md) {
      font-size: 3.055556vw;
      margin-bottom: 1.388889vw;
    }

    @include media-breakpoint-up(lg) {
      font-size: 12px;
      margin-bottom: 9px;
      line-height: 0.6;
    }

    @include media-breakpoint-up(xl) {
      font-size: 18px;
      margin-bottom: 9px;
      line-height: 1;
    }
  }
}</style>