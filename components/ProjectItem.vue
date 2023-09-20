<template>
  <NuxtLink class="project-item project-item-this">
    <!-- <ClientOnly> -->
      <ImagePlane 
        data-scroll-index="0"
        :src="coverSrc" 
        object-fit="cover" 
        class="project-item__image scroll-opacity scroll-opacity--no-translate" 
      />
    <!-- </ClientOnly> -->
    <h1 class="project-item__title">
      <div v-for="(line, index) in paraphToLines" class="line">
        <div class="scroll-opacity" :data-scroll-index="index + 2">{{ line.trim() }}</div>
      </div>
    </h1>
    <div class="project-item__text scroll-reveal z-index-text" data-scroll-reveal-height data-scroll-reveal-height-delay="0.6" :data-scroll-index="2">
      <div class="project-item__alt">
        <template v-for="(item, index) in keywords">
          <h3 
            class="project-item__subtitle scroll-opacity" 
            :data-scroll-index="paraphToLines.length + index + 3"
          >
            {{ item.attributes.key }}
          </h3>
        </template>
      </div>
    </div>
    <div class="project-item__button scroll-opacity" :data-scroll-index="paraphToLines.length + keywords.length + 4">
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

const config = useRuntimeConfig()
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  datas: {
    type: Object,
    required: true,
  }
})
// onMounted(() => {
//   console.log('mounted', props.id, props.title);
//   console.log('keywords', props.keywords);
// })

const keywords = props.datas.attributes.keywords.data;

const coverSrc = config.public.backendUrl + props.datas.attributes.cover.data.attributes.formats.large.url;

const paraphToLines = computed(() => {
  return props.datas.attributes.titre.split('<br />');
})
</script>

<style lang="scss">
.project-item {
  position: relative;
  display: flex;
  margin: 0 auto 90px;
  color: #fff;
  text-decoration: none;

  @include media-breakpoint-up(lg) {
    margin-bottom: 140px;
  }

  @include media-breakpoint-up(xl) {
    margin-bottom: 200px;
  }

  svg {
    transition: transform 0.3s ease;

    polygon {
      transform-origin: center center;
      transition: transform 0.3s ease, stroke-width 0.3s ease;
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

    .cross {
      transform: translate(0, 13px);
    }
  }

  &:hover {
    svg {
      transition: transform 0.3s ease;
      transform: scale(2) translateY(-5px);
      
      @include media-breakpoint-up(lg) {
        transform: scale(2) translateY(-10px);
      }

      polygon {
        transition: transform 0.3s 0.1s ease, stroke-width 0.6s 0.1s ease;
        transform: scale(0.9);
        stroke-width: 4;
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
        stroke-width: 4;
      }

      .vert2 {
        transition: transform 0.3s 0.1s ease;
        transform-origin: center;
        transform: rotate(45deg);
        stroke-width: 4;
      }

      .vert {
        transition: transform 0.3s 0.1s ease;
        transform: translateX(10px);
      }
    }
  }
  
  &__alt {
    display: flex;
    flex-direction: column;
    background-color: rgba(5, 5, 5, 0.678);
    padding: 8px 8px 20px;

    @include media-breakpoint-up(xl) {
      padding: 15px 15px 70px;
    }
  }

  &__image {

    // because, I don't know why, scoped css is not working server side rendered for this component, the styles are not applied
    .project-item-this & {
      width: calc(100vw - 60px);
      height: 56.25vw;
      object-fit: cover;
      object-position: center;
      // position: absolute;
      z-index: -1;
      right: 0;
      top: 0;
      user-select: none;
      // clip-path: polygon(0 0, 0 75%, 25% 100%, 100% 100%, 100% 25%, 75% 0);
      clip-path: polygon(25% 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0 25%);

      @include media-breakpoint-up(lg) {
        height: 500px;
        width: 870px;
      }

      @include media-breakpoint-up(xl) {
        width: 1040px;
        height: 580px;
      }
    }
  }

  &__text {
    position: absolute;
    left: 15px;
    bottom: 0;
    margin-left: 0;
    transform: translate3d(0, 0, 0);
    // clip-path: polygon(0 0, 0 75%, 25% 100%, 100% 100%, 100% 25%, 75% 0);
    // clip-path: polygon(25% 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0 25%);

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
    position: absolute;
    bottom: 10px;
    right: 10px;

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
      bottom: 20px;
      right: 60px;

      svg {
        width: 64px;
        height: 64px;
      }
    }

    @include media-breakpoint-up(xl) {
      margin-top: 30px;
      margin-left: 20px;

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
    position: absolute;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 7px;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;
    filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.80));
    margin-top: 10px;
    margin-left: 16px;
    padding-right: 10px;

    @include media-breakpoint-up(md) {
      font-size: 7.777778vw;
      margin-bottom: 1.944444vw;
    }

    @include media-breakpoint-up(lg) {
      font-size: 62px;
      margin-bottom: 15px;
      margin-top: 20px;
      margin-left: 20px;
    }

    @include media-breakpoint-up(xl) {
      // font-size: 72px;
      font-size: 62px;
      margin-bottom: 15px;
      margin-top: 28px;
      margin-left: 30px;
    }
  }

  h3 {
    font-size: 11px;
    font-weight: 300;
    margin-bottom: 5px;
    // text-decoration: underline;

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
}
</style>