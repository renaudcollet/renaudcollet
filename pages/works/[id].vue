<template>
  <div ref="root" class="page">
    <ClientOnly>
      <ShaderPass 
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
      />
    </ClientOnly>
    <section class="cover-top">
      <div class="cover-top__image">
        <picture>
          <source
            :srcset="config.public.backendUrl + xxlarge"
            media="(min-width: 1600px) and (orientation: landscape)"
          />
          <source
            :srcset="config.public.backendUrl + xlarge"
            media="(orientation: landscape)"
          />
          <source
            :srcset="config.public.backendUrl + large"
            media="(min-width: 600px) and (orientation: portrait)"
          />
          <img
            :srcset="config.public.backendUrl + currentProjectCover.formats.medium.url"
            alt=""
          />
        </picture>
      </div>
      <div class="cover-top__title z-index-text">
        <div class="cover-top__title__header-minimize" data-header-scroll-minimize></div>
        <h1 
          class="cover-top__title__project scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0"
          data-scroll-reveal-duration="0.7"
        >
          {{ currentProject.attributes.titre }}
        </h1>
        <div
          class="cover-top__title__brand scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.6"
          data-scroll-reveal-duration="0.3"
        >
          Client : {{ currentProject.attributes.brand }}
        </div>
        <div
          class="cover-top__title__brand scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.8"
          data-scroll-reveal-duration="0.3"
        >
          Agency : {{ currentProject.attributes.agency }}
        </div>
        <div
          class="cover-top__title__brand scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="1.0"
          data-scroll-reveal-duration="0.3"
        >
          Filters : 
          <span v-for="(item, index) in keywords">
            {{ index < keywords.length - 1 ? `${item.attributes.key}, ` : item.attributes.key }}
          </span>
        </div>
      </div> 
    </section>
    <section class="projects">
      <template v-for="(item, index) in currentProjectBlocs">
        <WorkItemTitleResume
          v-if="item.Image.data === null && item.Video.data === null"
          :title="item.Titre"
          :content="item.Resume"
          :type="item.type"
        />
        <WorkItemBig
          v-else-if="item.type === 'Big'"
          :src="item.Image.data ? config.public.backendUrl + item.Image.data.attributes.formats.large.url : null" 
          :video-src="item.Video.data ? config.public.backendUrl + item.Video.data.attributes.url : null"
          :title="item.Titre"
          :content="item.Resume"
          :onRender="onRender"
        />
        <WorkItemSmall
          v-else-if="item.type === 'Small'"
          :index="index" 
          :src="item.Image.data ? config.public.backendUrl + item.Image.data.attributes.formats.large.url : null" 
          :video-src="item.Video.data ? config.public.backendUrl + item.Video.data.attributes.url : null"
          :content="{title: item.Titre, content: item.Resume}" 
          :class="{'right': index%4 === 0, 'left': index%4 === 2}"
          :onRender="onRender"
        />
      </template>
    </section>
    <!-- <Footer :projects="projectsFooter" :footer="footer"></Footer> -->
    <!-- <img :class="showScrollArrow ? 'active' : ''" class="scroll-arrow" src="~~/assets/svg/scroll.svg" width="50px" height="50px" alt=""> -->
  </div>
</template>
  
<script setup>
import { ShaderPass } from 'vue-curtains';
import { useDatasStore, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import useZoomableImage from '~/compositions/use-zoomable-image';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_PROJECTS);

const props = defineProps({
  scrollVelocity: {
    type: Number
  },
})

const config = useRuntimeConfig()
const route = useRoute()
// console.log('route.params.id', route.params.id);

const datasProjets = storeDatas.projects;

const currentProject = datasProjets.find(project => {
  // console.log('project.slug', `${project.attributes.slug} === ${route.params.id}`);
  return project.attributes.slug === route.params.id
})

const currentProjectCover = currentProject.attributes.cover.data.attributes
const currentProjectBlocs = currentProject.attributes.bloc
const keywords = currentProject.attributes.keywords.data

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { initZoomableImage, clearZoomableImage } = useZoomableImage();
const { 
  firstPassProps, 
  onFirstPassReady, 
  onFirstPassRender, 
  onRender, 
  updateScrollVelocity
} = useCurtainsShader();

const scrollVelocity = toRef(props, 'scrollVelocity');
watch(scrollVelocity, (newVal, oldVal) => {
  // console.log('watch scrollVelocity', newVal, oldVal);
  updateScrollVelocity(newVal)
})

const xxlarge = currentProjectCover.formats.xxlarge !== undefined ? currentProjectCover.formats.xxlarge.url : currentProjectCover.url;
const xlarge = currentProjectCover.formats.xlarge !== undefined ? currentProjectCover.formats.xlarge.url : currentProjectCover.url;
const large = currentProjectCover.formats.large !== undefined ? currentProjectCover.formats.large.url : currentProjectCover.url;

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  // gtag
  // https://developers.google.com/tag-platform/gtagjs/reference/events?hl=fr#page_view -> should I use page_view ?
  // https://github.com/johannschopplich/nuxt-gtag
  // const route = useRoute()
  // useTrackEvent('work-id-page', route.params.id)

  nextTick(() => {
    initScrollReveal(root.value)
    initZoomableImage(root.value)
  })
})

onUnmounted(() => {
  clearScrollReveal()
  clearZoomableImage()
})

// computed( paraphToLines => datasProjets.attributes.)

//   computed: {
//     paraphToLines() {
//       return this.sections[0].blocks[0].value.split('<br />');
//     },
//     paraphToLinesLength() {
//       return this.paraphToLines.length;
//     },
//   },
</script>
  
<style lang="scss" scoped>
@keyframes appearin {
  from {
    opacity: 0;
    filter: blur(30px);
    transform: scale3d(2, 2, 2);
    line-height: 5;
  }

  50% {
    opacity: 1;
  }

  // 90% {
  //   transform: scale3d(0.98, 0.98, 0.98);
  // }

  to {
    opacity: 1;
    filter: blur(0px);
    transform: scale3d(1, 1, 1);
    line-height: 1;
  }
}

.blur-effect {
  opacity: 0;
  transform-origin: left center;
  // filter: blur(30px);
  // transform: scale3d(2, 2, 2);
  // line-height: 0.5;
  animation-delay: 250ms;
  animation-duration: 1s;
  animation-name: appearin;
  animation-timing-function: ease-in-out;
  // animation-timing-function: cubic-bezier(.43,.24,.5,1.1); // Small bounce
  animation-fill-mode: forwards;
}

/**
SECTION .cover-top
**/
.cover-top {

  position: relative;
  width: 100%;
  height: 100vh;
  user-select: none;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    display: flex;
    align-items: flex-end;
  }

  &__image {
    width: 100%;
    height: calc(100vh);
    font-size: 0;
    position: absolute;
    background: black;
    clip-path: polygon(25% 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0 25%);

    img {
      width: 100%;
      height: 100%;
      pointer-events: none;
      object-fit: cover;
    }

    @include media-breakpoint-up(md) {
      height: 100vh;
    }
  }
  &__title {
    display: flex;
    position: absolute;
    bottom: 140px;
    // width: 100%;
    flex-direction: column;
    align-items: flex-start;
    font-family: $font-main;
    margin-left: 60px;

    @include media-breakpoint-up(md) {
      width: 100%;
      margin-left: 18vw;
      position: relative;
      bottom: 10vh;
    }

    @include media-breakpoint-up(xl) {
      margin-left: 300px;
      bottom: 12vh;
    }

    &__header-minimize {
      position: absolute;
      top: -30px;
    }

    &__project {
      font-weight: 700;
      font-size: 30px;
      text-align: left;
      line-height: 1;
      margin-bottom: 15px;
      padding-right: 30px;
      filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.7));

      @include media-breakpoint-up(md) {
        font-size: 40px;
        line-height: 1;
      }

      @include media-breakpoint-up(lg) {
        font-size: 60px;
        margin-bottom: 30px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 80px;
      }
    }

    &__brand {
      font-size: 12px;
      line-height: 1;
      font-weight: 500;
      margin-bottom: 5px;
      filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.5));

      @include media-breakpoint-up(md) {
        font-size: 18px;
        line-height: 1;
        letter-spacing: normal;
        margin-bottom: 10px;
        margin-left: 10px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 26px;
        margin-left: 10px;
      }
    }
  }
}
.scroll-arrow {
  position: fixed;
  width: 50px;
  height: 50px;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  z-index: 1000;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
  &.active{
    opacity: 1;
  }
}
  
.projects {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  padding-top: 50px;

  @include media-breakpoint-up(lg) {
    padding-top: 100px;  
    max-width: 1920px;
    margin: 0 auto;
  }
}

.workitem3-container {
  margin-top: 72px;

  @include media-breakpoint-up(lg) {
    margin-top: 210px;
  }
  
  @include media-breakpoint-up(xl) {
    margin-top: 210px; // 210px
  }
}
</style>