<template>
  <div class="page">
    <ClientOnly>
      <ShaderPass
        v-if="supportsCurtains"
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
        ref="firstPass"
      />
    </ClientOnly>
    <section class="cover-top">
      <div class="cover-top__image">
        <picture>
          <source
            :srcset="sections[0].blocks[3].value"
            media="(min-width: 2050px) and (orientation: landscape)"
          />
          <source
            :srcset="sections[0].blocks[3].value"
            media="(orientation: landscape)"
          />
          <source
            :srcset="sections[0].blocks[4].value"
            media="(min-width: 600px) and (orientation: portrait)"
          />
          <img
            :srcset="sections[0].blocks[4].value"
            alt="Titre de l'image"
          />
        </picture>
      </div>
      <div class="cover-top__title z-index-text">
        <div class="cover-top__title__header-minimize" data-header-scroll-minimize></div>
        <h1 class="cover-top__title__brand">
          <div
            v-for="(line, index) in paraphToLines"
            :key="index"
            class="line"
          >
            <div class="scroll-opacity" :data-scroll-index="index">{{ line.trim() }}</div>
          </div> 
        </h1>
        <div
          class="cover-top__title__project scroll-opacity"
          :data-scroll-index="paraphToLinesLength + 1"
        >{{ sections[0].blocks[1].value }}</div>
        <div
          class="cover-top__title__project scroll-opacity"
          :data-scroll-index="paraphToLinesLength + 2"
        >{{ sections[0].blocks[2].value }}</div>
      </div>
    </section>
    <section class="projects">
      <WorkItem1 v-if="sections[0].blocks[7].value !== ''" :src="sections[0].blocks[8].value" :context="sections[0].blocks[7].value" :answer="sections[0].blocks[9].value" :onRender="onRender" />
      <WorkItem2 
        v-if="sections[0].blocks[13].value !== ''"
        :video-src="sections[0].blocks[14].value"
        :src="sections[0].blocks[13].value"
        :title="sections[0].blocks[11].value"
        :content="sections[0].blocks[12].value"
        :onRender="onRender" 
      />
      <div class="workitem3-container">
        <template v-for="(item, index) in items">
          <WorkItem3 
            :index="index" 
            :src="item.blocks[2].value" 
            :video-src="item.blocks[3].value"
            :content="{title: item.blocks[0].value, content: item.blocks[1].value}" 
            :class="{'right': index%4 === 0, 'left': index%4 === 2}"
            :onRender="onRender" 
          />
        </template>
      </div>
    </section>
    <Footer :projects="projectsFooter" :footer="footer"></Footer>
    <img :class="showScrollArrow ? 'active' : ''" class="scroll-arrow" src="~~/assets/svg/scroll.svg" width="50px" height="50px" alt="">
  </div>
</template>
  
<script>
  import { ShaderPass } from 'vue-curtains';
  import curtainsShader from "~/mixins/curtains-shader";
  import scrollOpacity from "~/mixins/scroll-opacity";
  import utilsDevice from '~~/mixins/utils-device.js';
  import { useDatasStore } from '~/stores/datas';
  import ImagePlane from '~/components/webgl/ImagePlane.vue';
  import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
  import gsap from 'gsap';
  
  export default {
    components: {
      ShaderPass,
      ImagePlane
    },

    data: {
      showScrollArrow: true,
    },

    setup() {
      const route = useRoute()
      const storeDatas = useDatasStore()
      const project = storeDatas.projects.find(project => project.slug === route.params.id)
      const projectsFooter = storeDatas.projects.filter(project => project.slug !== route.params.id)

      const oSeo = storeDatas.seo.sections[0]

      // I don't know why, I can't use useHead() after receiving the data from the store in the default layout
      useHead({
        // titleTemplate: '%s - Accueil',
        titleTemplate: '%s',
        meta: [
          { name: "description", content: oSeo.blocks[0].value },
          { property: 'og:description', content: oSeo.blocks[0].value },
          { property: 'og:image', content: oSeo.blocks[1].value },
        ],
        // bodyAttrs: {
        //   class: 'test'
      })
      
      return {
        project,
        projectsFooter,
        sections: project.sections,
        footer: storeDatas.footer,
        items: project.sections.slice(1),
        seo: oSeo
      }
    },

    mounted() {
      gsap.killTweensOf('#header-logo')
      gsap.to('#header-logo', { autoAlpha: 1 })

      // gtag
      // https://developers.google.com/tag-platform/gtagjs/reference/events?hl=fr#page_view -> should I use page_view ?
      // https://github.com/johannschopplich/nuxt-gtag
      const route = useRoute()
      useTrackEvent('work-id-page', route.params.id)

      window.addEventListener('scroll', this.onScroll)
    },

    unmounted(){
      window.removeEventListener('scroll', this.onScroll)
    },  

    computed: {
      paraphToLines() {
        return this.sections[0].blocks[0].value.split('<br />');
      },
      paraphToLinesLength() {
        return this.paraphToLines.length;
      },
    },

    methods: {
      onScroll() {
        let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        height -= window.innerHeight
        let scroll = winScroll / height;
        this.showScrollArrow = scroll < 1
      },
    },

    mixins: [
      curtainsShader,
      scrollOpacity,
      utilsDevice,
      scrollHeaderMinimize
    ],
  };
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
    align-items: center;
  }

  &__image {
    width: 100%;
    height: calc(100vh);
    font-size: 0;
    position: absolute;
    background: black;
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
    color: #ffffff;
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
      bottom: auto;
    }

    @include media-breakpoint-up(xl) {
      margin-left: 300px;
    }

    &__header-minimize {
      position: absolute;
      top: -30px;
    }

    &__brand {
      font-weight: 800;
      font-size: 40px;
      text-align: left;
      line-height: 1;
      margin-bottom: 20px;

      @include media-breakpoint-up(md) {
        font-size: 80px;
        line-height: 1;
      }

      @include media-breakpoint-up(lg) {
        font-size: 100px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 120px;
      }
    }

    &__project {
      font-size: 10px;
      line-height: 1;
      font-weight: 300;
      text-decoration: underline;
      margin-bottom: 5px;

      @include media-breakpoint-up(md) {
        font-size: 18px;
        line-height: 1;
        letter-spacing: normal;
        margin-bottom: 15px;
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
  // background: rgb(0,0,0);
  // background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(36,36,36,1) 100%);
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